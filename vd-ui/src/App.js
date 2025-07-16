import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function App() {
  const [input, setInput] = useState('');
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const navigate = useNavigate();

  const fetchYears = () => {
    fetch('http://localhost:4000/api/years')
      .then(res => res.json())
      .then(data => {
        setYears(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setYears([]);
        setError('Failed to load years');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!input.trim()) return;
    setLoadingDownload(true);
    try {
      const res = await fetch('http://localhost:4000/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: input })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Download and extraction successful.' });
        fetchYears(); // Refresh years list after successful download
      } else {
        setMessage({ type: 'error', text: data.error || 'Download failed.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network or server error.' });
    }
    setLoadingDownload(false);
    setInput('');
  };

  const handleYearClick = (year) => {
    navigate(`/${year}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', padding: '20px 0' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 48, fontWeight: 'bold', color: '#fff', marginBottom: 8, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Niuless</h1>
          <p style={{ fontSize: 18, color: '#b0b0b0', margin: 0 }}>Easy image archive downloader and organizer</p>
        </div>
        
        <div style={{ background: '#2a2a2a', padding: 32, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', marginBottom: 32, border: '1px solid #404040' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 16, fontWeight: '600', color: '#e0e0e0', marginBottom: 8 }}>
                Image Archive URL
              </label>
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="https://example.com/image_Type_2023_June_23.tar.gz"
                className="dark-input"
                style={{ 
                  width: '100%', 
                  padding: '14px 16px', 
                  fontSize: 16, 
                  border: '2px solid #505050', 
                  borderRadius: 8, 
                  transition: 'all 0.3s',
                  outline: 'none',
                  background: '#1a1a1a',
                  color: '#e0e0e0',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#007bff';
                  e.target.style.background = '#222';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#505050';
                  e.target.style.background = '#1a1a1a';
                }}
              />
            </div>
            <button 
              type="submit" 
              disabled={loadingDownload}
              style={{ 
                padding: '14px 28px', 
                fontSize: 16, 
                fontWeight: '600',
                borderRadius: 8, 
                border: 'none', 
                background: loadingDownload ? '#404040' : 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)', 
                color: '#fff', 
                cursor: loadingDownload ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                transform: loadingDownload ? 'none' : 'translateY(0)',
                boxShadow: loadingDownload ? 'none' : '0 4px 12px rgba(0,123,255,0.4)'
              }}
              onMouseOver={(e) => {
                if (!loadingDownload) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(0,123,255,0.6)';
                }
              }}
              onMouseOut={(e) => {
                if (!loadingDownload) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,123,255,0.4)';
                }
              }}
            >
              {loadingDownload ? 'Processing...' : 'Download & Extract'}
            </button>
          </form>
          {loadingDownload && (
            <div style={{ marginTop: 16, padding: 12, background: '#1a3d5c', borderRadius: 8, color: '#64b5f6', textAlign: 'center', border: '1px solid #2196f3' }}>
              <div style={{ fontSize: 14, fontWeight: '600' }}>Processing, please wait...</div>
            </div>
          )}
          {message && !loadingDownload && (
            <div style={{ 
              marginTop: 16, 
              padding: 12, 
              borderRadius: 8, 
              background: message.type === 'success' ? '#1b3b1b' : '#3d1a1a',
              border: `1px solid ${message.type === 'success' ? '#4caf50' : '#f44336'}`,
              color: message.type === 'success' ? '#81c784' : '#e57373'
            }}>
              {message.type === 'success' && message.text.startsWith('http') ? (
                <a href={message.text} target="_blank" rel="noopener noreferrer" style={{ color: '#81c784', textDecoration: 'underline', fontWeight: '600' }}>
                  {message.text}
                </a>
              ) : (
                message.text
              )}
            </div>
          )}
        </div>
        
        <div style={{ background: '#2a2a2a', padding: 24, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', marginBottom: 32, border: '1px solid #404040' }}>
          <h3 style={{ fontSize: 20, fontWeight: '600', color: '#e0e0e0', marginBottom: 16, textAlign: 'center' }}>Existing Images</h3>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#b0b0b0', padding: 20 }}>Loading years...</div>
          ) : error ? (
            <div style={{ color: '#e57373', textAlign: 'center', padding: 20 }}>{error}</div>
          ) : (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              {years.map(year => (
                <button 
                  key={year}
                  onClick={() => handleYearClick(year)} 
                  style={{ 
                    background: 'linear-gradient(135deg, #424242 0%, #616161 100%)', 
                    border: '1px solid #555', 
                    color: '#e0e0e0', 
                    fontSize: 16, 
                    fontWeight: '600',
                    cursor: 'pointer', 
                    padding: '12px 24px',
                    borderRadius: 8,
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.6)';
                    e.target.style.background = 'linear-gradient(135deg, #515151 0%, #757575 100%)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
                    e.target.style.background = 'linear-gradient(135deg, #424242 0%, #616161 100%)';
                  }}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ background: '#2a2a2a', padding: 24, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', marginBottom: 32, border: '1px solid #404040' }}>
          <h3 style={{ fontSize: 20, fontWeight: '600', color: '#e0e0e0', marginBottom: 16, textAlign: 'center' }}>How to Use</h3>
          <ol style={{ fontSize: 15, margin: 0, paddingLeft: 24, color: '#b0b0b0', lineHeight: 1.6 }}>
            <li style={{ marginBottom: 8 }}>Paste your URL (image.tar.gz) in the box and click submit</li>
            <li style={{ marginBottom: 8 }}>Wait until the download is done</li>
            <li style={{ marginBottom: 8 }}>Once the download is done, the link will appear</li>
            <li style={{ marginBottom: 8 }}>Please copy it or you can find it in the list of years</li>
            <li style={{ marginBottom: 8 }}>Go to SERET Mode on the TV</li>
            <li style={{ marginBottom: 8 }}>Run this command "NIU.sh RW"</li>
            <li style={{ marginBottom: 8 }}>Follow the instructions and then paste the link that you copied</li>
          </ol>
        </div>
        
        <div style={{ background: 'rgba(42,42,42,0.8)', padding: 20, borderRadius: 12, textAlign: 'center', border: '1px solid #555' }}>
          <div style={{ fontSize: 14, color: '#b0b0b0', marginBottom: 8 }}>Powered by:</div>
          <div style={{ fontSize: 13, color: '#888' }}>
            <div>yovi.a <span style={{ fontStyle: 'italic' }}>(kenangan-mantan reguler less-sugar)</span></div>
            <div>s.evan <span style={{ fontStyle: 'italic' }}>(kenangan-mantan reguler no-sugar)</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
