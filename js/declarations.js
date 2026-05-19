/* ============================================================
   DECLARATIONS — all DOM references and shared state
   loaded first so all other files can access these
   ============================================================ */

const overlay      = document.getElementById('album-overlay');
const overlayImg   = document.getElementById('overlay-cover');
const overlayTitle = document.getElementById('overlay-title');
const overlayArtist= document.getElementById('overlay-artist');
const overlayLabel = document.getElementById('overlay-label');
const overlayYear  = document.getElementById('overlay-year');
const overlayRuntime = document.getElementById('overlay-runtime');
const tracklist    = document.getElementById('overlay-tracklist');
const currentsong  = document.getElementById('currentsong');
const spinner      = document.getElementById('spinner');
const player       = document.getElementById('player');
const arm          = document.getElementById('arm');
const lines        = document.getElementById('lines');
const vinyls       = document.querySelector('.vinyls');
const navbar       = document.getElementById('navbar');
const albums       = document.getElementById('albums');
const bands        = document.getElementById('bands');
const years        = document.getElementById('years');
const audio        = document.getElementById('overlay-audio');
audio.volume = 0.3;

/* shared playback state */
let currentAlbumTitle = null; /* which album is currently loaded */
let trackIndex = 0;           /* current track index within the album */
let currentTracks = [];       /* track list of the current album */
let currentLyrics = {};       /* lyrics keyed by track name */

/* shared filter state */
let activeArtist = null;      /* currently selected artist filter, null = show all */
let activeYear   = null;      /* currently selected year filter, null = show all */
let activeLabel = null;       /* currently selected label filter, null = show all */