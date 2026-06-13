/* ============================================================
   AUDIO — lyrics, arm image, tracklist highlight, playback
   ============================================================ */

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
        lyricsEl.textContent = '';
        lyricsEl.style.display = 'none';
    }
}

/* switch arm image to show arm down (playing) or up (stopped).
   guard prevents reloading the image if it's already correct */
function setPlayerImage(playing) {
    if (!arm) return;
    const target = playing ? 'assets/kar rajta.png' : 'assets/kar oldalt.png';
    if (!arm.src.includes(playing ? 'kar rajta' : 'kar oldalt')) {
        arm.src = target;
    }
}

/* highlight the active track in the tracklist.
   guards against side-label paragraphs which aren't tracks */
function restoreHighlight() {
    document.querySelectorAll('#overlay-tracklist p:not(.side-label)').forEach((p, i) => {
        p.style.color = i === trackIndex
            ? 'rgba(226, 221, 209, 0.9)'
            : 'rgba(201, 199, 195, 0.5)';
    });
}

/* plays a specific track by index from the current album.
   if the file is missing, skips in the given direction automatically */
function playTrack(index, direction = 1) {
    if (index >= currentTracks.length || index < 0) return;
    const trackName = currentTracks[index];
    const paddedNum = String(index + 1).padStart(2, '0');
    //const trackSrc = `assets/audio/${currentAlbumTitle}/${paddedNum} ${trackName}.flac`;
    const trackSrc = `assets/audio/${encodeURIComponent(currentAlbumTitle)}/${paddedNum} ${encodeURIComponent(trackName)}.flac`;

    audio.src = trackSrc;
    audio.load();
    audio.play()
        .then(() => {
            spinner.classList.add('playing');
            setPlayerImage(true);
            restoreHighlight();
            showLyrics(trackName);
            currentsong.textContent = trackName;
        })
        .catch(() => {
            /* file missing — skip in the given direction */
            console.warn(`skipping track ${paddedNum} ${trackName}: not found`);
            trackIndex += direction;
            playTrack(trackIndex, direction);
        });
}

/* automatically advance to next track when current one ends */
audio.onended = () => {
    trackIndex++;
    playTrack(trackIndex, 1);
};


/* keyboard controls — space toggles play/pause,
   arrows skip tracks or restart current */
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

    if (e.code === 'ArrowRight') {
        e.preventDefault();
        trackIndex++;
        playTrack(trackIndex, 1);  /* skip forwards if missing */
    }

    if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (audio.currentTime > 3) {
            audio.currentTime = 0;
        } else {
            trackIndex = Math.max(0, trackIndex - 1);
            playTrack(trackIndex, -1); /* skip backwards if missing */
        }
    }

});