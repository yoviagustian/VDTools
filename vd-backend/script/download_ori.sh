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
# Extract year from filename (e.g., image_PontusM_2023_June_23.tar.gz -> 2023)
YEAR=$(echo "$FILENAME" | grep -oE '[0-9]{4}')

if [ -z "$YEAR" ]; then
  echo "Could not extract year from filename: $FILENAME"
  exit 1
fi

# Get the folder name (remove .tar.gz)
FOLDER_NAME=$(basename "$FILENAME" .tar.gz)

# Extract type from filename (e.g., image_PontusM_2023_June_23.tar.gz -> PontusM)
# Match pattern: image_<TYPE>_<YEAR>_...
TYPE=$(echo "$FILENAME" | sed -n 's/image_\([^_]*\)_[0-9]\{4\}.*/\1/p')

if [ -z "$TYPE" ]; then
  echo "Could not extract type from filename: $FILENAME"
  exit 1
fi

TARGET_DIR="../data/years/$YEAR/$TYPE"
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

# Print the link in the format http://localhost:8000/<year>/<type>/<folder>/
echo "http://localhost:8000/$YEAR/$TYPE/$FOLDER_NAME/"
