// File: src/main/resources/static/app.js
// Purpose: Frontend JavaScript logic for the Collaborative Playlist app.
// Location: src/main/resources/static/

// --- DOM Elements ---
const roomIdInput = document.getElementById('roomIdInput');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomCreationInfoDiv = document.getElementById('room-creation-info');
const newRoomIdSpan = document.getElementById('newRoomId');

const playlistViewDiv = document.getElementById('playlist-view');
const roomNameDisplay = document.getElementById('roomNameDisplay');
const currentRoomIdSpan = document.getElementById('currentRoomId');
const songTitleInput = document.getElementById('songTitle');
const songArtistInput = document.getElementById('songArtist');
const addSongBtn = document.getElementById('addSongBtn');
const playlistUl = document.getElementById('playlist');
const connectionStatusDiv = document.getElementById('connection-status');
const disconnectBtn = document.getElementById('disconnectBtn');

// --- State Variables ---
let stompClient = null;
let currentSubscription = null;
let currentRoomId = null;
const backendUrl = ''; // Relative URL for same-origin deployment

// --- WebSocket Functions ---

function connect(roomId) {
    // Ensure SockJS and Stomp are loaded
    if (typeof SockJS === 'undefined' || typeof Stomp === 'undefined') {
        console.error("SockJS or Stomp library not loaded!");
        updateStatus("Error: Libraries not loaded", true);
        return;
    }

    updateStatus("Connecting...", false);
    // The endpoint defined in WebSocketConfig -> registerStompEndpoints
    const socket = new SockJS(backendUrl + '/ws-playlist');
    stompClient = Stomp.over(socket);

    // Disable debug logging in production
    // stompClient.debug = null;

    stompClient.connect({}, // Empty headers for basic connection
        (frame) => { // Success callback
            console.log('Connected: ' + frame);
            currentRoomId = roomId;
            updateStatus(`Connected to Room: ${roomId}`, false);
            playlistViewDiv.style.display = 'block'; // Show playlist view
            roomSelectionDiv.style.display = 'none'; // Hide room selection
            currentRoomIdSpan.textContent = roomId;

            // Fetch initial playlist via REST after connecting
            fetchInitialPlaylist(roomId);

            // Subscribe to the room's topic
            subscribeToRoom(roomId);
        },
        (error) => { // Error callback
            console.error('Connection error: ' + error);
            updateStatus("Connection Error: " + error, true);
            disconnect(); // Clean up on error
        }
    );
}

function disconnect() {
    if (currentSubscription) {
        currentSubscription.unsubscribe();
        currentSubscription = null;
        console.log("Unsubscribed");
    }
    if (stompClient !== null) {
        stompClient.disconnect(() => {
            console.log("Disconnected");
        });
        stompClient = null;
    }
    currentRoomId = null;
    updateStatus("Disconnected", true);
    playlistViewDiv.style.display = 'none'; // Hide playlist view
    roomSelectionDiv.style.display = 'block'; // Show room selection
    roomCreationInfoDiv.style.display = 'none'; // Hide creation info
    clearPlaylist(); // Clear the displayed list
}

function subscribeToRoom(roomId) {
    if (!stompClient || !stompClient.connected) {
        console.error("Cannot subscribe, Stomp client not connected.");
        return;
    }

    // The destination defined in PlaylistController @SendTo
    const topic = `/topic/room/${roomId}/songs`;
    console.log(`Subscribing to ${topic}`);
    currentSubscription = stompClient.subscribe(topic, (message) => {
        console.log('Received message: ', message.body);
        const song = JSON.parse(message.body);
        addSongToPlaylistUI(song); // Add the newly received song to the list
    });
}

function sendMessage(roomId, songTitle, songArtist) {
    if (stompClient && stompClient.connected && roomId) {
        // The destination defined in PlaylistController @MessageMapping
        const destination = `/app/room/${roomId}/addSong`;
        const message = {
            title: songTitle,
            artist: songArtist
        };
        console.log(`Sending message to ${destination}:`, message);
        stompClient.send(destination, {}, JSON.stringify(message)); // Send message
        // Clear input fields after sending
        songTitleInput.value = '';
        songArtistInput.value = '';
    } else {
        console.error('Cannot send message, Stomp client not connected or no room ID.');
        updateStatus("Error: Not connected", true);
    }
}


// --- REST API Functions ---

async function fetchInitialPlaylist(roomId) {
    try {
        const response = await fetch(`${backendUrl}/api/rooms/${roomId}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Room ${roomId} not found.`);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const roomData = await response.json();
        console.log("Fetched room data:", roomData);
        // Update room name display if available
        roomNameDisplay.textContent = `Room: ${roomData.name || '(Unnamed Room)'}`;
        // Render the fetched playlist
        renderPlaylist(roomData.playlistSongs || []);
    } catch (error) {
        console.error('Error fetching initial playlist:', error);
        updateStatus(`Error loading room: ${error.message}`, true);
        // Maybe disconnect or show error message prominently
        renderPlaylist([]); // Show empty list on error
    }
}

async function createRoom() {
    try {
        updateStatus("Creating room...", false);
        const response = await fetch(`${backendUrl}/api/rooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Include optional name if needed, currently sending empty object
            // body: JSON.stringify({ name: "Optional Room Name" })
            body: JSON.stringify({})
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const newRoom = await response.json();
        console.log("Created room:", newRoom);

        // Display creation info and connect
        newRoomIdSpan.textContent = newRoom.publicId;
        roomCreationInfoDiv.style.display = 'block';
        roomIdInput.value = newRoom.publicId; // Pre-fill for convenience? Or just show info.

        // Automatically connect to the newly created room
        connect(newRoom.publicId);

    } catch (error) {
        console.error('Error creating room:', error);
        updateStatus(`Error creating room: ${error.message}`, true);
        roomCreationInfoDiv.style.display = 'none';
    }
}

// --- UI Update Functions ---

function renderPlaylist(songs) {
    clearPlaylist();
    if (songs.length === 0) {
        const placeholder = document.createElement('li');
        placeholder.textContent = "Playlist is empty.";
        placeholder.className = 'placeholder';
        playlistUl.appendChild(placeholder);
    } else {
        songs.forEach(addSongToPlaylistUI);
    }
}

function addSongToPlaylistUI(song) {
    // Remove placeholder if it exists
    const placeholder = playlistUl.querySelector('.placeholder');
    if (placeholder) {
        playlistUl.removeChild(placeholder);
    }

    const li = document.createElement('li');
    li.setAttribute('data-song-id', song.id); // Store song ID if needed later (e.g., for removal)
    li.textContent = `${song.title} - ${song.artist}`;
    // Optional: Add added time?
    // const timeSpan = document.createElement('span');
    // timeSpan.style.fontSize = '0.8em';
    // timeSpan.style.marginLeft = '10px';
    // timeSpan.textContent = `(Added: ${new Date(song.addedAt).toLocaleTimeString()})`;
    // li.appendChild(timeSpan);

    playlistUl.appendChild(li);

    // Auto-scroll to the bottom (optional)
    playlistUl.scrollTop = playlistUl.scrollHeight;
}

function clearPlaylist() {
    playlistUl.innerHTML = ''; // Clear existing list items
}

function updateStatus(message, isError = false) {
    connectionStatusDiv.textContent = `Status: ${message}`;
    connectionStatusDiv.className = 'connection-status'; // Reset class
    if (isError) {
        connectionStatusDiv.classList.add('error');
    } else if (stompClient && stompClient.connected) {
        connectionStatusDiv.classList.add('connected');
    } else {
        connectionStatusDiv.classList.add('disconnected');
    }
}

// --- Event Listeners ---

joinRoomBtn.addEventListener('click', () => {
    const roomId = roomIdInput.value.trim();
    if (roomId) {
        // Attempt to join existing room
        roomCreationInfoDiv.style.display = 'none'; // Hide creation info if joining
        connect(roomId);
    } else {
        // Create a new room
        createRoom();
    }
});

addSongBtn.addEventListener('click', () => {
    const title = songTitleInput.value.trim();
    const artist = songArtistInput.value.trim();
    if (title && artist && currentRoomId) {
        sendMessage(currentRoomId, title, artist);
    } else {
        if(!currentRoomId) alert("Please connect to a room first.");
        if(!title || !artist) alert("Please enter both Title and Artist.");
        console.warn("Title, Artist, or Room ID missing.");
    }
});

disconnectBtn.addEventListener('click', () => {
    disconnect();
});

// Initial setup
const roomSelectionDiv = document.getElementById('room-selection'); // Define here for disconnect() usage
updateStatus("Disconnected", true); // Set initial status
