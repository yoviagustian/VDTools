import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function FolderTree({ tree, year }) {
  const [open, setOpen] = useState({});

  const handleToggle = (folderName) => {
    setOpen((prev) => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  const getColorForLevel = (level) => {
    const blueShades = ['#003d82', '#136dccff', '#007bffff', '#4da6ff', '#99ccff'];
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
            <div style={{ marginLeft: 24, marginTop: 6 }}>
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
                  style={{ color, textDecoration: 'underline', fontWeight: 'normal', wordBreak: 'break-all' }}
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
    <ul style={{ listStyle: 'none', paddingLeft: 20 }}>
      {tree.map((node) => renderFolder(node))}
    </ul>
  );
}

function YearPage() {
  const { year } = useParams();
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [year]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f7f7f7' }}>
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', minWidth: 400 }}>
        <h2>Year: {year}</h2>
        {loading ? (
          <div>Loading folder tree...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : tree.length === 0 ? (
          <div>No folders or files found.</div>
        ) : (
          <FolderTree tree={tree} year={year} />
        )}
      </div>
    </div>
  );
}

export default YearPage; 