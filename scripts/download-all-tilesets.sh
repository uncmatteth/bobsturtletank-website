#!/bin/bash
# Download all tilesets and generate all maps

echo "🔄 Waiting for tilesets to complete..."
echo ""

# Tileset IDs
WATER="c89e433e-90b5-4e0c-8da9-7002486fa017"
DUNGEON="1ccdc7fb-358d-4219-8487-332d5bcfcf4a"
CITY="62093ad1-4870-44a0-983b-9e5306690ad1"
COSMIC="acca235f-82d9-4ec7-a00a-33431dc272d5"

OUTPUT_DIR="../public/tilesets/topdown"
mkdir -p "$OUTPUT_DIR"

# Function to download tileset
download_tileset() {
    local ID=$1
    local NAME=$2
    
    echo "⏳ Checking $NAME tileset..."
    
    # Check status (using PixelLab API)
    local URL="https://api.pixellabai.com/tilesets/topdown/$ID"
    
    # Download metadata
    curl -s "$URL" -o "$OUTPUT_DIR/$NAME.json" 2>/dev/null
    
    # Check if completed
    if grep -q '"status":"completed"' "$OUTPUT_DIR/$NAME.json" 2>/dev/null; then
        echo "✅ $NAME completed! Downloading..."
        
        # Extract download URL
        local PNG_URL=$(grep -oP '"download_url":"https://[^"]+\.png"' "$OUTPUT_DIR/$NAME.json" | cut -d'"' -f4)
        
        if [ ! -z "$PNG_URL" ]; then
            curl -s "$PNG_URL" -o "$OUTPUT_DIR/$NAME.png"
            echo "   Saved: $NAME.png"
        fi
    else
        echo "   Still processing..."
        return 1
    fi
    
    return 0
}

# Wait and download all tilesets
while true; do
    COMPLETE=0
    
    download_tileset "$WATER" "ocean-water" && COMPLETE=$((COMPLETE+1))
    download_tileset "$DUNGEON" "dungeon-cave" && COMPLETE=$((COMPLETE+1))
    download_tileset "$CITY" "city-cobblestone" && COMPLETE=$((COMPLETE+1))
    download_tileset "$COSMIC" "cosmic-space" && COMPLETE=$((COMPLETE+1))
    
    echo ""
    echo "Progress: $COMPLETE/4 tilesets complete"
    
    if [ $COMPLETE -eq 4 ]; then
        echo ""
        echo "🎉 All tilesets downloaded!"
        break
    fi
    
    echo "⏰ Waiting 30 seconds before next check..."
    sleep 30
    echo ""
done

echo ""
echo "🗺️ Now generating all location maps..."
echo ""

cd /home/dave/Documents/GitHub/bobsturtletank-website
python3 scripts/create-all-maps-and-world.py

echo ""
echo "✅ DONE! All maps generated and ready!"

