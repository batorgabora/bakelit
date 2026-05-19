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
            ? 'rgba(179, 174, 165, 0.9)'
            : 'rgba(179, 174, 165, 0.5)';
    });
}

/* plays a specific track by index from the current album.
   if the file is missing, skips to the next track automatically */
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
            setPlayerImage(true);            /* arm down when playing */
            restoreHighlight();              /* highlight current track in tracklist */
            showLyrics(trackName);           /* show lyrics for this track */
            currentsong.textContent = trackName;
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