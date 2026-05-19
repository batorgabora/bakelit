/* ============================================================
   OVERLAY — cover click, overlay close, artist click, spinner
   ============================================================ */

/* cover click — open overlay and start playback */
document.querySelectorAll('.cover').forEach(cover => {
    cover.addEventListener('click', () => {
        const filename = cover.src.split('/').pop();
        const otherside = cover.dataset.otherside || `assets/otherside/${filename}`;
        const albumTitle = cover.dataset.title;

        /* enlarge the record player UI */
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
            setPlayerImage(false);               /* arm up when stopped */

            loadLyrics(albumTitle).then(() => playTrack(trackIndex));
        }

        /* try to load the back cover; fall back to front cover if not found */
        const test = new Image();
        test.onload = () => { overlayImg.src = otherside; };
        test.onerror = () => { overlayImg.src = cover.src; };
        test.src = otherside;

        /* populate overlay info fields */
        overlayTitle.textContent  = cover.dataset.title;
        overlayArtist.textContent = cover.dataset.artist; /* also used by artist click handler */
        overlayLabel.textContent  = cover.dataset.label;
        overlayYear.textContent   = cover.dataset.year;
        overlayRuntime.textContent = cover.dataset.runtime || '';

        /* rebuild tracklist with side labels */
        tracklist.innerHTML = '';
        if (cover.dataset.tracks) {
            const tracks = cover.dataset.tracks.split(',').map(t => t.trim());

            /* parse data-sides into [{name, count}] objects
               format: "side a:5,side b:5" or "eeny:6,meeny:6" etc.
               if no data-sides, sides stays empty and labels are skipped */
            const sides = cover.dataset.sides
                ? cover.dataset.sides.split(',').map(s => {
                    const [name, count] = s.split(':');
                    return { name: name.trim(), count: parseInt(count) };
                })
                : [];

            let sideIdx = 0;        /* which side we're currently on */
            let sideTrackCount = 0; /* how many tracks placed on the current side */

            tracks.forEach((track, i) => {
                /* insert a side label whenever a new side begins */
                if (sides.length && (i === 0 || sideTrackCount === 0)) {
                    const label = document.createElement('p');
                    label.className = 'side-label';
                    label.textContent = sides[sideIdx]?.name ?? '';
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

                /* advance side counter; move to next side when current one is full */
                sideTrackCount++;
                if (sides.length && sides[sideIdx] && sideTrackCount >= sides[sideIdx].count) {
                    sideIdx++;
                    sideTrackCount = 0;
                }
            });

            /* restore highlight if reopening the same album */
            restoreHighlight();
        }

        overlay.style.display = 'flex';
        spinner.style.zIndex = 9999999;
    });
});

/* close overlay on background click — audio keeps playing */
overlay.addEventListener('click', () => {
    if (audio.paused) {
        spinner.classList.remove('playing'); /* only stop spinning if audio already paused */
    }
    setPlayerImage(!audio.paused); /* arm down if still playing, up if paused */
    overlay.style.display = 'none';
    spinner.style.zIndex = 9999;
    spinner.classList.remove('enlarged');
});


/* spinner click — toggle play/pause */
spinner.addEventListener('click', (e) => {
    e.stopPropagation(); /* prevent overlay from closing when spinner is clicked */
    if (audio.paused) {
        audio.play();
        spinner.classList.add('playing'); /* start spinning on resume */
        setPlayerImage(true);            /* arm down on resume */
    } else {
        audio.pause();
        spinner.classList.remove('playing'); /* stop spinning on pause */
        setPlayerImage(false);               /* arm up on pause */
    }
});


/* clicking the artist name in the overlay filters the grid by that artist.
   registered once outside the cover loop to avoid stacking listeners */
overlayArtist.style.cursor = 'pointer';
overlayArtist.addEventListener('click', e => {
    e.stopPropagation(); /* prevent overlay close handler from firing */

    const artist = overlayArtist.textContent;

    /* close the overlay */
    overlay.style.display = 'none';
    spinner.style.zIndex = 9999;
    spinner.classList.remove('enlarged');

    /* switch to compact view and always show navbar */
    vinyls.classList.add('compact');
    navbar.style.display = 'flex';

    /* apply the filter — hides album list, shows only this artist's covers */
    applyBandFilter(artist);

    /* scroll to top so the navbar is immediately in view */
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* clicking the year in the overlay filters the grid by that year.
   registered once outside the cover loop to avoid stacking listeners */
overlayYear.style.cursor = 'pointer';
overlayYear.addEventListener('click', e => {
    e.stopPropagation(); /* prevent overlay close handler from firing */

    const year = overlayYear.textContent;

    /* close the overlay */
    overlay.style.display = 'none';
    spinner.style.zIndex = 9999;
    spinner.classList.remove('enlarged');

    /* switch to compact view and always show navbar */
    vinyls.classList.add('compact');
    navbar.style.display = 'flex';

    /* apply the filter — hides album list, shows only this year's covers */
    applyYearFilter(year);

    /* scroll to top so the navbar is immediately in view */
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* clicking the label in the overlay filters the grid by that label.
   registered once outside the cover loop to avoid stacking listeners */
overlayLabel.style.cursor = 'pointer';
overlayLabel.addEventListener('click', e => {
    e.stopPropagation(); /* prevent overlay close handler from firing */

    const label = overlayLabel.textContent;

    /* close the overlay */
    overlay.style.display = 'none';
    spinner.style.zIndex = 9999;
    spinner.classList.remove('enlarged');

    /* switch to compact view and always show navbar */
    vinyls.classList.add('compact');
    navbar.style.display = 'flex';

    /* apply the filter — hides album list, shows only this label's covers */
    applyLabelFilter(label);

    window.scrollTo({ top: 0, behavior: 'smooth' });
});