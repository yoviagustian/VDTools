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
      const url = `http://localhost:8000/${year}/${fullPath}/`;
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

  const fetchTree = () => {
    setLoading(true);
    fetch(`http://localhost:4000/api/years/${year}/tree`)
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', padding: '20px 0' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
        <div style={{ 
          background: '#2a2a2a', 
          padding: isMobile ? '24px 16px' : '32px 24px', 
          borderRadius: isMobile ? 12 : 16, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)', 
          border: '1px solid #404040', 
          width: '100%',
          boxSizing: 'border-box'
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
  );
}

export default YearPage; 