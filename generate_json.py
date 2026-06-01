import cloudinary
import cloudinary.api
import json

# Use your actual credentials
cloudinary.config(
    cloud_name = "dg62tcmhx",
    api_key = "YOUR_API_KEY",
    api_secret = "YOUR_API_SECRET",
    secure = True
)

def generate_json():
    # Cloudinary treats .mp3 as "video"
    result = cloudinary.api.resources(resource_type="video", type="upload")
    songs_list = []

    for resource in result.get('resources', []):
        public_id = resource['public_id']
        # Splits 'Folder/SongName' into ['Folder', 'SongName']
        parts = public_id.split('/')
        folder = parts[0] if len(parts) > 1 else "General"
        
        songs_list.append({
            "title": parts[-1].replace("_", " "),
            "folder": folder,
            "url": resource['secure_url'],
            "version": f"v{resource['version']}"
        })

    with open('songs.json', 'w') as f:
        json.dump(songs_list, f, indent=4)
    
    print(f"Successfully saved {len(songs_list)} songs to songs.json")

if __name__ == "__main__":
    generate_json()