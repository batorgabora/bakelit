<img width="1246" height="703" alt="Screenshot 2026-05-08 at 16 13 06" src="https://github.com/user-attachments/assets/4f88c761-b5d6-49f1-8085-580ee2c3f945" />
<br><br>
A personal vinyl library and music player for the browser, designed and built by me around my own record collection.<br><br>
Each album is displayed as a browsable grid of cover art. Clicking on one opens a detailed overlay showing the tracklist 
split by side, label and year info, and — where I've transcribed them — the lyrics for individual tracks, displayed in 
sync with playback. Audio files are loaded and played directly in the browser, with tracks advancing automatically and 
playback persisting when the overlay is closed.<br><br>
The interface is built with vanilla HTML, CSS, and JavaScript, with no frameworks. Layout, animations, and the fixed 
record player in the corner are handled entirely in CSS using viewport-relative units — and both the player and the 
spinning record are drawings I made myself. All album metadata is stored directly in <code>data-*</code> attributes 
on the cover images, and lyrics are fetched at runtime from per-album JSON files.<br><br>
The project started as a way to catalogue my records and turned into something I actually use to listen to music — 
which I think is the best thing a side project can become.<br><br>
