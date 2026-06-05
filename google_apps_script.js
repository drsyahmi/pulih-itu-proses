/**
 * Google Apps Script Web App Webhook untuk "Pulih Itu Proses"
 * 
 * Skrip ini akan:
 * 1. Menerima data pendaftaran daripada laman web.
 * 2. Menyimpan data tersebut ke dalam Google Sheets secara automatik.
 * 3. Menghantar e-mel alu-aluan berserta lampiran fail PDF Ebook yang diambil dari Google Drive anda.
 * 
 * PANDUAN PENYEDIAAN:
 * -------------------
 * A. Muat Naik PDF Ebook ke Google Drive:
 *    1. Muat naik fail PDF Ebook "Pulih Itu Proses" anda ke Google Drive.
 *    2. Dapatkan ID fail tersebut (cth: klik kanan fail > Share > Copy link. ID fail adalah bahagian panjang di dalam link tersebut, 
 *       seperti: https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view -> ID fail ialah "1A2B3C4D5E6F7G8H9I0J").
 *    3. Tampalkan ID fail tersebut ke dalam pembolehubah `EBOOK_FILE_ID` di bawah (gantikan 'MASUKKAN_ID_FAIL_DI_SINI').
 * 
 * B. Deploy Kod:
 *    1. Buka Google Sheets > Extensions > Apps Script.
 *    2. Gantikan semua kod di dalam Editor dengan kod di bawah.
 *    3. Klik Save (ikon disket).
 *    4. Klik Deploy > New deployment.
 *    5. Pilih type "Web app". Setkan:
 *       - Description: Pulih Itu Proses Webhook & Email Auto-responder
 *       - Execute as: Me (e-mel Google anda)
 *       - Who has access: Anyone
 *    6. Klik Deploy, luluskan kebenaran (Authorize Access) dan salin "Web app URL" baharu untuk diletakkan di Render (`GOOGLE_SHEETS_URL`).
 */

// GANTIKAN DENGAN ID FAIL GOOGLE DRIVE BAHARU ANDA
const EBOOK_FILE_ID = '135RZV3z64kRoKpgLZAgn9WNJR14G1Lm_';

function doPost(e) {
  try {
    // Membaca data JSON yang dihantar dari pelayan backend Render
    var data = JSON.parse(e.postData.contents);
    
    // Dapatkan helaian (sheet) aktif dalam spreadsheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Cipta pengepala (Headers) secara automatik sekiranya helaian masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Tarikh & Masa", "Nama Penuh", "Alamat E-mel", "Cabaran Utama"]);
      // Format pengepala menjadi tebal (bold) dan berwarna sage green
      sheet.getRange(1, 1, 1, 4)
           .setFontWeight("bold")
           .setBackground("#8EA897")
           .setFontColor("#FFFFFF");
    }
    
    // Tambah baris baharu dengan data pelanggan ke dalam Google Sheets
    sheet.appendRow([
      data.timestamp ? formatTimestamp(data.timestamp) : new Date(),
      data.name,
      data.email,
      data.struggle
    ]);
    
    // --- HANTAR E-MEL ALIU-ALUAN BERSERTA LAMPIRAN PDF ---
    var subject = "Hadiah Ketenangan Untuk Anda: Ebook Pulih Itu Proses 🌻";
    var emailBody = "Hai " + data.name + ",\n\n" +
      "Terima kasih kerana mendaftar untuk mendapatkan ebook \"Pulih Itu Proses\". Kehadiran naskhah ini di peti masuk anda adalah permulaan kepada fasa baharu kehidupan anda yang lebih tenang.\n\n" +
      "Saya tahu anda kini sedang berusaha menguruskan cabaran \"" + data.struggle + "\". Kadang-kala, kita terlalu sibuk menjaga orang lain sehingga kita terlupa untuk menjaga diri sendiri. Ebook ini ditulis khas untuk membantu anda membina semula daya tahan jiwa (resilience) secara praktikal.\n\n" +
      "Ebook PDF anda sedia dibaca sebagai lampiran e-mel ini. Berikut adalah tiga perkara utama yang akan anda pelajari:\n" +
      "1. Redefinisi Kuat: Mengapa menangis dan berehat itu juga adalah sebahagian daripada kekuatan sejati.\n" +
      "2. Langkah Praktikal Jurnal: Latihan ringkas untuk menulis refleksi bagi menguraikan benang emosi yang berselubung di minda.\n" +
      "3. Lampu Merah Kesihatan Jiwa: Bila waktu terbaik untuk anda mencari bantuan profesional.\n\n" +
      "Saya berharap panduan klinikal dan kemanusiaan ini dapat membantu anda membina kualiti tidur, mengurangkan stres harian, dan berdamai dengan fasa pemulihan anda sendiri.\n\n" +
      "Ingatlah, pulih bukanlah satu destinasi yang cepat, tetapi ia adalah satu proses yang indah untuk dilalui hari demi hari.\n\n" +
      "Selamat meneroka kembara pemulihan anda!\n\n" +
      "Salam hormat,\n" +
      "Dr. Syahmi\n" +
      "Doktor Kesihatan Jiwa & Penulis";

    var attachment = null;
    if (EBOOK_FILE_ID && EBOOK_FILE_ID !== 'MASUKKAN_ID_FAIL_DI_SINI') {
      try {
        attachment = DriveApp.getFileById(EBOOK_FILE_ID);
      } catch (err) {
        console.error("Gagal mendapatkan fail PDF dari Drive (Sila sahkan ID fail):", err.toString());
      }
    }

    if (attachment) {
      // Hantar e-mel dengan lampiran PDF
      GmailApp.sendEmail(data.email, subject, emailBody, {
        attachments: [attachment.getAs(MimeType.PDF)],
        name: "Dr. Syahmi | Pulih Itu Proses"
      });
      console.log("E-mel berserta lampiran PDF berjaya dihantar ke: " + data.email);
    } else {
      // Hantar e-mel sahaja (sekiranya ID fail belum disetkan atau salah)
      var warningBody = emailBody + "\n\n" +
        "--------------------------------------------------\n" +
        "💡 Nota Sistem: Fail PDF ebook sedang disediakan dan akan dihantar dalam e-mel susulan. Sila hubungi kami jika anda tidak menerimanya.";
        
      GmailApp.sendEmail(data.email, subject, warningBody, {
        name: "Dr. Syahmi | Pulih Itu Proses"
      });
      console.log("Amaran: ID fail Google Drive tidak sah. E-mel dihantar TANPA lampiran ke: " + data.email);
    }

    // Beri respon balas kejayaan kepada pelayan Render
    return ContentService.createTextOutput(JSON.stringify({ "status": "success", "message": "Data disimpan dan e-mel telah dihantar" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Rekod ralat sekiranya berlaku masalah
    console.error("Ralat memproses pendaftaran webhook:", error.toString());
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Fungsi pembantu untuk memformat masa ke zon waktu Malaysia (GMT+8)
function formatTimestamp(isoString) {
  try {
    var date = new Date(isoString);
    return Utilities.formatDate(date, "GMT+8", "yyyy-MM-dd HH:mm:ss");
  } catch (err) {
    return new Date();
  }
}

// ==========================================
// 💡 FUNGSI KEBENARAN MANUAL (AUTHORIZATION)
// ==========================================
// Sila pilih fungsi "triggerAuthorization" pada bar menu atas editor Apps Script, 
// kemudian klik butang "Run" (ikon Play) untuk meluluskan kebenaran Gmail & Drive.
function triggerAuthorization() {
  Logger.log("Mencetuskan kebenaran Gmail dan Drive...");
  try {
    var file = DriveApp.getFileById(EBOOK_FILE_ID);
    Logger.log("Akses Google Drive berjaya. Nama fail: " + file.getName());
    
    GmailApp.sendEmail(Session.getActiveUser().getEmail(), "Ujian Kebenaran Webhook 🌿", "Tahniah! Skrip anda telah mendapat kebenaran penuh.");
    Logger.log("E-mel ujian berjaya dihantar ke peti masuk anda (" + Session.getActiveUser().getEmail() + ").");
  } catch (err) {
    Logger.log("Ralat semasa ujian kebenaran: " + err.toString());
  }
}
