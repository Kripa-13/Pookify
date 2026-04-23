console.log("Hello, Pookify!");

// --- 1. Global Variables ---
let allPlaylists = {};      // Holds the entire JSON structure
let currentPlaylist = [];   // Stores songs for the active folder
let currentSongIndex = 0;   
let currentSong = document.getElementById('audio-player');
let isSeeking = false;

// --- 2. Data Fetching Functions ---

async function getsongs() {
    try {
        let response = await fetch("songs.json");
        if (!response.ok) throw new Error("JSON not found"); // Add this
        let data = await response.json();
        return data;
    } catch (e) {
        console.error("Error:", e);
        return {};
    }
}

// Logic to load songs from a specific Cloudinary folder
async function getSongsByFolder(folderName) {
    currentPlaylist = allPlaylists[folderName] || [];
    currentSongIndex = 0; 

    let songUL = document.querySelector(".songlist ul");
    if (!songUL) return;
    songUL.innerHTML = ""; 

  currentPlaylist.forEach((song, index) => {
    songUL.innerHTML += `
        <li onclick="playMusic('${song.url}', '${song.title}', '${song.cover}', ${index})">
            <img class="invert" src="${song.cover}">
            <div class="info">
                <div>${song.title}</div>
                <p>${folderName}</p>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="play.png">
            </div>
        </li>`;
});
}

// --- 3. Core Music Playback Function ---
// Ensure your play button in index.html has id="play-main"
const playMusic = (trackUrl, title, cover, index = 0) => {
    currentSongIndex = index;
    currentSong.src = trackUrl;
    currentSong.play();

    // UPDATE UI: Use the new IDs you just added to HTML
    document.getElementById("song-info-title").innerText = title;
    document.getElementById("song-info-img").src = cover;
    
    // This part fixes your Pause button icon
    // It targets the span with id="play-main" from your screenshot
    document.getElementById("play-main").innerHTML = "⏸";
};

// Add this listener to the play-main button to toggle manually
document.getElementById('play-main').addEventListener("click", () => {
    if (currentSong.paused) {
        currentSong.play();
        document.getElementById('play-main').innerHTML = "⏸";
    } else {
        currentSong.pause();
        document.getElementById('play-main').innerHTML = "▶";
    }
});

// --- 4. Controls (Play/Pause, Next, Prev) ---
// --- Updated Play/Pause Logic ---
// Target the main footer button
const playBtn = document.getElementById('play-main');

// Single, clean click listener
playBtn.addEventListener('click', () => {
    if (currentSong.src) { // Check if a song is actually loaded
        if (currentSong.paused) {
            currentSong.play();
        } else {
            currentSong.pause();
        }
    } else {
        console.log("No song loaded yet!");
    }
});

// SYNC: When the music starts, force the icon to Pause
currentSong.addEventListener('play', () => {
    playBtn.innerHTML = "⏸"; // Pause Emoji
});

// SYNC: When the music stops, force the icon to Play
currentSong.addEventListener('pause', () => {
    playBtn.innerHTML = "▶"; // Play Emoji
});
// Function to handle clicking the button
playBtn.addEventListener('click', () => {
    if (currentSong.paused) {
        currentSong.play();
    } else {
        currentSong.pause();
    }
});

// Update icon when music actually starts playing
currentSong.onplay = () => {
    playBtn.innerHTML = "⏸"; // Pause Emoji
};

// Update icon when music actually pauses
currentSong.onpause = () => {
    playBtn.innerHTML = "▶"; // Play Emoji
};

// Listener for the NEXT button
document.getElementById("next").addEventListener("click", () => {
    if (currentSongIndex + 1 < currentPlaylist.length) {
        currentSongIndex++; // Move to next index
        let nextSong = currentPlaylist[currentSongIndex];

        // 1. Play the audio
        playMusic(nextSong.url, nextSong.title, nextSong.cover, currentSongIndex);

        // 2. IMPORTANT: Manually update the image if playMusic isn't doing it
        document.getElementById("song-info-img").src = nextSong.cover;
    }
});

// Do the same for the PREVIOUS button
document.getElementById("prev").addEventListener("click", () => {
    if (currentSongIndex - 1 >= 0) {
        currentSongIndex--;
        let prevSong = currentPlaylist[currentSongIndex];

        playMusic(prevSong.url, prevSong.title, prevSong.cover, currentSongIndex);

        // Update the image
        document.getElementById("song-info-img").src = prevSong.cover;
    }
});

currentSong.addEventListener('ended', () => {
    document.getElementById("next").click();
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
        // Flattens all folders into one list for searching
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
        songListUl.innerHTML += `<li onclick="playMusic('${song.url}', '${song.title}', '${song.cover}', ${index})">
            <img class="invert" src="${song.cover}"> 
            <div class="info">
                 <div>${song.title}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="play.png">
            </div>
        </li>`;
    });
}
// --- 8. Main Initialization ---
async function main() {
    allPlaylists = await getsongs(); 
    let folderNames = Object.keys(allPlaylists);

    let cardContainer = document.querySelector(".cardContainer");
    if (cardContainer) {
        cardContainer.innerHTML = ""; 
        folderNames.forEach(folderName => {
            // Cloudinary structure for cover images
            let coverUrl = allPlaylists[folderName][0].cover;

            cardContainer.innerHTML += `
            <div class="card" onclick="getSongsByFolder('${folderName}')">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="black">
                        <path d="M5 3l14 9-14 9V3z"></path>
                    </svg>
                </div>
                <img src="${coverUrl}" alt="Cover for ${folderName}">
                <h3>${folderName}</h3>
                <p>Playlist • ${allPlaylists[folderName].length} songs</p>
            </div>`;
        });
    }

    // Load the first playlist by default
    if (folderNames.length > 0) {
        getSongsByFolder(folderNames[0]);
    }
}

main();