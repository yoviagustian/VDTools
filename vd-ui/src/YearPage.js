import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function FolderTree({ tree, year }) {
  const [open, setOpen] = useState({});

  const handleToggle = (folderName) => {
    setOpen((prev) => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  const getColorForLevel = (level) => {
    const blueShades = ['#64b5f6', '#42a5f5', '#2196f3', '#1976d2', '#1565c0'];
    return blueShades[level % blueShades.length];
  };

  const renderFolder = (node, basePath = '', level = 0) => {
    if (node.type === 'folder') {
      const fullPath = basePath ? `${basePath}/${node.name}` : node.name;
      // const url = `http://107.102.187.30:8000/${year}/${fullPath}/`;
      const url = `${process.env.REACT_APP_FILE_SERVER_URL || 'http://localhost:8000'}/${year}/${fullPath}/`;
      const hasSubfolders = node.children && node.children.some(child => child.type === 'folder');
      const color = getColorForLevel(level);
      
      return (
        <li key={fullPath}>
          <span
            style={{ cursor: 'pointer', fontWeight: 'bold', color }}
            onClick={() => handleToggle(fullPath)}
          >
            {open[fullPath] ? '📂' : '📁'} {node.name}
          </span>
          {open[fullPath] && (
            <div style={{ marginLeft: window.innerWidth < 768 ? 16 : 24, marginTop: 6 }}>
              {hasSubfolders ? (
                <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                  {node.children.filter(child => child.type === 'folder').map(child => 
                    renderFolder(child, fullPath, level + 1)
                  )}
                </ul>
              ) : (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    color: color, 
                    textDecoration: 'underline', 
                    fontWeight: 'normal', 
                    wordBreak: 'break-all',
                    fontSize: window.innerWidth < 768 ? 12 : 14,
                    opacity: 0.9,
                    lineHeight: window.innerWidth < 768 ? 1.4 : 1.6
                  }}
                >
                  {url}
                </a>
              )}
            </div>
          )}
        </li>
      );
    }
    return null;
  };

  return (
    <ul style={{ listStyle: 'none', paddingLeft: window.innerWidth < 768 ? 12 : 20, margin: 0 }}>
      {tree.map((node) => renderFolder(node))}
    </ul>
  );
}

function YearPage() {
  const { year } = useParams();
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [shootingStars, setShootingStars] = useState([]);

  const fetchTree = () => {
    setLoading(true);
    // fetch(`http://107.102.187.30:4000/api/years/${year}/tree`)
    fetch(`${process.env.REACT_APP_API_SERVER_URL || 'http://localhost:4000'}/api/years/${year}/tree`)
      .then(res => res.json())
      .then(data => {
        setTree(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setTree([]);
        setError('Failed to load folder tree');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTree();
    
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
      // Schedule next star between 4-9 seconds
      const nextDelay = 4000 + Math.random() * 5000;
      setTimeout(createRandomShootingStar, nextDelay);
    };
    
    // Start the first shooting star after 3 seconds
    setTimeout(createRandomShootingStar, 3000);
  }, [year]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchTree();
      }
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
    };
  }, [year]);

  return (
    <>
      <style>{`
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
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px', position: 'relative', zIndex: 2 }}>
        <div style={{ 
          background: 'rgba(26, 26, 46, 0.4)', 
          padding: isMobile ? '24px 16px' : '32px 24px', 
          borderRadius: isMobile ? 16 : 20, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(26,26,46,0.3)', 
          border: '1px solid rgba(255,255,255,0.1)', 
          width: '100%',
          boxSizing: 'border-box',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ 
            color: '#e0e0e0', 
            fontSize: isMobile ? 20 : 24, 
            fontWeight: '600', 
            marginBottom: isMobile ? 16 : 24, 
            textAlign: 'center',
            wordBreak: 'break-word'
          }}>Year: {year}</h2>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#b0b0b0', padding: 20 }}>Loading folder tree...</div>
          ) : error ? (
            <div style={{ color: '#e57373', textAlign: 'center', padding: 20 }}>{error}</div>
          ) : tree.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#b0b0b0', padding: 20 }}>No folders or files found.</div>
          ) : (
            <FolderTree tree={tree} year={year} />
          )}
        </div>
        </div>
      </div>
    </>
  );
}

export default YearPage; 