import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Path to your main songs folder
SONGS_DIR = './songs'

# 1. Route to get the list of songs
@app.route('/api/songs')
def get_all_songs():
    songs_data = []
    # Ensure the directory exists to avoid errors
    if not os.path.exists(SONGS_DIR):
        return jsonify({"error": "Songs directory not found"}), 404

    for root, dirs, files in os.walk(SONGS_DIR):
        for file in files:
            if file.endswith('.mp3'):
                # Calculate relative path for the serving route
                rel_path = os.path.relpath(os.path.join(root, file), SONGS_DIR).replace("\\", "/")
                
                songs_data.append({
                    "title": file.replace(".mp3", ""),
                    "folder": os.path.basename(root),
                    "path": f"http://127.0.0.1:5000/songs/{rel_path}"
                })
    return jsonify(songs_data)

# 2. Route to actually serve/play the files
@app.route('/songs/<path:filename>')
def serve_songs(filename):
    return send_from_directory(SONGS_DIR, filename)

# 3. Start the server (ALWAYS AT THE BOTTOM)
if __name__ == '__main__':
    app.run(port=5000, debug=True)