# vd-backend

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Run the backend server:**
   ```sh
   node server.js
   ```

The server will start on [http://localhost:4000](http://localhost:4000).

## API Endpoints
- `POST /api/download` — Download and extract a tar.gz from a URL using the script.
- `GET /api/years` — List all year directories.
- `GET /api/years/:year` — List all folders inside a specific year.
- `GET /api/years/:year/tree` — Get the folder tree for a year.

## Notes
- Make sure you have Node.js and npm installed.
- The download script is located at `script/download.sh` and must be executable (`chmod +x script/download.sh`). 