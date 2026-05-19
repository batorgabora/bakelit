/* ============================================================
   FILTERS — artist, year, label filters + click-out reset
   ============================================================ */


/* ============================================================
   SHARED HELPERS
   ============================================================ */

/* rebuild the album list in the navbar to reflect current filtered covers */
function updateAlbumList() {
    albums.innerHTML = '';

    document.querySelectorAll('.cover').forEach(cover => {
        const artistMatch = !activeArtist || cover.dataset.artist === activeArtist;
        const yearMatch   = !activeYear   || cover.dataset.year   === activeYear;
        const labelMatch  = !activeLabel  || cover.dataset.label  === activeLabel;

        if (artistMatch && yearMatch && labelMatch) {
            const link = document.createElement('a');
            link.textContent = cover.dataset.title;
            link.addEventListener('click', () => cover.click());
            albums.appendChild(link);
        }
    });

    albums.style.display = 'flex'; /* always visible in navbar */
}

/* show or hide the "filters" header and active filter summary */
function updateFilterLabel() {
    const filterLabel = document.getElementById('filter-label');
    const anyActive = activeArtist || activeYear || activeLabel;

    if (anyActive) {
        const parts = [];
        if (activeArtist) parts.push(activeArtist);
        if (activeYear)   parts.push(activeYear);
        if (activeLabel)  parts.push(activeLabel);

        filterLabel.innerHTML = `filters<span id="filter-active">${parts.join(' · ')}</span>`;
        filterLabel.style.display = 'block';
    } else {
        filterLabel.style.display = 'none';
    }
}

/* apply all three active filters to covers simultaneously */
function applyAllFilters() {
    document.querySelectorAll('.cover').forEach(cover => {
        const artistMatch = !activeArtist || cover.dataset.artist === activeArtist;
        const yearMatch   = !activeYear   || cover.dataset.year   === activeYear;
        const labelMatch  = !activeLabel  || cover.dataset.label  === activeLabel;
        cover.style.display = artistMatch && yearMatch && labelMatch ? '' : 'none';
    });

    updateAlbumList();
    updateFilterLabel();
}


/* ============================================================
   BAND FILTER
   ============================================================ */

/* collect all unique artists, sort alphabetically, build #bands nav */
function buildBandFilter() {
    const bandsContainer = document.getElementById('bands');

    const artists = [
        ...new Set(
            [...document.querySelectorAll('.cover')]
                .map(cover => cover.dataset.artist)
        )
    ].sort();

    /* "all" resets just the artist filter */
    const allLink = document.createElement('a');
    allLink.textContent = 'all';
    allLink.dataset.band = '';
    allLink.className = 'filter-all';
    bandsContainer.appendChild(allLink);

    artists.forEach(artist => {
        const a = document.createElement('a');
        a.textContent = artist;
        a.dataset.band = artist;
        bandsContainer.appendChild(a);
    });

    /* single delegated click handler */
    bandsContainer.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (!link) return;
        applyBandFilter(link.dataset.band);
    });
}


/* set artist filter and refresh view */
function applyBandFilter(artist) {
    activeArtist = artist || null;

    document.querySelectorAll('#bands a').forEach(a => {
        a.classList.toggle('active', a.dataset.band === (artist || ''));
    });

    applyAllFilters();
}


/* ============================================================
   YEAR FILTER
   ============================================================ */

/* collect all unique years, sort chronologically, build #years nav */
function buildYearFilter() {
    const yearsContainer = document.getElementById('years');

    const uniqueYears = [
        ...new Set(
            [...document.querySelectorAll('.cover')]
                .map(cover => cover.dataset.year)
        )
    ].sort();

    /* "all" resets just the year filter */
    const allLink = document.createElement('a');
    allLink.textContent = 'all';
    allLink.dataset.year = '';
    allLink.className = 'filter-all';
    yearsContainer.appendChild(allLink);

    uniqueYears.forEach(year => {
        const a = document.createElement('a');
        a.textContent = year;
        a.dataset.year = year;
        yearsContainer.appendChild(a);
    });

    yearsContainer.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (!link) return;
        applyYearFilter(link.dataset.year);
    });
}

/* set year filter and refresh view */
function applyYearFilter(year) {
    activeYear = year || null;

    document.querySelectorAll('#years a').forEach(a => {
        a.classList.toggle('active', a.dataset.year === (year || ''));
    });

    applyAllFilters();
}


/* ============================================================
   LABEL FILTER
   ============================================================ */

/* collect all unique labels, sort alphabetically, build #labels nav */
function buildLabelFilter() {
    const labelsContainer = document.getElementById('labels');

    const uniqueLabels = [
        ...new Set(
            [...document.querySelectorAll('.cover')]
                .map(cover => cover.dataset.label)
        )
    ].sort();

    /* "all" resets just the label filter */
    const allLink = document.createElement('a');
    allLink.textContent = 'all';
    allLink.dataset.label = '';
    allLink.className = 'filter-all';
    labelsContainer.appendChild(allLink);

    uniqueLabels.forEach(label => {
        const a = document.createElement('a');
        a.textContent = label;
        a.dataset.label = label;
        labelsContainer.appendChild(a);
    });

    labelsContainer.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (!link) return;
        applyLabelFilter(link.dataset.label);
    });
}

/* set label filter and refresh view */
function applyLabelFilter(label) {
    activeLabel = label || null;

    document.querySelectorAll('#labels a').forEach(a => {
        a.classList.toggle('active', a.dataset.label === (label || ''));
    });

    applyAllFilters();
}


/* ============================================================
   CLICK-OUT RESET
   ============================================================ */

/* clicking anywhere outside the navbar resets filters and closes navbar */
document.addEventListener('click', e => {
    /* do nothing if navbar is closed and no filter is active */
    if (!activeArtist && !activeYear && !activeLabel && navbar.style.display !== 'flex') return;
    /* do nothing if click was inside navbar */
    if (navbar.contains(e.target)) return;
    /* do nothing if click was on lines button (it has its own toggle) */
    if (lines.contains(e.target)) return;

    const hadActiveFilter = activeArtist || activeYear || activeLabel;

    if (hadActiveFilter) {
        /* reset all filter state */
        activeArtist = null;
        activeYear   = null;
        activeLabel  = null;

        /* clear active highlights */
        document.querySelectorAll('#bands a, #years a, #labels a').forEach(a => {
            a.classList.remove('active');
        });

        /* show all covers */
        document.querySelectorAll('.cover').forEach(cover => {
            cover.style.display = '';
        });

        /* hide filter label */
        document.getElementById('filter-label').style.display = 'none';

        /* restore full album list */
        albums.innerHTML = '';
        document.querySelectorAll('.cover').forEach(cover => {
            const link = document.createElement('a');
            link.textContent = cover.dataset.title;
            link.addEventListener('click', () => cover.click());
            albums.appendChild(link);
        });
    }

    /* always close navbar when clicking out */
    vinyls.classList.remove('compact');
    navbar.style.display = 'none';
    albums.style.display = 'none';
});


/* ============================================================
   INIT — build all filters on page load
   ============================================================ */

buildBandFilter();
buildYearFilter();
buildLabelFilter();