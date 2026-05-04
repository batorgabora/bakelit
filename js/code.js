const overlay = document.getElementById('album-overlay');
const overlayImg = document.getElementById('overlay-cover');
const overlayTitle = document.getElementById('overlay-title');
const overlayArtist = document.getElementById('overlay-artist');
const overlayLabel = document.getElementById('overlay-label');
const overlayYear = document.getElementById('overlay-year');
const overlayRuntime = document.getElementById('overlay-runtime');
const tracklist = document.getElementById('overlay-tracklist');
const currentsong = document.getElementById('currentsong');
const spinner = document.getElementById('spinner');
const player = document.getElementById('player'); /* record player image */
const audio = document.getElementById('overlay-audio');
audio.volume = 0.3;

let currentAlbumTitle = null; /* track which album is currently loaded */
let trackIndex = 0; /* current track index within the album */
let currentTracks = []; /* track list of the current album */
let currentLyrics = {}; /* lyrics for the current album, keyed by track name */

/* fetch lyrics json for the current album if it exists */
async function loadLyrics(albumTitle) {
    try {
        const res = await fetch(`assets/lyrics/${albumTitle}.json`);
        if (!res.ok) throw new Error('not found');
        currentLyrics = await res.json();
    } catch {
        currentLyrics = {}; /* no lyrics file, just show nothing */
    }
}

/* show lyrics for the current track in #overlay-lyrics */
function showLyrics(trackName) {
    const lyricsEl = document.getElementById('overlay-lyrics');
    if (!lyricsEl) return;
    const text = currentLyrics[trackName];
    if (text) {
        lyricsEl.textContent = text;
        lyricsEl.style.display = 'block';
    } else {
        /* no lyrics for this track, hide the element */
        lyricsEl.textContent = '';
        lyricsEl.style.display = 'none';
    }
}

/* switch player image to show arm down (playing) or up (stopped) */
function setPlayerImage(playing) {
    if (!player) return;
    player.src = playing
        ? 'assets/lejátszó tele játszik.png'  /* arm down = playing */
        : 'assets/lejátszó tele.png';          /* arm up = stopped */
}

/* highlight the active track in the tracklist with guard for side names*/
function restoreHighlight() {
    document.querySelectorAll('#overlay-tracklist p:not(.side-label)').forEach((p, i) => {
        p.style.color = i === trackIndex
            ? 'rgba(179, 174, 165, 0.9)'
            : 'rgba(179, 174, 165, 0.5)';
    });
}

/* plays a specific track by index from the current album */
function playTrack(index) {
    if (index >= currentTracks.length) return;
    const trackName = currentTracks[index];
    const paddedNum = String(index + 1).padStart(2, '0');
    const trackSrc = `assets/audio/${currentAlbumTitle}/${paddedNum} ${trackName}.flac`;

    audio.src = trackSrc;
    audio.load();
    audio.play()
        .then(() => {
            spinner.classList.add('playing'); /* start spinning when audio plays */
            setPlayerImage(true); /* arm down when playing */
            restoreHighlight(); /* highlight current track in tracklist */
            showLyrics(trackName); /* show lyrics for this track */
            currentsong.textContent = `${trackName}`;
        })
        .catch(() => {
            /* no file for this track, skip to next */
            console.warn(`skipping track ${paddedNum} ${trackName}: not found`);
            trackIndex++;
            playTrack(trackIndex);
        });
}

/* automatically advance to next track when current one ends */
audio.onended = () => {
    trackIndex++;
    playTrack(trackIndex);
};

document.querySelectorAll('.cover').forEach(cover => {
    cover.addEventListener('click', () => {
        const filename = cover.src.split('/').pop();
        const otherside = cover.dataset.otherside || `assets/otherside/${filename}`;
        const albumTitle = cover.dataset.title;

        spinner.classList.add('enlarged');

        if (albumTitle === currentAlbumTitle) {
            /* same album — restore lyrics and highlight for currently playing track */
            showLyrics(currentTracks[trackIndex] || '');
        } else {
            /* different album — clear lyrics until new track starts playing */
            showLyrics('');
        }

        /* only switch audio if a different album is opened */
        if (albumTitle !== currentAlbumTitle) {
            currentAlbumTitle = albumTitle;
            currentTracks = cover.dataset.tracks
                ? cover.dataset.tracks.split(',').map(t => t.trim())
                : [];
            trackIndex = 0;

            audio.pause();
            audio.currentTime = 0;
            spinner.classList.remove('playing'); /* stop spinning when switching album */
            setPlayerImage(false); /* arm up when stopped */

            loadLyrics(albumTitle).then(() => playTrack(trackIndex)); /* load lyrics then play */
        }

        const test = new Image();
        test.onload = () => { overlayImg.src = otherside; };
        test.onerror = () => { overlayImg.src = cover.src; };
        test.src = otherside;

        overlayTitle.textContent = cover.dataset.title;
        overlayArtist.textContent = cover.dataset.artist;
        overlayLabel.textContent = cover.dataset.label;
        overlayYear.textContent = cover.dataset.year;
        overlayRuntime.textContent = cover.dataset.runtime || '';

        /* rebuild tracklist and restore highlight if same album */
        tracklist.innerHTML = '';
        if (cover.dataset.tracks) {
            const tracks = cover.dataset.tracks.split(',').map(t => t.trim());

            /* parse data-sides into [{name, count}] objects
            format: "side a:5,side b:5" or "eeny:6,meeny:6" etc.
            if no data-sides attribute, sides stays empty and labels are skipped */
            const sides = cover.dataset.sides
                ? cover.dataset.sides.split(',').map(s => {
                    const [name, count] = s.split(':');
                    return { name: name.trim(), count: parseInt(count) };
                })
                : [];

            let sideIdx = 0;        /* which side we're currently on */
            let sideTrackCount = 0; /* how many tracks we've placed on the current side */

            tracks.forEach((track, i) => {
                /* insert a side label whenever a new side begins */
                if (sides.length && (i === 0 || sideTrackCount === 0)) {
                    const label = document.createElement('p');
                    label.className = 'side-label';
                    label.textContent = (sides[sideIdx]?.name ?? '');
                    tracklist.appendChild(label);
                }

                /* build the track row */
                const p = document.createElement('p');
                p.innerHTML = `<span>${i + 1}.</span>${track}`;
                p.style.cursor = 'pointer';

                /* clicking a track jumps playback to that position */
                p.addEventListener('click', (e) => {
                    e.stopPropagation();
                    trackIndex = i;
                    playTrack(trackIndex);
                });
                tracklist.appendChild(p);

                /* advance the side counter; move to next side when current one is full */
                sideTrackCount++;
                if (sides.length && sides[sideIdx] && sideTrackCount >= sides[sideIdx].count) {
                    sideIdx++;
                    sideTrackCount = 0;
                }
            });
        }

        overlay.style.display = 'flex';
        spinner.style.zIndex = 9999999;
    });
});

overlay.addEventListener('click', () => {
    /* audio keeps playing when overlay closes */
    if (audio.paused) {
        spinner.classList.remove('playing'); /* only stop spinning if audio is already paused */
    }
    setPlayerImage(!audio.paused); /* arm down if still playing, up if paused */
    overlay.style.display = 'none';
    spinner.style.zIndex = 9999;
    spinner.classList.remove('enlarged');
});

spinner.addEventListener('click', (e) => {
    e.stopPropagation(); /* prevent overlay from closing when spinner is clicked */
    if (audio.paused) {
        audio.play();
        spinner.classList.add('playing'); /* start spinning on resume */
        setPlayerImage(true); /* arm down on resume */
    } else {
        audio.pause();
        spinner.classList.remove('playing'); /* stop spinning on pause */
        setPlayerImage(false); /* arm up on pause */
    }
});

/* lines button functionality */
const lines = document.getElementById('lines');
const vinyls = document.querySelector('.vinyls');
const albums = document.getElementById('albums');

document.querySelectorAll('.cover').forEach(cover => {
    const link = document.createElement('a');
    link.textContent = cover.dataset.title;
    link.addEventListener('click', () => cover.click());
    albums.appendChild(link);
});

lines.addEventListener('click', () => {
    vinyls.classList.toggle('compact');
    albums.style.display = vinyls.classList.contains('compact') ? 'flex' : 'none';
});


/* space toggles audio playback */
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (audio.paused) {
            audio.play();
            spinner.classList.add('playing');
            setPlayerImage(true);
        } else {
            audio.pause();
            spinner.classList.remove('playing');
            setPlayerImage(false);
        }
    }
});