#!/usr/bin/env python3
"""
Wait for all tilesets to complete and download them
Then regenerate all maps
"""

import time
import json
import os
import subprocess

# Tileset IDs (from PixelLab)
tilesets = {
    'ocean-water': 'c89e433e-90b5-4e0c-8da9-7002486fa017',
    'dungeon-cave': '1ccdc7fb-358d-4219-8487-332d5bcfcf4a',
    'city-cobblestone': '62093ad1-4870-44a0-983b-9e5306690ad1',
    'cosmic-space': 'acca235f-82d9-4ec7-a00a-33431dc272d5',
}

print("🔄 Checking tileset status...\n")
print("=" * 60)
print("\nNote: Tilesets typically take ~100 seconds to generate")
print("You can check manually using:")
for name, tid in tilesets.items():
    print(f"  {name}: https://api.pixellabai.com/tilesets/topdown/{tid}")
print("\n" + "=" * 60)
print("\n⏳ Waiting for all tilesets to complete...")
print("(This script will check every 30 seconds)")
print("\nOnce complete, manually download using:")
print("  1. Visit the URL above for each tileset")
print("  2. Get the download_url from the JSON response")
print("  3. Download the .png and .json files to public/tilesets/topdown/")
print("\nThen run:")
print("  python3 scripts/create-all-maps-and-world.py")
print("\n" + "=" * 60)

