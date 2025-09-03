#!/bin/bash

# Function to cleanup background processes
cleanup() {
    echo "Stopping all services..."
    if [[ ! -z "$BACKEND_PID" ]]; then
        kill -TERM "$BACKEND_PID" 2>/dev/null
        wait "$BACKEND_PID" 2>/dev/null
    fi
    if [[ ! -z "$UI_PID" ]]; then
        kill -TERM "$UI_PID" 2>/dev/null
        wait "$UI_PID" 2>/dev/null
    fi
    if [[ ! -z "$HTTP_PID" ]]; then
        kill -TERM "$HTTP_PID" 2>/dev/null
        wait "$HTTP_PID" 2>/dev/null
    fi
    echo "All services stopped."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM EXIT

echo "Installing dependencies..."

# Build vd-backend
cd vd-backend && npm install
if [ $? -ne 0 ]; then
    echo "Failed to install backend dependencies"
    exit 1
fi

# Build vd-ui
cd ../vd-ui && npm install
if [ $? -ne 0 ]; then
    echo "Failed to install frontend dependencies"
    exit 1
fi

echo "Starting services..."

# Start backend
cd ../vd-backend
npm start &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"

# Start frontend
cd ../vd-ui
npm start &
UI_PID=$!
echo "Frontend started (PID: $UI_PID)"

# Start file server
cd ../data/years
python3 -m http.server 8000 &
HTTP_PID=$!
echo "HTTP server started (PID: $HTTP_PID)"

echo "All services are running. Press Ctrl+C to stop all services."

# Wait for all background processes
wait