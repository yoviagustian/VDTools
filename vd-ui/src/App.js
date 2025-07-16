import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [shootingStars, setShootingStars] = useState([]);
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
    
    // Create random shooting stars
    const createShootingStar = () => {
      const id = Date.now() + Math.random();
      const startY = Math.random() * 50; // Random top position 0-50%
      const newStar = {
        id,
        startY,
        duration: 2000 + Math.random() * 2000, // 2-4 seconds
      };
      
      setShootingStars(prev => [...prev, newStar]);
      
      // Remove star after animation
      setTimeout(() => {
        setShootingStars(prev => prev.filter(star => star.id !== id));
      }, newStar.duration);
    };
    
    // Create shooting stars at random intervals
    const createRandomShootingStar = () => {
      createShootingStar();
      // Schedule next star between 3-8 seconds
      const nextDelay = 3000 + Math.random() * 5000;
      setTimeout(createRandomShootingStar, nextDelay);
    };
    
    // Start the first shooting star after 2 seconds
    setTimeout(createRandomShootingStar, 2000);
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
    <>
      <style>{`
        @keyframes titleMove {
          0% {
            transform: translateY(0px) scale(1);
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
          }
          25% {
            transform: translateY(-3px) scale(1.01);
            text-shadow: 0 4px 8px rgba(255,255,255,0.1);
          }
          50% {
            transform: translateY(-5px) scale(1.02);
            text-shadow: 0 6px 12px rgba(255,255,255,0.2), 0 0 20px rgba(255,255,255,0.1);
          }
          75% {
            transform: translateY(-3px) scale(1.01);
            text-shadow: 0 4px 8px rgba(255,255,255,0.1);
          }
          100% {
            transform: translateY(0px) scale(1);
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
          }
        }
        
        @keyframes twinkle {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
        
        @keyframes shootingStar {
          0% {
            transform: translateX(-100px) translateY(-100px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(100vw) translateY(100vh);
            opacity: 0;
          }
        }
        
        .random-shooting-star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 0 6px 2px rgba(255,255,255,0.8);
          animation: shootingStar linear;
          left: -100px;
        }
        
        .stars {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }
        
        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: twinkle 2s infinite;
        }
        
        .star:nth-child(1) { top: 10%; left: 20%; width: 1px; height: 1px; animation-delay: 0s; }
        .star:nth-child(2) { top: 20%; left: 80%; width: 2px; height: 2px; animation-delay: 0.5s; }
        .star:nth-child(3) { top: 30%; left: 60%; width: 1px; height: 1px; animation-delay: 1s; }
        .star:nth-child(4) { top: 40%; left: 30%; width: 1px; height: 1px; animation-delay: 1.5s; }
        .star:nth-child(5) { top: 50%; left: 90%; width: 2px; height: 2px; animation-delay: 2s; }
        .star:nth-child(6) { top: 60%; left: 10%; width: 1px; height: 1px; animation-delay: 0.3s; }
        .star:nth-child(7) { top: 70%; left: 70%; width: 1px; height: 1px; animation-delay: 0.8s; }
        .star:nth-child(8) { top: 80%; left: 40%; width: 2px; height: 2px; animation-delay: 1.3s; }
        .star:nth-child(9) { top: 90%; left: 85%; width: 1px; height: 1px; animation-delay: 1.8s; }
        .star:nth-child(10) { top: 15%; left: 50%; width: 1px; height: 1px; animation-delay: 0.2s; }
        .star:nth-child(11) { top: 25%; left: 15%; width: 1px; height: 1px; animation-delay: 0.7s; }
        .star:nth-child(12) { top: 35%; left: 75%; width: 2px; height: 2px; animation-delay: 1.2s; }
        .star:nth-child(13) { top: 45%; left: 25%; width: 1px; height: 1px; animation-delay: 1.7s; }
        .star:nth-child(14) { top: 55%; left: 95%; width: 1px; height: 1px; animation-delay: 0.1s; }
        .star:nth-child(15) { top: 65%; left: 5%; width: 1px; height: 1px; animation-delay: 0.6s; }
        .star:nth-child(16) { top: 75%; left: 65%; width: 2px; height: 2px; animation-delay: 1.1s; }
        .star:nth-child(17) { top: 85%; left: 35%; width: 1px; height: 1px; animation-delay: 1.6s; }
        .star:nth-child(18) { top: 95%; left: 80%; width: 1px; height: 1px; animation-delay: 0.4s; }
        .star:nth-child(19) { top: 5%; left: 45%; width: 1px; height: 1px; animation-delay: 0.9s; }
        .star:nth-child(20) { top: 12%; left: 88%; width: 2px; height: 2px; animation-delay: 1.4s; }
        
      `}</style>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)', padding: '20px 0', position: 'relative' }}>
        <div className="stars">
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          {shootingStars.map(star => (
            <div
              key={star.id}
              className="random-shooting-star"
              style={{
                top: `${star.startY}%`,
                animationDuration: `${star.duration}ms`
              }}
            />
          ))}
        </div>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 className="moving-title" style={{ 
            fontSize: 48, 
            fontWeight: 'bold', 
            color: '#fff', 
            marginBottom: 8, 
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            animation: 'titleMove 3s ease-in-out infinite',
            transition: 'all 0.3s ease'
          }}>Niuless...</h1>
          <p style={{ fontSize: 18, color: '#b0b0b0', margin: 0 }}>Easy image archive downloader and organizer</p>
        </div>
        
        <div style={{ 
          background: 'rgba(26, 26, 46, 0.4)', 
          padding: 32, 
          borderRadius: 20, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(26,26,46,0.3)', 
          marginBottom: 32, 
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
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
                  border: '2px solid rgba(255,255,255,0.2)', 
                  borderRadius: 12, 
                  transition: 'all 0.3s',
                  outline: 'none',
                  background: 'rgba(26, 26, 46, 0.6)',
                  color: '#e0e0e0',
                  boxSizing: 'border-box',
                  backdropFilter: 'blur(8px)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(0,123,255,0.8)';
                  e.target.style.background = 'rgba(26, 26, 60, 0.8)';
                  e.target.style.boxShadow = '0 0 15px rgba(0,123,255,0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.target.style.background = 'rgba(26, 26, 46, 0.6)';
                  e.target.style.boxShadow = 'none';
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
        
        <div style={{ 
          background: 'rgba(26, 26, 46, 0.4)', 
          padding: 24, 
          borderRadius: 20, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(26,26,46,0.3)', 
          marginBottom: 32, 
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
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
                    background: 'rgba(26, 26, 80, 0.6)', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    color: '#e0e0e0', 
                    fontSize: 16, 
                    fontWeight: '600',
                    cursor: 'pointer', 
                    padding: '12px 24px',
                    borderRadius: 12,
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), 0 0 10px rgba(26,26,80,0.3)',
                    backdropFilter: 'blur(8px)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.6), 0 0 20px rgba(26,26,80,0.5)';
                    e.target.style.background = 'rgba(26, 26, 100, 0.8)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4), 0 0 10px rgba(26,26,80,0.3)';
                    e.target.style.background = 'rgba(26, 26, 80, 0.6)';
                  }}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ 
          background: 'rgba(26, 26, 46, 0.4)', 
          padding: 24, 
          borderRadius: 20, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(26,26,46,0.3)', 
          marginBottom: 32, 
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
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
        
        <div style={{ 
          background: 'rgba(26, 26, 46, 0.3)', 
          padding: 20, 
          borderRadius: 16, 
          textAlign: 'center', 
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontSize: 14, color: '#b0b0b0', marginBottom: 8 }}>Powered by:</div>
          <div style={{ fontSize: 13, color: '#888' }}>
            <div>yovi.a <span style={{ fontStyle: 'italic' }}>(kenangan-mantan reguler less-sugar)</span></div>
            <div>s.evan <span style={{ fontStyle: 'italic' }}>(kenangan-mantan reguler no-sugar)</span></div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default App;
