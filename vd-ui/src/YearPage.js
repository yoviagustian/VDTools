import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function FolderTree({ tree, year }) {
  const [open, setOpen] = useState({});

  const handleToggle = (folderName) => {
    setOpen((prev) => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  return (
    <ul style={{ listStyle: 'none', paddingLeft: 20 }}>
      {tree.map((node) => {
        if (node.type === 'folder') {
          const url = `http://localhost:8000/${year}/${node.name}/`;
          return (
            <li key={node.name}>
              <span
                style={{ cursor: 'pointer', fontWeight: 'bold', color: '#007bff' }}
                onClick={() => handleToggle(node.name)}
              >
                {open[node.name] ? '📂' : '📁'} {node.name}
              </span>
              {open[node.name] && (
                <div style={{ marginLeft: 24, marginTop: 6 }}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#007bff', textDecoration: 'underline', fontWeight: 'normal', wordBreak: 'break-all' }}
                  >
                    {url}
                  </a>
                </div>
              )}
            </li>
          );
        } else {
          return null; // Do not show files at the top level
        }
      })}
    </ul>
  );
}

function YearPage() {
  const { year } = useParams();
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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