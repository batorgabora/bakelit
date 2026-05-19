/* ============================================================
   NAVBAR — album list, lines button, keyboard shortcut
   ============================================================ */


/* populate the album list in the navbar from cover data */
document.querySelectorAll('.cover').forEach(cover => {
    const link = document.createElement('a');
    link.textContent = cover.dataset.title;
    link.addEventListener('click', () => cover.click());
    albums.appendChild(link);
});

albums.style.display = 'none'; /* hidden until navbar opens */

/* toggle compact mode; reset all filters if leaving compact */
lines.addEventListener('click', () => {
    vinyls.classList.toggle('compact');
    const isCompact = vinyls.classList.contains('compact');

    if (!isCompact && (activeArtist || activeYear || activeLabel)) {
        activeArtist = null;
        activeYear   = null;
        activeLabel  = null;
        applyBandFilter('');
        applyYearFilter('');
        applyLabelFilter('');
    }

    navbar.style.display = isCompact ? 'flex' : 'none';
    albums.style.display = isCompact ? 'flex' : 'none'; /* explicitly sync albums */
});

/* space bar toggles play/pause */
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