import React, { useState } from 'react';

const API_BASE = window.location.origin === 'http://localhost:5173' ? 'http://localhost:3001' : '';

// Helper component for professional vector outline icons
function ChapterIcon({ name }) {
  const props = {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { display: 'block' }
  };

  switch (name) {
    case 'sprout':
      return (
        <svg {...props}>
          <path d="M12 22V12" />
          <path d="M12 12c-1.5-2.5-4-3-6-3" />
          <path d="M12 12c1.5-2.5 4-3 6-3" />
          <path d="M12 8a4 4 0 0 0-4-4 4 4 0 0 0 4 4Z" />
        </svg>
      );
    case 'heart':
      return (
        <svg {...props}>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          <path d="M12 5v14" opacity="0.4" strokeDasharray="2 2" />
        </svg>
      );
    case 'umbrella':
      return (
        <svg {...props}>
          <path d="M12 12v8a2 2 0 0 0 4 0" />
          <path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9Z" />
        </svg>
      );
    case 'lotus':
      return (
        <svg {...props}>
          <circle cx="12" cy="5" r="2.5" />
          <path d="M12 8v10" />
          <path d="M5 15c2-2 3-1 3-1s2 2 4 2 4-2 4-2 1 1 3-1" />
          <path d="M3 18c3-3 5-1 5-1s2 2 4 2 4-2 4-2 2 1 5-1" />
        </svg>
      );
    case 'flower':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="2" />
          <path d="M12 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
          <path d="M12 17a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />
          <path d="M17 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0Z" />
          <path d="M7 12a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        </svg>
      );
    case 'moon':
      return (
        <svg {...props}>
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      );
    case 'support':
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    default:
      return null;
  }
}

export default function LandingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    struggle: 'Menguruskan Stres & Tekanan Kerja'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [registeredUser, setRegisteredUser] = useState(null);
  const [expandedChapter, setExpandedChapter] = useState(0);

  const chapters = [
    {
      num: 'Bab 01',
      title: 'Apa itu self-healing sebenarnya',
      icon: 'sprout',
      desc: 'Memahami definisi sebenar pemulihan jiwa tanpa mitos popular dan bagaimana membina asas kesedaran diri.',
      quote: 'Pulih bukanlah tentang membaiki diri yang rosak, tetapi menyedari diri yang utuh di sebalik luka.',
      action: 'Senaraikan 3 perkara yang anda syukuri hari ini tanpa menghakimi perasaan anda.'
    },
    {
      num: 'Bab 02',
      title: 'Kenali luka emosi kau',
      icon: 'heart',
      desc: 'Mengenal pasti parut emosi masa lalu, memahami bagaimana tubuh bertindak balas terhadap trauma, dan langkah mula memprosesnya.',
      quote: 'Kita tidak boleh merawat luka yang kita nafikan kewujudannya.',
      action: 'Catat dalam jurnal peribadi bila emosi anda terganggu dan kenal pasti pencetus (trigger) fizikalnya.'
    },
    {
      num: 'Bab 03',
      title: 'Resilience bukan tentang kuat 24 jam',
      icon: 'umbrella',
      desc: 'Mentakrifkan semula daya tahan jiwa. Ia bukan bermaksud tidak boleh menangis, tetapi belajar bangkit semula selepas rebah.',
      quote: 'Kekuatan sejati bukanlah menahan ribut, tetapi tahu bila untuk berteduh dan menangis.',
      action: 'Beri diri anda kebenaran untuk berehat secara mental selama 30 minit hari ini tanpa sebarang rasa bersalah.'
    },
    {
      num: 'Bab 04',
      title: 'Belajar duduk dengan emosi',
      icon: 'lotus',
      desc: 'Bagaimana menghadapi kesedihan, kemarahan, dan ketakutan tanpa melarikan diri atau menindas perasaan tersebut.',
      quote: 'Emosi adalah seperti ombak; biarkan ia datang, rasakan kekuatannya, dan biarkan ia pergi perlahan-lahan.',
      action: 'Apabila cemas, amalkan teknik pernafasan dalam (pernafasan kotak) untuk menenangan sistem saraf anda.'
    },
    {
      num: 'Bab 05',
      title: 'Berlembut dengan diri sendiri',
      icon: 'flower',
      desc: 'Amalan belas kasihan diri (self-compassion) dan menolak suara kritik dalaman yang sering menyalahkan diri.',
      quote: 'Bercakaplah kepada diri anda seperti anda sedang menenangkan seorang sahabat baik yang disayangi.',
      action: 'Gantikan satu kata kritik diri dengan frasa lembut: "Saya sedang belajar, dan tidak mengapa jika saya melakukan kesilapan."'
    },
    {
      num: 'Bab 06',
      title: 'Sempadan yang menjaga kau',
      icon: 'shield',
      desc: 'Kepentingan membina batasan diri (boundaries) yang sihat dalam hubungan sosial bagi melindungi tenaga mental anda.',
      quote: 'Membina sempadan (boundaries) bermaksud anda menyayangi diri sendiri sama banyak dengan menyayangi orang lain.',
      action: 'Amalkan menolak permintaan luar secara sopan tanpa perlu memberi penjelasan yang terlalu panjang lebar.'
    },
    {
      num: 'Bab 07',
      title: 'Rutin kecil yang memulihkan',
      icon: 'moon',
      desc: 'Panduan membina mikro-rutin harian untuk kesihatan minda, penafasan, dan tidur yang berkualiti.',
      quote: 'Perubahan besar bermula daripada langkah paling kecil yang diulang secara konsisten setiap hari.',
      action: 'Jauhkan telefon pintar dan skrin sekurang-kurangnya 30 minit sebelum tidur untuk merehatkan sel minda.'
    },
    {
      num: 'Bab 08',
      title: 'Bila perlu jumpa profesional',
      icon: 'support',
      desc: 'Mengenal pasti lampu isyarat merah (red flags) kesihatan mental dan keberanian untuk mendapatkan bimbingan pakar.',
      quote: 'Mendapatkan bantuan luar bukanlah tanda kelemahan, tetapi bukti keberanian anda berjuang untuk hidup.',
      action: 'Simpan senarai talian sokongan emosi tempatan sebagai rujukan sekiranya anda memerlukan sokongan mental.'
    }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sesuatu yang salah berlaku.');
      }

      setSuccess(true);
      setRegisteredUser(data.subscriber);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="landing-container">
      {/* Top Navbar */}
      <header className="navbar glass">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">🌿</span>
            <span className="logo-text">Pulih Itu Proses</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container">
        
        {/* Hero Section */}
        <section className="hero fade-in">
          <div className="hero-text-side">
            <span className="badge">EBOOK KESIHATAN MINDA PERCUMA</span>
            <h1>Pulih tidak bermaksud luka itu hilang, tetapi ia tidak lagi mengawal hidup anda.</h1>
            <p className="hero-desc">
              Pelajari langkah-langkah praktikal untuk berdamai dengan masa lalu, 
              mengurus stres harian, dan membina semula kekuatan diri yang sejati 
              melalui panduan yang ditulis khas untuk jiwa yang ingin sembuh.
            </p>

            <div className="bullet-points">
              <div className="bullet">
                <span className="bullet-icon">✦</span>
                <p>Panduan memahami fasa-fasa pemulihan emosi</p>
              </div>
              <div className="bullet">
                <span className="bullet-icon">✦</span>
                <p>Amalan ringkas 5 minit sehari untuk ketenangan</p>
              </div>
              <div className="bullet">
                <span className="bullet-icon">✦</span>
                <p>Latihan refleksi diri untuk mengurus kebimbangan</p>
              </div>
            </div>

            <div style={{ marginTop: '32px' }}>
              <a href="#download-section" className="btn btn-primary">
                Dapatkan Ebook Percuma 📥
              </a>
            </div>
          </div>

          <div className="hero-visual-side">
            <div className="book-card-container">
              <div className="book-shadow"></div>
              <img 
                src="/cover.png" 
                alt="Kulit Ebook Pulih Itu Proses" 
                className="book-cover-img"
              />
            </div>
          </div>
        </section>

        {/* Ebook Chapters / Inside Look (Healing Journey Map) */}
        <section className="highlights-section fade-in">
          <div className="section-title">
            <h2>Peta Kembara Pemulihan</h2>
            <p>Ebook "Pulih Itu Proses" dirancang sebagai satu kembara langkah demi langkah. Klik fasa di bawah untuk meneroka bimbingan dan langkah praktikal:</p>
          </div>

          <div className="journey-grid">
            {/* Left Side: Interactive Timeline Path */}
            <div className="journey-timeline">
              <div className="journey-line"></div>
              {chapters.map((ch, idx) => {
                const isActive = expandedChapter === idx;
                return (
                  <button
                    key={idx}
                    className={`journey-node-container ${isActive ? 'active' : ''}`}
                    onClick={() => setExpandedChapter(idx)}
                    type="button"
                  >
                    <div className="journey-node-icon-circle">
                      <span className="node-icon"><ChapterIcon name={ch.icon} /></span>
                    </div>
                    <div className="journey-node-label">
                      <span className="node-num">{ch.num}</span>
                      <span className="node-title">{ch.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Side: Showcase Guide Chest Card */}
            <div className="journey-showcase glass">
              <div className="showcase-header">
                <span className="showcase-num">{chapters[expandedChapter].num}</span>
                <h2>{chapters[expandedChapter].title}</h2>
              </div>
              <div className="showcase-content">
                <p className="showcase-desc">{chapters[expandedChapter].desc}</p>
                
                <div className="showcase-quote">
                  <span className="quote-mark">“</span>
                  <p className="quote-text">{chapters[expandedChapter].quote}</p>
                </div>

                <div className="showcase-action">
                  <h4>✍️ Langkah Praktikal Hari Ini:</h4>
                  <p>{chapters[expandedChapter].action}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About the Author Section */}
        <section className="author-section fade-in">
          <div className="author-card glass">
            <div className="author-avatar-container">
              <svg viewBox="0 0 100 100" className="author-svg-avatar" width="120" height="120">
                <defs>
                  <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8EA897" />
                    <stop offset="100%" stopColor="#5F7D6A" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="48" fill="url(#avatarGrad)" opacity="0.15" />
                <circle cx="50" cy="45" r="42" fill="none" stroke="url(#avatarGrad)" strokeWidth="1.5" />
                <circle cx="50" cy="38" r="16" fill="url(#avatarGrad)" />
                <path d="M50,58 C32,58 22,70 22,82 C22,84 24,86 26,86 L74,86 C76,86 78,84 78,82 C78,70 68,58 50,58 Z" fill="url(#avatarGrad)" />
                <path d="M46,38 L54,38 M50,34 L50,42" stroke="#FAF9F6" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="author-info">
              <span className="author-subtitle">KENALI PENULIS ANDA</span>
              <h2>Dr. Syahmi</h2>
              <span className="author-title-tag">Doktor Kesihatan Jiwa</span>
              <p className="author-bio">
                Sebagai seorang doktor kesihatan jiwa, saya sering bertemu dengan individu yang bergelut secara senyap dalam menguruskan beban emosi mereka. Buku **"Pulih Itu Proses"** ini ditulis khas sebagai sebuah panduan permulaan yang lembut dan praktikal.
              </p>
              <p className="author-bio">
                Tujuan saya adalah untuk membantu anda memahami fasa kesembuhan dari sudut pandang klinikal dan kemanusiaan, supaya anda tahu bahawa anda tidak berjalan sendirian dalam proses pemulihan ini.
              </p>
            </div>
          </div>
        </section>

        {/* Lead Magnet / Form Section */}
        <section id="download-section" className="form-section">
          {!success ? (
            <div className="form-card glass fade-in">
              <h2>Muat Turun Naskhah Anda Sekarang</h2>
              <p className="form-subtitle">
                Isi borang di bawah untuk menerima ebook "Pulih Itu Proses" secara percuma dan mulakan langkah pemulihan anda hari ini.
              </p>

              {error && (
                <div className="alert alert-error">
                  <span>⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Nama Penuh</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    placeholder="Masukkan nama anda"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email">Alamat E-mel</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    placeholder="contoh@emel.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="struggle">Apakah cabaran terbesar anda ketika ini?</label>
                  <select
                    id="struggle"
                    name="struggle"
                    className="form-select"
                    value={formData.struggle}
                    onChange={handleChange}
                  >
                    <option value="Menguruskan Stres & Tekanan Kerja">Menguruskan Stres & Tekanan Kerja</option>
                    <option value="Mengatasi Rasa Cemas & Kebimbangan">Mengatasi Rasa Cemas & Kebimbangan</option>
                    <option value="Memulihkan Semangat & Keyakinan Diri">Memulihkan Semangat & Keyakinan Diri</option>
                    <option value="Mencari Ketenangan Harian & Kualiti Tidur">Mencari Ketenangan Harian & Kualiti Tidur</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? 'Menghantar...' : 'Hantarkan Ebook Saya Sekarang 🌿'}
                </button>
              </form>
            </div>
          ) : (
            <div className="success-card glass fade-in">
              <div className="success-icon">✨</div>
              <h2>Pendaftaran Berjaya, {registeredUser?.name}!</h2>
              <p className="success-message">
                Naskhah digital **"Pulih Itu Proses"** sedang dihantar secara automatik terus ke e-mel **{registeredUser?.email}**.
              </p>

              <div className="simulated-notice">
                <h4>💡 Sila semak peti masuk e-mel anda:</h4>
                <p>
                  E-mel alu-aluan berserta lampiran fail PDF ebook akan tiba dalam masa seminit. Sila semak folder inbox atau folder spam/promosi anda jika e-mel lambat diterima.
                </p>
              </div>
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer>
        <div className="container footer-content">
          <p>© {new Date().getFullYear()} Pulih Itu Proses. Hak Cipta Terpelihara.</p>
          <p className="footer-sub">Ditulis dengan penuh empati dan kasih sayang untuk membimbing anda pulih.</p>
        </div>
      </footer>
    </div>
  );
}
