#!/bin/bash

# Serve the data/years directory on port 8000
cd ../data/years && python3 -m http.server 8000 &
cd - > /dev/null

# Run the Node.js backend server
node server.js