#!/bin/bash

# Download CC0 Character Models Script
# Downloads curated CC0-licensed models from Quaternius and organizes them
#
# Usage: bash server/scripts/download-models.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ASSETS_DIR="$PROJECT_ROOT/client/public/assets"
TEMP_DIR="$PROJECT_ROOT/.temp-downloads"

echo "🎮 CC0 Model Downloader"
echo "========================"
echo ""
echo "Assets directory: $ASSETS_DIR"
echo ""

# Create directories
mkdir -p "$ASSETS_DIR/characters/generic"
mkdir -p "$ASSETS_DIR/characters/medieval"
mkdir -p "$ASSETS_DIR/characters/scifi"
mkdir -p "$ASSETS_DIR/containers"
mkdir -p "$ASSETS_DIR/markers"
mkdir -p "$TEMP_DIR"

# Function to download and extract zip
download_and_extract() {
    local url="$1"
    local name="$2"
    local extract_dir="$TEMP_DIR/$name"
    
    echo "⬇️  Downloading $name..."
    
    if command -v curl &> /dev/null; then
        curl -L -o "$TEMP_DIR/$name.zip" "$url" --progress-bar
    elif command -v wget &> /dev/null; then
        wget -O "$TEMP_DIR/$name.zip" "$url" --show-progress
    else
        echo "❌ Neither curl nor wget found. Please install one."
        return 1
    fi
    
    echo "📦 Extracting $name..."
    mkdir -p "$extract_dir"
    unzip -q -o "$TEMP_DIR/$name.zip" -d "$extract_dir"
    
    echo "✅ $name ready"
}

# Function to copy GLB files
copy_model() {
    local src="$1"
    local dest="$2"
    
    if [ -f "$src" ]; then
        cp "$src" "$dest"
        echo "  ✅ Copied $(basename "$dest")"
    else
        echo "  ⚠️  Source not found: $src"
    fi
}

echo ""
echo "📥 Downloading Quaternius Ultimate Modular Characters..."
echo "   (CC0 License - https://quaternius.com)"
echo ""

# Download Ultimate Modular Characters
if download_and_extract "https://quaternius.com/packs/ultimatemodularcharacters/UltimateModularCharacters.zip" "modular-characters"; then
    # Find and copy character models
    MODULAR_DIR=$(find "$TEMP_DIR/modular-characters" -type d -name "GLB" | head -1)
    if [ -n "$MODULAR_DIR" ] && [ -d "$MODULAR_DIR" ]; then
        echo ""
        echo "📂 Copying character models..."
        
        # Copy available characters (names may vary in pack)
        for glb in "$MODULAR_DIR"/*.glb; do
            if [ -f "$glb" ]; then
                filename=$(basename "$glb")
                # Map to our naming convention
                case "$filename" in
                    *Male*.glb|*male*.glb)
                        copy_model "$glb" "$ASSETS_DIR/characters/generic/player_male.glb"
                        ;;
                    *Female*.glb|*female*.glb)
                        copy_model "$glb" "$ASSETS_DIR/characters/generic/player_female.glb"
                        ;;
                    *Knight*.glb|*knight*.glb)
                        copy_model "$glb" "$ASSETS_DIR/characters/medieval/player_knight.glb"
                        ;;
                    *Mage*.glb|*mage*.glb)
                        copy_model "$glb" "$ASSETS_DIR/characters/medieval/player_mage.glb"
                        ;;
                    *Rogue*.glb|*rogue*.glb)
                        copy_model "$glb" "$ASSETS_DIR/characters/medieval/player_rogue.glb"
                        ;;
                    *Barbarian*.glb|*barbarian*.glb)
                        copy_model "$glb" "$ASSETS_DIR/characters/medieval/npc_barbarian.glb"
                        ;;
                esac
            fi
        done
        
        # Copy first available as default if no specific match
        FIRST_GLB=$(find "$MODULAR_DIR" -name "*.glb" | head -1)
        if [ -n "$FIRST_GLB" ] && [ ! -f "$ASSETS_DIR/characters/generic/player_default.glb" ]; then
            copy_model "$FIRST_GLB" "$ASSETS_DIR/characters/generic/player_default.glb"
        fi
    else
        echo "  ⚠️  Could not find GLB directory in modular characters pack"
    fi
fi

echo ""
echo "📥 Downloading Quaternius Low Poly Ultimate Pack (for containers and props)..."
echo ""

# Download Low Poly Ultimate Pack for quest objects
if download_and_extract "https://quaternius.com/packs/lowpolyultimatepack/LowPolyUltimatePack.zip" "lowpoly-pack"; then
    LOWPOLY_DIR=$(find "$TEMP_DIR/lowpoly-pack" -type d -name "GLB" | head -1)
    if [ -z "$LOWPOLY_DIR" ]; then
        LOWPOLY_DIR=$(find "$TEMP_DIR/lowpoly-pack" -type d -name "glb" | head -1)
    fi
    
    if [ -n "$LOWPOLY_DIR" ] && [ -d "$LOWPOLY_DIR" ]; then
        echo ""
        echo "📂 Copying container, marker, and prop models..."

        for glb in "$LOWPOLY_DIR"/*.glb; do
            if [ -f "$glb" ]; then
                filename=$(basename "$glb" | tr '[:upper:]' '[:lower:]')
                case "$filename" in
                    *chest*.glb)
                        copy_model "$glb" "$ASSETS_DIR/containers/chest.glb"
                        ;;
                    *key*.glb)
                        copy_model "$glb" "$ASSETS_DIR/containers/key.glb"
                        ;;
                    *scroll*.glb|*book*.glb)
                        copy_model "$glb" "$ASSETS_DIR/props/scroll.glb"
                        ;;
                    *gem*.glb|*crystal*.glb|*diamond*.glb)
                        copy_model "$glb" "$ASSETS_DIR/props/collectible_gem.glb"
                        ;;
                    *pillar*.glb|*obelisk*.glb|*marker*.glb)
                        copy_model "$glb" "$ASSETS_DIR/markers/quest_marker.glb"
                        ;;
                esac
            fi
        done
    else
        echo "  ⚠️  Could not find GLB directory in low poly pack"
    fi
fi

echo ""
echo "📥 Downloading Quaternius Mini People Pack (NPCs)..."
echo ""

# Download Mini People for NPCs
if download_and_extract "https://quaternius.com/packs/minipeople/Mini_People.zip" "mini-people"; then
    MINI_DIR=$(find "$TEMP_DIR/mini-people" -type d -name "GLB" | head -1)
    if [ -z "$MINI_DIR" ]; then
        MINI_DIR=$(find "$TEMP_DIR/mini-people" -type d -name "glb" | head -1)
    fi
    
    if [ -n "$MINI_DIR" ] && [ -d "$MINI_DIR" ]; then
        echo ""
        echo "📂 Copying NPC models..."
        
        # Copy first few as NPCs
        count=0
        for glb in "$MINI_DIR"/*.glb; do
            if [ -f "$glb" ] && [ $count -lt 5 ]; then
                case $count in
                    0) copy_model "$glb" "$ASSETS_DIR/characters/generic/npc_civilian_male.glb" ;;
                    1) copy_model "$glb" "$ASSETS_DIR/characters/generic/npc_civilian_female.glb" ;;
                    2) copy_model "$glb" "$ASSETS_DIR/characters/generic/npc_guard.glb" ;;
                    3) copy_model "$glb" "$ASSETS_DIR/characters/generic/npc_merchant.glb" ;;
                    4) copy_model "$glb" "$ASSETS_DIR/characters/generic/npc_villager.glb" ;;
                esac
                ((count++))
            fi
        done
    fi
fi

# Cleanup
echo ""
echo "🧹 Cleaning up temporary files..."
rm -rf "$TEMP_DIR"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ Download complete!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Downloaded models are in: $ASSETS_DIR"
echo ""
echo "Directory contents:"
echo ""
find "$ASSETS_DIR/characters" "$ASSETS_DIR/containers" "$ASSETS_DIR/markers" "$ASSETS_DIR/props" -name "*.glb" 2>/dev/null | while read f; do
    size=$(du -h "$f" | cut -f1)
    echo "  $size  ${f#$ASSETS_DIR/}"
done

echo ""
echo "Next steps:"
echo "  1. Run database migration: psql -d insimul -f server/migrations/add-player-quest-audio-fields.sql"
echo "  2. Add FREESOUND_API_KEY to your .env file"
echo "  3. Register models in asset collections via the Admin Panel"
echo ""
