import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());



// Configure Nodemailer SMTP Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || '', // cth: smtp.gmail.com
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true untuk port 465, false untuk 587
  auth: {
    user: process.env.SMTP_USER || '', // e-mel SMTP anda
    pass: process.env.SMTP_PASS || ''  // kata laluan aplikasi SMTP anda
  }
});

const sendActualEmail = async (to, subject, textBody) => {
  // Sekiranya maklumat SMTP tidak lengkap, kita hanya simulasikan di log
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[SIMULASI DISPATCH] Ke: ${to} | Subjek: ${subject}`);
    return { simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Dr. Syahmi | Pulih Itu Proses" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: textBody
    });
    console.log(`[E-MEL SEBENAR DIHANTAR] Ke: ${to} | MessageID: ${info.messageId}`);
    return { simulated: false, messageId: info.messageId };
  } catch (error) {
    console.error(`[E-MEL GAGAL DIHANTAR] Ke: ${to} | Ralat:`, error.message);
    throw error;
  }
};

// Initialize SQLite database
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Gagal menyambung ke pangkalan data SQLite:', err.message);
  } else {
    console.log('Berjaya menyambung ke pangkalan data SQLite.');
    createTables();
  }
});

function createTables() {
  db.serialize(() => {
    // Table for subscribers
    db.run(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        struggle TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table for simulated emails
    db.run(`
      CREATE TABLE IF NOT EXISTS simulated_emails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subscriber_id INTEGER,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        sent_days_offset INTEGER NOT NULL,
        status TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subscriber_id) REFERENCES subscribers (id) ON DELETE CASCADE
      )
    `);
  });
}



// Function to forward subscriber data to Google Sheets Webhook
const forwardToGoogleSheets = async (name, email, struggle) => {
  const url = process.env.GOOGLE_SHEETS_URL;
  if (!url) {
    console.log('[GOOGLE SHEETS] GOOGLE_SHEETS_URL is not set. Skipping forward.');
    return;
  }

  try {
    console.log(`[GOOGLE SHEETS] Sending subscriber data to webhook: ${url}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        struggle,
        timestamp: new Date().toISOString()
      }),
      redirect: 'follow'
    });
    
    console.log(`[GOOGLE SHEETS] Sent successfully. Status: ${response.status}`);
  } catch (error) {
    console.error('[GOOGLE SHEETS] Failed to forward data:', error.message);
  }
};

// Route to register a subscriber
app.post('/api/subscribe', (req, res) => {
  const { name, email, struggle } = req.body;

  if (!name || !email || !struggle) {
    res.status(400).json({ error: 'Sila lengkapkan nama, e-mel dan pilihan cabaran anda.' });
    return;
  }

  // Insert subscriber
  const insertSubscriber = db.prepare('INSERT INTO subscribers (name, email, struggle) VALUES (?, ?, ?)');
  insertSubscriber.run(name, email, struggle, function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'E-mel ini telah pun didaftarkan!' });
      } else {
        res.status(500).json({ error: err.message });
      }
      return;
    }

    const subscriberId = this.lastID;

    // Define simulated emails in Malay
    const emails = [
      {
        subject: `Selamat Datang ke Perjalanan Pulih Itu Proses 🌿 [Ebook Muat Turun]`,
        body: `Hai ${name},\n\nTerima kasih kerana memuat turun ebook "Pulih Itu Proses". Saya sangat berbesar hati dapat berkongsi naskhah ini dengan anda.\n\nDalam ebook ini, anda akan menemui langkah-langkah praktikal untuk menghadapi fasa-fasa sukar dalam hidup dan bagaimana membina semula ketenangan diri.\n\n📥 Klik pautan di bawah untuk muat turun ebook anda:\n[Pautan Muat Turun Ebook PDF]\n\nHarapan saya, penulisan ini sedikit sebanyak dapat menemani perjalanan pemulihan anda. Kita bersua lagi dalam e-mel susulan beberapa hari lagi!\n\nSalam mesra,\nPenulis Ebook "Pulih Itu Proses"`,
        sent_days_offset: 0,
        status: 'Telah Dihantar'
      },
      {
        subject: `Bagaimana dengan Bab 1? Minda anda adalah keutamaan... 💬 (Hari ke-3)`,
        body: `Hai ${name},\n\nSudah tiga hari berlalu sejak anda memuat turun "Pulih Itu Proses". Saya harap anda sempat membaca Bab 1 tentang "Mengenali Luka Emosi".\n\nUntuk makluman anda, memandangkan anda memilih cabaran "${struggle}", fasa mengenali emosi ini amat penting. Pemulihan tidak bermaksud kita melupakan, tetapi kita belajar berdamai dengan kenyataan.\n\nSatu latihan kecil untuk hari ini:\nTarik nafas selama 4 saat, tahan selama 4 saat, dan hembus perlahan-lahan selama 4 saat. Ulangi sebanyak 3 kali.\n\nBagaimana pendapat anda setakat ini? Sila balas e-mel ini jika ingin berkongsi.\n\nSalam hangat,\nPenulis Ebook`,
        sent_days_offset: 3,
        status: 'Dijadualkan'
      },
      {
        subject: `Soalan ikhlas daripada saya tentang 'Pulih Itu Proses' 🌻 (Hari ke-7)`,
        body: `Hai ${name},\n\nGenap seminggu perjalanan anda bersama ebook ini.\n\nBagaimana bab terakhir membantu anda membina kekuatan diri baharu? Saya sangat ingin mendengar maklum balas anda untuk terus mempertingkatkan penulisan ini.\n\nJika anda rasa penulisan ini membantu anda menguruskan cabaran "${struggle}", kongsi pendapat anda dengan membalas e-mel ini.\n\nJika anda memerlukan bimbingan tambahan, saya juga ada menyediakan sesi perkongsian mingguan secara kecil-kecilan. Beritahu saya jika anda berminat!\n\nSemoga hari anda dipenuhi ketenangan,\nPenulis Ebook`,
        sent_days_offset: 7,
        status: 'Dijadualkan'
      }
    ];

    // Insert simulated emails
    const insertEmail = db.prepare('INSERT INTO simulated_emails (subscriber_id, subject, body, sent_days_offset, status) VALUES (?, ?, ?, ?, ?)');
    
    let completedCount = 0;
    const insertedEmails = [];

    emails.forEach(emailItem => {
      insertEmail.run(subscriberId, emailItem.subject, emailItem.body, emailItem.sent_days_offset, emailItem.status, function (err) {
        if (err) {
          console.error('Gagal memasukkan e-mel simulasi:', err.message);
        } else {
          insertedEmails.push({
            id: this.lastID,
            subject: emailItem.subject,
            body: emailItem.body,
            offset: emailItem.sent_days_offset
          });
        }

        completedCount++;
        if (completedCount === emails.length) {
          insertEmail.finalize();

          // Send the welcome email (Day 0) immediately in the background
          const welcomeEmail = insertedEmails.find(e => e.offset === 0);
          if (welcomeEmail) {
            sendActualEmail(email, welcomeEmail.subject, welcomeEmail.body)
              .then((result) => {
                if (result && !result.simulated) {
                  db.run('UPDATE simulated_emails SET status = ? WHERE id = ?', ['Telah Dihantar', welcomeEmail.id]);
                }
              })
              .catch(sendErr => {
                console.error('Ralat menghantar e-mel alu-aluan:', sendErr.message);
                db.run('UPDATE simulated_emails SET status = ? WHERE id = ?', ['Gagal Dihantar', welcomeEmail.id]);
              });
          }

          // Forward to Google Sheets if webhook URL exists
          forwardToGoogleSheets(name, email, struggle);

          res.status(201).json({
            message: 'Pendaftaran berjaya!',
            subscriber: { id: subscriberId, name, email, struggle }
          });
        }
      });
    });
  });
  insertSubscriber.finalize();
});



// Serve static assets from React frontend dist (for production)
const distPath = path.resolve(__dirname, '../frontend/dist');
app.use(express.static(distPath));

// All other GET requests redirect to React's index.html (SPA routing)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.resolve(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Frontend build not found. Please build the frontend first.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server sedang berjalan di port ${PORT}`);
});
