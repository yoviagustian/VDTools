# VDTools

A web-based tool for downloading, extracting, and browsing image archives organized by year and type.

## Overview

VDTools is a full-stack application that allows users to:
- Download tar.gz archives from URLs
- Automatically extract and organize them by year and type
- Browse the extracted content through a web interface
- View organized folder structures with hierarchical navigation

## Architecture

The project consists of three main components:

### 1. Backend (`vd-backend/`)
- **Technology**: Node.js with Express
- **Port**: 4000
- **Key Features**:
  - REST API for years and folder tree listing
  - Download script execution endpoint
  - Automatic year and type extraction from filenames
  - File system operations for archive extraction

### 2. Frontend (`vd-ui/`)
- **Technology**: React
- **Port**: 3000 (development)
- **Key Features**:
  - Download form for tar.gz URLs
  - Year-based navigation
  - Hierarchical folder tree with different blue shades per level
  - Automatic refresh after downloads
  - Links to static file server for content viewing

### 3. Data Directory (`data/`)
- **Structure**: `data/years/{YEAR}/{TYPE}/{FOLDER_NAME}/`
- **Example**: `data/years/2023/PontusM/image_PontusM_2023_June_23/`
- **Static Server**: Expected to run on port 8000 for file access

## Directory Structure

```
VDTools/
├── README.md
├── data/
│   └── years/
│       ├── 2023/
│       │   └── image/
│       │       └── image_2023_June_2/
│       └── tmp/                    # Temporary files and archives
├── vd-backend/
│   ├── server.js                   # Main Express server
│   ├── script/
│   │   └── download.sh            # Download and extraction script
│   └── package.json
└── vd-ui/
    ├── src/
    │   ├── App.js                 # Main app with download form
    │   ├── YearPage.js            # Year-specific folder browser
    │   └── index.js
    └── package.json
```

## File Naming Convention

The system expects tar.gz files to follow this naming pattern:
- `image_{TYPE}_{YEAR}_{MONTH}_{DAY}.tar.gz`
- **Example**: `image_PontusM_2023_June_23.tar.gz`
- **Extraction**: Creates `2023/PontusM/image_PontusM_2023_June_23/`

## API Endpoints

### Backend API (Port 4000)
- `GET /api/years` - List all available years
- `GET /api/years/:year` - List folders in a specific year
- `GET /api/years/:year/tree` - Get hierarchical folder structure
- `POST /api/download` - Download and extract tar.gz from URL

### Static File Server (Port 8000)
- `GET /:year/:type/:folder/` - Access extracted content
- **Example**: `http://localhost:8000/2023/PontusM/image_PontusM_2023_June_23/`

## Setup and Usage

### Prerequisites
- Node.js
- Static file server running on port 8000

### Starting the Application
1. **Backend**: 
   ```bash
   cd vd-backend
   npm install
   npm start  # or node server.js
   ```

2. **Frontend**:
   ```bash
   cd vd-ui
   npm install
   npm start
   ```

3. **Static File Server**: Set up to serve `data/years/` on port 8000

### Workflow
1. Enter tar.gz URL in the web interface
2. System downloads and extracts the archive
3. Content is organized by year and type
4. Browse through hierarchical folder structure
5. Click on folders to access content via static server

## Technical Details

### Download Script (`vd-backend/script/download.sh`)
- Extracts year and type from filename using regex
- Creates appropriate directory structure
- Downloads file using curl
- Extracts tar.gz to organized location
- Returns access URL for the content

### UI Features
- **Color-coded hierarchy**: Different blue shades for each folder level
- **Automatic refresh**: Updates after successful downloads
- **Responsive design**: Clean, modern interface
- **Error handling**: User-friendly error messages

### Data Organization
- **Level 0**: Year directories (e.g., `2023/`)
- **Level 1**: Type directories (e.g., `PontusM/`)
- **Level 2**: Content directories (e.g., `image_PontusM_2023_June_23/`)

## Development Notes

- The frontend automatically refreshes the years list after downloads
- The year page refreshes when the browser tab becomes visible again
- Color scheme uses progressive blue shades for visual hierarchy
- All file operations are handled server-side for security

## Team
- yovi.a (kenangan mantan reguler less sugar)
- s.evan (kenangan mantan reguler no sugar)