console.log("Hello, Pookify!");

// --- 1. Global Variables ---
let allPlaylists = {};      // Holds the entire JSON structure
let currentPlaylist = [];   // Stores songs for the active folder
let currentSongIndex = 0;   
let currentSong = document.getElementById('audio-player');
let isSeeking = false;
// --- Liked Songs Storage ---
// Load from local storage, or start with an empty array if none exist
let likedSongs = JSON.parse(localStorage.getItem('pookify_liked')) || [];

// Function to handle clicking the heart
function toggleLike(event, url, title, cover) {
    event.stopPropagation(); // Stop the row from playing when clicking the heart
    let btn = event.target;
    
    // Check if the song is already in our liked array
    let existingIndex = likedSongs.findIndex(song => song.url === url);
    
    if (existingIndex > -1) {
        // 1. It's already liked, so REMOVE it
        likedSongs.splice(existingIndex, 1);
        btn.textContent = '♡';
        btn.style.color = '#b3b3b3';
        btn.style.transform = 'scale(1)';
    } else {
        // 2. It's not liked yet, so ADD it
        likedSongs.push({ url, title, cover });
        btn.textContent = '♥';
        btn.style.color = '#ffc0cb'; // POOKIFY Pink
        btn.style.transform = 'scale(1.2)';
        setTimeout(() => btn.style.transform = 'scale(1)', 150);
    }
    
    // 3. Save the updated list back to the browser's storage
    localStorage.setItem('pookify_liked', JSON.stringify(likedSongs));
    
    // 4. Update the Liked Songs card count if it's on the screen
    updateLikedSongsCardCount();
}
// --- New Helper: Attach events to dynamically generated library buttons ---

// --- 2. Data Fetching Functions ---

async function getsongs() {
    try {
        let response = await fetch("songs.json");
        if (!response.ok) throw new Error("JSON not found");
        let data = await response.json();
        return data;
    } catch (e) {
        console.error("Error fetching data:", e);
        return {};
    }
}

// Logic to load songs from a specific Cloudinary folder
// Logic to load songs from a specific Cloudinary folder
async function getSongsByFolder(folderName) {
    currentPlaylist = allPlaylists[folderName] || [];
    currentSongIndex = 0; 

    let songUL = document.querySelector(".songlist ul");
    if (!songUL) return;
    songUL.innerHTML = ""; 

    currentPlaylist.forEach((song, index) => {
        let isLiked = likedSongs.some(s => s.url === song.url);
        let heartIcon = isLiked ? '♥' : '♡';
        let heartColor = isLiked ? 'color: #ffc0cb;' : 'color: #b3b3b3;';

        songUL.innerHTML += `
            <li class="track-row" onclick="playMusic('${song.url}', '${song.title}', '${song.cover}', ${index})">
              <div class="track-info">
                <img src="${song.cover}" alt="Album Art" class="album-art" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
                <div class="text-content">
                  <span class="song-title">${song.title}</span>
                  <span class="playlist-name">${folderName}</span>
                </div>
              </div>
              <div class="track-actions">
                <button class="action-btn like-btn" style="${heartColor}" onclick="toggleLike(event, '${song.url}', '${song.title}', '${song.cover}')" title="Save to Liked Songs">${heartIcon}</button>
                <button class="action-btn play-btn" title="Play">▶</button>
                <button class="action-btn more-btn" title="More options">⋮</button>
              </div>
            </li>`;
    });
    // NOTICE: attachLibraryInteractions() is gone from here!
}
function highlightActiveTrack(index) {
    const allSidebarTracks = document.querySelectorAll(".songlist ul li");
    
    // Remove 'active' from all tracks
    allSidebarTracks.forEach(track => {
        track.classList.remove("active");
    });

    // Add 'active' back to the playing track
    if (allSidebarTracks[index]) {
        allSidebarTracks[index].classList.add("active");
        allSidebarTracks[index].scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

// --- Core Music Playback Function ---
// --- Core Music Playback Function ---
function highlightActiveTrack(index) {
    const allSidebarTracks = document.querySelectorAll(".songlist ul li");
    
    // Remove 'active' from all tracks
    allSidebarTracks.forEach(track => {
        track.classList.remove("active");
    });

    // Add 'active' back to the playing track
    if (allSidebarTracks[index]) {
        allSidebarTracks[index].classList.add("active");
        allSidebarTracks[index].scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

const playMusic = (trackUrl, title, cover, index = 0) => {
    currentSongIndex = index;
    currentSong.src = trackUrl;
    currentSong.play();

    // UPDATE UI elements
    const songTitleEl = document.getElementById("song-info-title");
    const songImgEl = document.getElementById("song-info-img");
    
    if (songTitleEl) songTitleEl.innerText = title;
    if (songImgEl) songImgEl.src = cover;
    
    const mainPlayBtn = document.getElementById("play-main");
    if (mainPlayBtn) mainPlayBtn.innerHTML = "⏸";

    // Call the highlight function to light up the row!
    highlightActiveTrack(index);
};
// --- 4. Controls & Synchronized State Event Listeners ---
const playBtn = document.getElementById('play-main');

if (playBtn) {
    // Single unified click controller for play/pause toggle
    playBtn.addEventListener('click', () => {
        if (currentSong.src) { 
            if (currentSong.paused) {
                currentSong.play();
            } else {
                currentSong.pause();
            }
        } else {
            console.log("No song loaded yet!");
        }
    });
}

// Global media event abstractions directly syncing UI buttons
// Global media event abstractions directly syncing UI buttons AND animations
currentSong.addEventListener('play', () => {
    if (playBtn) playBtn.innerHTML = "⏸";
    
    // Add the spinning animation to the album art in the playbar
    const playbarImage = document.getElementById("song-info-img");
    if (playbarImage) {
        playbarImage.classList.add("playing-spin");
    }
});

currentSong.addEventListener('pause', () => {
    if (playBtn) playBtn.innerHTML = "▶";
    
    // Remove the spinning animation when the music stops
    const playbarImage = document.getElementById("song-info-img");
    if (playbarImage) {
        playbarImage.classList.remove("playing-spin");
    }
});
// Listener for the NEXT button
const nextBtn = document.getElementById("next");
if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        if (currentSongIndex + 1 < currentPlaylist.length) {
            currentSongIndex++; 
            let nextSong = currentPlaylist[currentSongIndex];
            playMusic(nextSong.url, nextSong.title, nextSong.cover, currentSongIndex);
        }
    });
}

// Listener for the PREVIOUS button
const prevBtn = document.getElementById("prev");
if (prevBtn) {
    prevBtn.addEventListener("click", () => {
        if (currentSongIndex - 1 >= 0) {
            currentSongIndex--;
            let prevSong = currentPlaylist[currentSongIndex];
            playMusic(prevSong.url, prevSong.title, prevSong.cover, currentSongIndex);
        }
    });
}

currentSong.addEventListener('ended', () => {
    const nextButton = document.getElementById("next");
    if (nextButton) nextButton.click();
});

// --- 5. Progress Bar & Time Update ---
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

const progressBar = document.getElementById('progressBar');
const progressFill = document.querySelector('.bar-fill');

currentSong.addEventListener("timeupdate", () => {
    if (!isSeeking) {
        const timeDisplay = document.querySelector(".songtime");
        const percent = (currentSong.currentTime / currentSong.duration) * 100;
        
        if (progressBar) progressBar.value = percent || 0;
        if (progressFill) progressFill.style.width = (percent || 0) + "%";
        if (timeDisplay) {
            timeDisplay.innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        }
    }
});

if (progressBar) {
    progressBar.addEventListener("mousedown", () => { isSeeking = true; });
    progressBar.addEventListener("mouseup", () => { isSeeking = false; });
    progressBar.addEventListener("input", (e) => {
        if (!isNaN(currentSong.duration) && isFinite(currentSong.duration)) {
            currentSong.currentTime = (e.target.value * currentSong.duration) / 100;
        }
    });
}

// --- 6. Volume Control ---
const volumeBar = document.getElementById('volumeBar');
if (volumeBar) {
    volumeBar.addEventListener('input', (e) => {
        currentSong.volume = e.target.value / 100;
    });
}

// --- 7. Search Logic ---
const searchBar = document.getElementById('searchBar');
if (searchBar) {
    searchBar.addEventListener('input', (e) => {
        let searchTerm = e.target.value.toLowerCase().trim();
        let allSongsArray = Object.values(allPlaylists).flat();
        let filteredList = allSongsArray.filter(song => 
            song.title.toLowerCase().includes(searchTerm)
        );
        renderFilteredList(filteredList);
    });
}

function renderFilteredList(filteredList) {
    let songListUl = document.querySelector(".songlist ul");
    if (!songListUl) return;
    songListUl.innerHTML = "";
    
    filteredList.forEach((song, index) => {
        let isLiked = likedSongs.some(s => s.url === song.url);
        let heartIcon = isLiked ? '♥' : '♡';
        let heartColor = isLiked ? 'color: #ffc0cb;' : 'color: #b3b3b3;';

        songListUl.innerHTML += `
            <li class="track-row" onclick="playMusic('${song.url}', '${song.title}', '${song.cover}', ${index})">
              <div class="track-info">
                <img src="${song.cover}" alt="Album Art" class="album-art" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
                <div class="text-content">
                  <span class="song-title">${song.title}</span>
                  <span class="playlist-name">Search Result</span>
                </div>
              </div>
              <div class="track-actions">
                <button class="action-btn like-btn" style="${heartColor}" onclick="toggleLike(event, '${song.url}', '${song.title}', '${song.cover}')" title="Save to Liked Songs">${heartIcon}</button>
                <button class="action-btn play-btn" title="Play">▶</button>
                <button class="action-btn more-btn" title="More options">⋮</button>
              </div>
            </li>`;
    });
}
// --- 8. Main Initialization ---


    // Load the first playlist directory by default framework settings
    // --- 8. Main Initialization ---
    // --- Go Home / Reset View ---
function renderHomeView() {
    let folderNames = Object.keys(allPlaylists);
    let cardContainer = document.querySelector(".cardContainer") || document.querySelector(".card-container");
    if (!cardContainer) return;

    // Clear the screen
    cardContainer.innerHTML = ""; 
    
    // Draw the Liked Songs Card
    cardContainer.innerHTML += `
    <div class="card" onclick="openLikedSongs()">
        <div class="card-inner">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="black"><path d="M5 3l14 9-14 9V3z"></path></svg>
            </div>
            <div class="playlist-img" style="width: 100%; aspect-ratio: 1/1; border-radius: 6px; margin-bottom: 10px; background: linear-gradient(135deg, #ffc0cb, #8e44ad); display: flex; align-items: center; justify-content: center; font-size: 3rem; color: white;">♥</div>
            <h3 class="playlist-title">Liked Songs</h3>
            <p class="playlist-meta" id="liked-songs-count">Playlist • ${likedSongs.length} songs</p>
        </div>
    </div>`;

    // Draw the rest of your Folders
    folderNames.forEach(folderName => {
        let coverUrl = allPlaylists[folderName][0].cover;
        cardContainer.innerHTML += `
        <div class="card" onclick="getSongsByFolder('${folderName}')">
            <div class="card-inner">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="black">
                        <path d="M5 3l14 9-14 9V3z"></path>
                    </svg>
                </div>
                <img class="playlist-img" src="${coverUrl}" alt="Cover for ${folderName}">
                <h3 class="playlist-title">${folderName}</h3>
                <p class="playlist-meta">Playlist • ${allPlaylists[folderName].length} songs</p>
            </div>
        </div>`;
    });

    // Clear the search bar
    const searchBar = document.getElementById('searchBar');
    if (searchBar) searchBar.value = '';
}
async function main() {
    allPlaylists = await getsongs(); 
    let folderNames = Object.keys(allPlaylists);

    // Matches the card container grid wrapper
    let cardContainer = document.querySelector(".cardContainer") || document.querySelector(".card-container");
    if (cardContainer) {
        cardContainer.innerHTML = ""; 
        
        // --- OPTION 4: ADD LIKED SONGS CARD FIRST ---
        cardContainer.innerHTML += `
        <div class="card" onclick="openLikedSongs()">
            <div class="card-inner">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="black"><path d="M5 3l14 9-14 9V3z"></path></svg>
                </div>
                <div class="playlist-img" style="width: 100%; aspect-ratio: 1/1; border-radius: 6px; margin-bottom: 10px; background: linear-gradient(135deg, #ffc0cb, #8e44ad); display: flex; align-items: center; justify-content: center; font-size: 3rem; color: white;">♥</div>
                <h3 class="playlist-title">Liked Songs</h3>
                <p class="playlist-meta" id="liked-songs-count">Playlist • ${likedSongs.length} songs</p>
            </div>
        </div>`;

        // --- THEN LOOP THE REST OF THE FOLDERS ---
        folderNames.forEach(folderName => {
            let coverUrl = allPlaylists[folderName][0].cover;

            // Updated dynamic HTML to include the '.card-inner' wrapper for pristine 3D parallax rendering
            cardContainer.innerHTML += `
            <div class="card" onclick="getSongsByFolder('${folderName}')">
                <div class="card-inner">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="black">
                            <path d="M5 3l14 9-14 9V3z"></path>
                        </svg>
                    </div>
                    <img class="playlist-img" src="${coverUrl}" alt="Cover for ${folderName}">
                    <h3 class="playlist-title">${folderName}</h3>
                    <p class="playlist-meta">Playlist • ${allPlaylists[folderName].length} songs</p>
                </div>
            </div>`;
        });
    }

    // Load the first playlist directory by default framework settings
    if (folderNames.length > 0) {
        getSongsByFolder(folderNames[0]);
    }
}
// --- 9. Smart Mix (Machine Learning) ---

async function generatePredictiveMix() {
    const generateBtn = document.getElementById('smart-mix-btn');
    if(generateBtn) generateBtn.innerText = "Analyzing Vibes...";

    // 1. Get user's location for the weather context
    navigator.geolocation.getCurrentPosition(async (position) => {
        const payload = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            userId: "current_user_id" 
        };

        try {
            // 2. Fetch the mix from your Flask backend
            const response = await fetch('http://localhost:5000/api/smart-mix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Backend connection failed");

            const data = await response.json();
            console.log("Model Targets:", data.targets);
            
            // 3. Render the new tracks to your UI
            renderPlaylistToDOM(data.playlist); 
            
            // 4. Auto-play the first track using your existing playMusic function
            const firstTrack = data.playlist[0];
            playMusic(firstTrack.audio_url, firstTrack.title, firstTrack.cover, 0);
            
            if(generateBtn) generateBtn.innerText = "✨ Mix Generated!";

        } catch (error) {
            console.error("Error fetching smart mix:", error);
            if(generateBtn) generateBtn.innerText = "Try Again";
        }
    }, (error) => {
        console.warn("Location permission denied. Falling back to time-only model.");
    });
}
function renderPlaylistToDOM(playlistArray) {
    currentPlaylist = playlistArray.map(track => ({
        url: track.audio_url,
        title: track.title,
        cover: track.cover
    }));

    const songUL = document.querySelector(".songlist ul");
    if (!songUL) return;
    songUL.innerHTML = ""; 

    playlistArray.forEach((track, index) => {
        let isLiked = likedSongs.some(s => s.url === track.audio_url);
        let heartIcon = isLiked ? '♥' : '♡';
        let heartColor = isLiked ? 'color: #ffc0cb;' : 'color: #b3b3b3;';

        songUL.innerHTML += `
            <li class="track-row" onclick="playMusic('${track.audio_url}', '${track.title}', '${track.cover}', ${index})">
              <div class="track-info">
                <img src="${track.cover || 'download.jpg'}" alt="Album Art" class="album-art" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
                <div class="text-content">
                  <span class="song-title">${track.title}</span>
                  <span class="playlist-name">Vibe • ${track.bpm} BPM</span>
                </div>
              </div>
              <div class="track-actions">
                <button class="action-btn like-btn" style="${heartColor}" onclick="toggleLike(event, '${track.audio_url}', '${track.title}', '${track.cover}')" title="Save to Liked Songs">${heartIcon}</button>
                <button class="action-btn play-btn" title="Play">▶</button>
                <button class="action-btn more-btn" title="More options">⋮</button>
              </div>
            </li>`;
    });
    
    const cardContainer = document.querySelector(".cardContainer") || document.querySelector(".card-container");
    if (cardContainer) {
        cardContainer.innerHTML = `<h2 style="color: white; padding-left: 10px;">Your Custom Smart Mix is ready in the Library!</h2>`;
    }
}
// --- Open Liked Songs Folder ---
function openLikedSongs() {
    currentPlaylist = likedSongs; // Set the active playlist to our liked songs
    currentSongIndex = 0;

    let songUL = document.querySelector(".songlist ul");
    if (!songUL) return;
    
    if (likedSongs.length === 0) {
        songUL.innerHTML = `<li style="padding: 20px; color: #b3b3b3; text-align: center;">You haven't liked any songs yet!</li>`;
        return;
    }

    songUL.innerHTML = `<h3 style="padding: 10px 15px; color: #ffc0cb;">Your Liked Songs</h3>`; 

    likedSongs.forEach((song, index) => {
        songUL.innerHTML += `
            <li class="track-row" onclick="playMusic('${song.url}', '${song.title}', '${song.cover}', ${index})">
              <div class="track-info">
                <img src="${song.cover}" alt="Album Art" class="album-art" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
                <div class="text-content">
                  <span class="song-title">${song.title}</span>
                  <span class="playlist-name">Liked Songs</span>
                </div>
              </div>
              <div class="track-actions">
                <button class="action-btn like-btn" style="color: #ffc0cb;" onclick="toggleLike(event, '${song.url}', '${song.title}', '${song.cover}'); openLikedSongs();" title="Remove from Liked Songs">♥</button>
                <button class="action-btn play-btn" title="Play">▶</button>
              </div>
            </li>`;
    });
}

function updateLikedSongsCardCount() {
    const countEl = document.getElementById('liked-songs-count');
    if (countEl) countEl.innerText = `Playlist • ${likedSongs.length} songs`;
}
// --- 8. Main Initialization ---
async function main() {
    allPlaylists = await getsongs(); 
    
    // Call our new function to draw the screen!
    renderHomeView(); 

    // Load the first playlist directory into the sidebar by default
    let folderNames = Object.keys(allPlaylists);
    if (folderNames.length > 0) {
        getSongsByFolder(folderNames[0]);
    }
}


// --- Initialize App ---
main();