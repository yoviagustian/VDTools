require('dotenv').config({ path: '../.env' });
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint to list all year directories
app.get('/api/years', (req, res) => {
  const yearsDir = path.join(__dirname, '../data/years');
  fs.readdir(yearsDir, { withFileTypes: true }, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });
    const years = files.filter(f => f.isDirectory()).map(f => f.name);
    res.json(years);
  });
});

// Endpoint to list all folders inside a specific year
app.get('/api/years/:year', (req, res) => {
  const year = req.params.year;
  const yearDir = path.join(__dirname, '../data/years', year);
  fs.readdir(yearDir, { withFileTypes: true }, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });
    const folders = files.filter(f => f.isDirectory()).map(f => f.name);
    res.json(folders);
  });
});

// Helper function to recursively get folder structure (async)
function getFolderTreeAsync(dirPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, { withFileTypes: true }, async (err, items) => {
      if (err) return reject(err);
      const results = await Promise.all(items.map(async (item) => {
        const fullPath = path.join(dirPath, item.name);
        if (item.isDirectory()) {
          const children = await getFolderTreeAsync(fullPath);
          return { name: item.name, type: 'folder', children };
        } else {
          return { name: item.name, type: 'file' };
        }
      }));
      resolve(results);
    });
  });
}

// Endpoint to get full folder tree for a year (async)
app.get('/api/years/:year/tree', async (req, res) => {
  const year = req.params.year;
  const yearDir = path.join(__dirname, '../data/years', year);
  try {
    if (!fs.existsSync(yearDir)) return res.status(404).json({ error: 'Year not found' });
    const tree = await getFolderTreeAsync(yearDir);
    res.json(tree);
  } catch (err) {
    console.error('Error reading folder tree:', err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to trigger download.sh with a URL
app.post('/api/download', (req, res) => {
  const url = req.body.url;
  if (!url) return res.status(400).json({ error: 'No URL provided.' });
  const scriptPath = path.join(__dirname, 'script', 'download.sh');
  console.log('Running download.sh with URL:', url);
  const child = spawn('bash', [scriptPath, url], { cwd: __dirname });
  let output = '';
  let errorOutput = '';
  child.stdout.on('data', (data) => {
    output += data.toString();
  });
  child.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });
  child.on('close', (code) => {
    console.log('Script exited with code:', code);
    console.log('stdout:', output);
    console.log('stderr:', errorOutput);
    if (code === 0) {
      res.json({ message: output.trim() });
    } else {
      res.status(500).json({ error: errorOutput || 'Download script failed.' });
    }
  });
});

const PORT = process.env.API_PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 