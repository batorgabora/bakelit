const overlay = document.getElementById('album-overlay');
const overlayImg = document.getElementById('overlay-cover');
const overlayTitle = document.getElementById('overlay-title');
const overlayArtist = document.getElementById('overlay-artist');

document.querySelectorAll('.cover').forEach(cover => {
    cover.addEventListener('click', () => {
        const filename = cover.src.split('/').pop();
        const otherside = cover.dataset.otherside || `assets/otherside/${filename}`;
        
        const test = new Image();
        test.onload = () => { overlayImg.src = otherside; };
        test.onerror = () => { overlayImg.src = cover.src; };
        test.src = otherside;

        overlayTitle.textContent = cover.dataset.title;
        overlayArtist.textContent = cover.dataset.artist;
        overlay.style.display = 'flex';
        document.getElementById('spinner').style.zIndex = 9999999;
    });
});

overlay.addEventListener('click', () => {
    overlay.style.display = 'none';
    document.getElementById('spinner').style.zIndex = 9999;
});



/* lines button functionality for moving vinyls closer to each other and tracklist appearing on the left*/
const lines = document.getElementById('lines');
const vinyls = document.querySelector('.vinyls');
const tracklist = document.getElementById('tracklist');

document.querySelectorAll('.cover').forEach(cover => {
    const link = document.createElement('a');
    link.textContent = cover.dataset.title;
    link.addEventListener('click', () => cover.click());
    tracklist.appendChild(link);
});

lines.addEventListener('click', () => {
    vinyls.classList.toggle('compact');
    tracklist.style.display = vinyls.classList.contains('compact') ? 'flex' : 'none';
});