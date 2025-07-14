#!/bin/bash

# Usage: ./download.sh <url>

set -e

# Delay for 5 seconds
sleep 5

if [ -z "$1" ]; then
  echo "Usage: $0 <url>"
  exit 1
fi

URL="$1"
FILENAME=$(basename "$URL")
# Extract year from filename (e.g., image_2023_June_2.tar.gz -> 2023)
YEAR=$(echo "$FILENAME" | grep -oE '[0-9]{4}')

if [ -z "$YEAR" ]; then
  echo "Could not extract year from filename: $FILENAME"
  exit 1
fi

# Get the folder name (remove .tar.gz)
FOLDER_NAME=$(basename "$FILENAME" .tar.gz)

TARGET_DIR="../data/years/$YEAR"
mkdir -p "$TARGET_DIR"

# Download the file silently, only show error if it fails
if ! curl -fsSL "$URL" -o "$FILENAME"; then
  echo "File does not exist or could not be downloaded. Check your URL."
  exit 1
fi

# Extract the tar.gz into the target directory
 tar -xzvf "$FILENAME" -C "$TARGET_DIR"

# Optionally, remove the downloaded tar.gz
rm "$FILENAME"

# Print the link in the format http://localhost:8000/<year>/<folder>/
echo "http://localhost:8000/$YEAR/$FOLDER_NAME/"
