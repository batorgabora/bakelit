const overlay = document.getElementById('album-overlay');
const overlayImg = document.getElementById('overlay-cover');
const overlayTitle = document.getElementById('overlay-title');
const overlayArtist = document.getElementById('overlay-artist');
const overlayLabel = document.getElementById('overlay-label');
const overlayYear = document.getElementById('overlay-year');
const tracklist = document.getElementById('overlay-tracklist');
const spinner = document.getElementById('spinner');
const audio = document.getElementById('overlay-audio');

let currentAudioSrc = null;

document.querySelectorAll('.cover').forEach(cover => {
    cover.addEventListener('click', () => {
        const filename = cover.src.split('/').pop();
        const otherside = cover.dataset.otherside || `assets/otherside/${filename}`;
        const audioFilename = filename.replace(/\.[^.]+$/, '.wav');
        const audioSrc = cover.dataset.audio || `assets/audio/${audioFilename}`;

        spinner.classList.add('enlarged');

        /* only switch audio if a different album is opened */
        if (audioSrc !== currentAudioSrc) {
            currentAudioSrc = audioSrc;
            audio.pause();
            audio.currentTime = 0;
            spinner.classList.remove('playing');

            audio.src = audioSrc;
            audio.load();
            audio.play()
                .then(() => {
                    spinner.classList.add('playing');
                })
                .catch((err) => {
                    audio.pause();
                    spinner.classList.remove('playing');
                    console.error(`no audio found for: ${audioSrc}`, err);
                });
        }

        const test = new Image();
        test.onload = () => { overlayImg.src = otherside; };
        test.onerror = () => { overlayImg.src = cover.src; };
        test.src = otherside;

        overlayTitle.textContent = cover.dataset.title;
        overlayArtist.textContent = cover.dataset.artist;
        overlayLabel.textContent = cover.dataset.label;
        overlayYear.textContent = cover.dataset.year;

        tracklist.innerHTML = '';
        if (cover.dataset.tracks) {
            cover.dataset.tracks.split(',').forEach((track, i) => {
                const p = document.createElement('p');
                p.innerHTML = `<span>${i + 1}.</span>${track.trim()}`;
                tracklist.appendChild(p);
            });
        }

        overlay.style.display = 'flex';
        spinner.style.zIndex = 9999999;
    });
});

overlay.addEventListener('click', () => {
    /* audio keeps playing when overlay closes */
    if (audio.paused) spinner.classList.remove('playing');
    overlay.style.display = 'none';
    spinner.style.zIndex = 9999;
    spinner.classList.remove('enlarged');
});

spinner.addEventListener('click', (e) => {
    e.stopPropagation(); /* prevent overlay from closing when spinner is clicked */
    if (audio.paused) {
        audio.play();
        spinner.classList.add('playing'); /* start spinning on resume */
    } else {
        audio.pause();
        spinner.classList.remove('playing'); /* stop spinning on pause */
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