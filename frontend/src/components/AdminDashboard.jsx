import React, { useState, useEffect } from 'react';

const API_BASE = window.location.origin === 'http://localhost:5173' ? 'http://localhost:3001' : '';

export default function AdminDashboard({ onToggleLanding }) {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loginError, setLoginError] = useState('');
  
  const [subscribers, setSubscribers] = useState([]);
  const [emails, setEmails] = useState([]);
  const [stats, setStats] = useState({ totalSubscribers: 0, struggleStats: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('subscribers'); // 'subscribers' | 'emails'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmail, setSelectedEmail] = useState(null); // for modal view

  // Check stored passcode on mount
  useEffect(() => {
    const storedPasscode = localStorage.getItem('admin_passcode');
    if (storedPasscode) {
      setPasscode(storedPasscode);
      checkAndFetch(storedPasscode);
    } else {
      setCheckingAuth(false);
    }
  }, []);

  const checkAndFetch = async (token) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: token })
      });

      if (response.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('admin_passcode', token);
        await fetchData(token);
      } else {
        localStorage.removeItem('admin_passcode');
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Ralat pengesahan:', err);
    } finally {
      setCheckingAuth(false);
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/admin/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('admin_passcode', passcode);
        fetchData(passcode);
      } else {
        setLoginError(data.error || 'Kata laluan salah.');
      }
    } catch (err) {
      setLoginError('Ralat sambungan ke pelayan.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_passcode');
    setPasscode('');
    setIsAuthenticated(false);
    setSubscribers([]);
    setEmails([]);
    setStats({ totalSubscribers: 0, struggleStats: [] });
  };

  const fetchData = async (token = passcode) => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [subRes, emailRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/subscribers`, { headers }),
        fetch(`${API_BASE}/api/emails`, { headers }),
        fetch(`${API_BASE}/api/stats`, { headers })
      ]);

      if (subRes.status === 401 || subRes.status === 403) {
        handleLogout();
        return;
      }

      const subsData = await subRes.json();
      const emailsData = await emailRes.json();
      const statsData = await statsRes.json();

      setSubscribers(subsData);
      setEmails(emailsData);
      setStats(statsData);
    } catch (err) {
      console.error('Ralat ketika memuat turun data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscriber = async (id) => {
    if (!window.confirm('Adakah anda pasti mahu memadam pelanggan ini? Semua simulasi e-mel berkaitan juga akan dipadam.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/subscribers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${passcode}` }
      });

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }

      if (response.ok) {
        fetchData();
      } else {
        alert('Gagal memadam pelanggan.');
      }
    } catch (err) {
      console.error('Ralat ketika memadam:', err);
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      alert('Tiada data pelanggan untuk dieksport.');
      return;
    }

    const headers = ['ID', 'Nama', 'E-mel', 'Cabaran', 'Tarikh Langganan'];
    const rows = subscribers.map(s => [
      s.id,
      s.name.replace(/"/g, '""'),
      s.email.replace(/"/g, '""'),
      s.struggle.replace(/"/g, '""'),
      s.created_at
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pelanggan_pulih_itu_proses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubscribers = subscribers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.struggle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTopStruggle = () => {
    if (!stats.struggleStats || stats.struggleStats.length === 0) return 'Tiada data';
    const top = [...stats.struggleStats].sort((a, b) => b.count - a.count)[0];
    return `${top.struggle} (${top.count})`;
  };

  if (checkingAuth) {
    return (
      <div className="empty-state">
        <p>Memulakan sambungan selamat...</p>
      </div>
    );
  }

  // Display Login Page if not Authenticated
  if (!isAuthenticated) {
    return (
      <div className="login-wrapper">
        <div className="login-card glass fade-in">
          <div className="login-icon">🔒</div>
          <h2>Akses Terhad Pentadbir</h2>
          <p className="form-subtitle">
            Sila masukkan kata laluan pengesahan untuk mengakses data pelanggan dan log e-mel simulasi.
          </p>

          {loginError && (
            <div className="alert alert-error">
              <span>⚠️</span> {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Kata Laluan Pentadbir</label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="Masukkan kata laluan"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
              />
            </div>
            <div className="login-actions">
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? 'Mengesahkan...' : 'Log Masuk 🔑'}
              </button>
              <button type="button" className="btn btn-secondary w-full" onClick={onToggleLanding}>
                ⬅️ Kembali ke Laman Utama
              </button>
            </div>
          </form>
          
          <div style={{ marginTop: '20px', fontSize: '12px', color: 'var(--color-text-light)' }}>
            <p>💡 Tip Simulasi: Kata laluan lalai ialah <strong>drsyahmi123</strong></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Top Navbar */}
      <header className="navbar glass">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">⚙️</span>
            <span className="logo-text">Dashboard Admin</span>
          </div>
          <div className="nav-actions" style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary nav-btn" onClick={onToggleLanding}>
              ⬅️ Halaman Utama
            </button>
            <button className="btn btn-secondary nav-btn" style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }} onClick={handleLogout}>
              🚪 Log Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="container dashboard-main">
        {/* Dashboard Stats */}
        <section className="stats-section fade-in">
          <div className="stat-card">
            <h3>Jumlah Pelanggan</h3>
            <div className="stat-value">{stats.totalSubscribers}</div>
            <p>jiwa menyertai perjalanan pemulihan</p>
          </div>

          <div className="stat-card">
            <h3>Cabaran Terbanyak</h3>
            <div className="stat-value-text">{getTopStruggle()}</div>
            <p>isu utama pelanggan yang berdaftar</p>
          </div>

          <div className="stat-card">
            <h3>Jumlah E-mel Terjeda / Dihantar</h3>
            <div className="stat-value">
              {emails.filter(e => e.status === 'Telah Dihantar').length} / {emails.length}
            </div>
            <p>simulasi e-mel yang telah diproses</p>
          </div>
        </section>

        {/* Dashboard Tabs & Controls */}
        <section className="dashboard-content fade-in">
          <div className="controls-row">
            <div className="tabs-container">
              <button 
                className={`tab-btn ${activeTab === 'subscribers' ? 'active' : ''}`}
                onClick={() => setActiveTab('subscribers')}
              >
                👥 Senarai Pelanggan ({subscribers.length})
              </button>
              <button 
                className={`tab-btn ${activeTab === 'emails' ? 'active' : ''}`}
                onClick={() => setActiveTab('emails')}
              >
                📬 Outbox E-mel Simulasi ({emails.length})
              </button>
            </div>

            <div className="actions-container">
              {activeTab === 'subscribers' && (
                <>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Cari nama, e-mel, cabaran..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="btn btn-accent" onClick={handleExportCSV}>
                    📥 Eksport CSV
                  </button>
                </>
              )}
              <button className="btn btn-secondary" onClick={() => fetchData(passcode)} disabled={loading}>
                🔄 Muat Semula Data
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Memuatkan data dari pangkalan data SQLite...</div>
          ) : activeTab === 'subscribers' ? (
            /* Tab: Subscribers List */
            <div className="table-card glass">
              {filteredSubscribers.length === 0 ? (
                <div className="empty-state">Tiada pelanggan ditemui. Cubalah mendaftar di Laman Utama!</div>
              ) : (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nama</th>
                        <th>Alamat E-mel</th>
                        <th>Cabaran Utama</th>
                        <th>Tarikh Melanggan</th>
                        <th style={{ textAlign: 'center' }}>Tindakan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubscribers.map((s) => (
                        <tr key={s.id}>
                          <td>#{s.id}</td>
                          <td><strong>{s.name}</strong></td>
                          <td>{s.email}</td>
                          <td>
                            <span className="badge-struggle">{s.struggle}</span>
                          </td>
                          <td>{new Date(s.created_at).toLocaleString('ms-MY')}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button 
                              className="btn-delete"
                              onClick={() => handleDeleteSubscriber(s.id)}
                            >
                              🗑️ Padam
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Tab: Simulated Outbox Emails */
            <div className="table-card glass">
              {emails.length === 0 ? (
                <div className="empty-state">Tiada e-mel yang dijadualkan. Sila daftarkan pengguna baru terlebih dahulu.</div>
              ) : (
                <div className="email-grid">
                  <div className="email-list-panel">
                    {emails.map((e) => (
                      <div 
                        key={e.id} 
                        className={`email-item ${selectedEmail?.id === e.id ? 'selected' : ''}`}
                        onClick={() => setSelectedEmail(e)}
                      >
                        <div className="email-item-header">
                          <span className="email-recipient">Untuk: {e.subscriber_name}</span>
                          <span className={`email-status-badge ${e.status === 'Telah Dihantar' ? 'sent' : 'scheduled'}`}>
                            {e.status}
                          </span>
                        </div>
                        <h4 className="email-subject">{e.subject}</h4>
                        <div className="email-meta">
                          <span>📧 {e.subscriber_email}</span>
                          <span>⏳ {e.sent_days_offset === 0 ? 'Serta-merta' : `Hari ke-${e.sent_days_offset}`}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="email-preview-panel glass">
                    {selectedEmail ? (
                      <div className="email-preview-content">
                        <div className="preview-header">
                          <h3>Previu E-mel Automatik</h3>
                          <div className="preview-detail">
                            <p><strong>Penerima:</strong> {selectedEmail.subscriber_name} ({selectedEmail.subscriber_email})</p>
                            <p><strong>Subjek:</strong> {selectedEmail.subject}</p>
                            <p><strong>Status Penghantaran:</strong> <span className={`email-status-badge ${selectedEmail.status === 'Telah Dihantar' ? 'sent' : 'scheduled'}`}>{selectedEmail.status}</span></p>
                            <p><strong>Kelewatan:</strong> {selectedEmail.sent_days_offset === 0 ? 'Dihantar secara automatik selepas langganan' : `Dihantar secara automatik pada Hari ke-${selectedEmail.sent_days_offset}`}</p>
                          </div>
                        </div>
                        <hr className="preview-divider" />
                        <div className="preview-body">
                          {selectedEmail.body.split('\n').map((line, i) => (
                            <p key={i} style={{ marginBottom: line.trim() === '' ? '12px' : '4px' }}>
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="empty-preview">
                        <span>📬</span>
                        <p>Pilih e-mel dari senarai kiri untuk memaparkan previu surat susulan lengkap dalam Bahasa Melayu.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
