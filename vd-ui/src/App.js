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
    navigate(`/year/${year}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f7f7f7' }}>
      <h1 style={{ fontSize: 32, fontWeight: 'bold', color: '#333', marginBottom: 24 }}>Niuless</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Enter your image url"
          style={{ padding: 10, fontSize: 16, border: '1px solid #ccc', borderRadius: 4, minWidth: 500 }}
        />
        <button type="submit" style={{ padding: '10px 20px', fontSize: 16, borderRadius: 4, border: 'none', background: '#007bff', color: '#fff', cursor: 'pointer' }}>
          Submit
        </button>
      </form>
      {loadingDownload && (
        <div style={{ marginTop: 12, color: '#007bff' }}>Processing, please wait...</div>
      )}
      {message && !loadingDownload && (
        <div style={{ marginTop: 12, color: message.type === 'success' ? 'green' : 'red' }}>
          {message.type === 'success' && message.text.startsWith('http') ? (
            <a href={message.text} target="_blank" rel="noopener noreferrer" style={{ color: 'green', textDecoration: 'underline' }}>{message.text}</a>
          ) : (
            message.text
          )}
        </div>
      )}
      <div style={{ marginTop: 32, background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h3>List of existing images</h3>
        {loading ? (
          <div>Loading years...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', gap: 16 }}>
            {years.map(year => (
              <li key={year}>
                <button onClick={() => handleYearClick(year)} style={{ background: 'none', border: 'none', color: '#007bff', fontSize: 18, cursor: 'pointer', textDecoration: 'underline' }}>{year}</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ marginTop: 48, maxWidth: 600, background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: 18, marginBottom: 10 }}>How to Use</h3>
        <ol style={{ fontSize: 13, margin: 0, paddingLeft: 20 }}>
          <li>Paste your URL (image.tar.gz) in the box and click submit</li>
          <li>Wait until the download is done</li>
          <li>Once the download is done, the link will appear</li>
          <li>Please copy it or you can find it in the list of years</li>
          <li>Go to SERET Mode on the TV</li>
          <li>Run this command "NIU.sh RW"</li>
          <li>Follow the instructions and then paste the link that you copied</li>
        </ol>
      </div>
      <div style={{ marginTop: 24, fontSize: 12, color: '#888', textAlign: 'center' }}>
        <div>Powered by:</div>
        <div>yovi.a <span style={{ fontStyle: 'italic' }}>(kenangan-mantan reguler less-sugar)</span></div>
        <div>s.evan <span style={{ fontStyle: 'italic' }}>(kenangan-mantan reguler no-sugar)</span></div>
      </div>
    </div>
  );
}

export default App;
