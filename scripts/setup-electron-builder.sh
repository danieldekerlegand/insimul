#!/bin/bash

# Install electron-builder globally for the server
echo "Installing electron-builder globally..."
npm install -g electron-builder

# Verify installation
echo "Verifying electron-builder installation..."
electron-builder --version

echo "Electron builder setup complete!"
