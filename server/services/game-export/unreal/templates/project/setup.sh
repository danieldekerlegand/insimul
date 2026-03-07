#!/bin/bash
set -e

echo "========================================"
echo "Insimul UE5 Project Setup"
echo "========================================"

# Detect UE5 installation
UE_ENGINE_DIR="${UE_ENGINE_DIR:-/Users/Shared/Epic Games/UE_5.5}"
if [ ! -d "$UE_ENGINE_DIR" ]; then
    UE_ENGINE_DIR="/Users/Shared/Epic Games/UE_5.4"
fi

if [ ! -d "$UE_ENGINE_DIR" ]; then
    echo "ERROR: Could not find UE5 installation"
    echo "Set UE_ENGINE_DIR environment variable to your UE5 install path"
    exit 1
fi

echo "Using UE5: $UE_ENGINE_DIR"
PROJECT_PATH="$(pwd)/InsimulExport.uproject"

# Step 1: Build C++ modules
echo ""
echo "Step 1/2: Building C++ modules..."
"$UE_ENGINE_DIR/Engine/Build/BatchFiles/RunUBT.sh" InsimulExportEditor Mac Development "-project=$PROJECT_PATH"

# Step 2: Run CreateLevel commandlet to generate MainWorld.umap
echo ""
echo "Step 2/2: Generating MainWorld.umap..."
"$UE_ENGINE_DIR/Engine/Binaries/Mac/UnrealEditor-Cmd" "$PROJECT_PATH" -run=CreateLevel -unattended -nosplash -nopause

echo ""
echo "========================================"
echo "Setup complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Open InsimulExport.uproject in Unreal Editor"
echo "  2. Open Content/Maps/MainWorld"
echo "  3. Press Play to test the game"
echo ""
