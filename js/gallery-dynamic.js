document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('dynamic-masonry-container');
    if (!galleryContainer) return;

    if (typeof ALL_GALLERY_IMAGES === 'undefined' || !ALL_GALLERY_IMAGES.length) {
        galleryContainer.innerHTML = '<p>No images found.</p>';
        return;
    }

    // Filter out logos just in case
    const validImages = ALL_GALLERY_IMAGES.filter(src => !src.includes('/logos/'));

    // Shuffle array (Fisher-Yates)
    for (let i = validImages.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [validImages[i], validImages[j]] = [validImages[j], validImages[i]];
    }

    // We will build 4 tracks. Let's use up to 160 images total (40 per track) to keep DOM healthy but look infinite
    const numTracks = 4;
    const imagesPerTrack = 40;
    const tracks = [[], [], [], []];
    
    let imgIndex = 0;
    for (let i = 0; i < numTracks; i++) {
        for (let j = 0; j < imagesPerTrack; j++) {
            if (imgIndex >= validImages.length) {
                imgIndex = 0; // Wrap around if we run out (unlikely with 600)
            }
            tracks[i].push(validImages[imgIndex]);
            imgIndex++;
        }
    }

    const columnSpeeds = ['col-down', 'col-up', 'col-down-slow', 'col-up-fast'];
    const trackClasses = ['track-1', 'track-2', 'track-3', 'track-4'];
    const shapeClasses = ['tall', 'wide', 'square'];

    let html = '';
    tracks.forEach((trackImages, colIndex) => {
        html += `<div class="masonry-column ${columnSpeeds[colIndex]}">`;
        html += `<div class="masonry-track ${trackClasses[colIndex]}" id="galleryTrack${colIndex}">`;
        
        trackImages.forEach((src) => {
            // Assign random shape to give the masonry look
            const randomShape = shapeClasses[Math.floor(Math.random() * shapeClasses.length)];
            html += `
                <div class="masonry-item ${randomShape}">
                    <img src="${src}" alt="Campus Experience" loading="lazy">
                </div>
            `;
        });
        
        // Duplicate the first few images to make the CSS infinite scroll loop seamlessly
        for(let j=0; j<8; j++) {
            const randomShape = shapeClasses[Math.floor(Math.random() * shapeClasses.length)];
            html += `
                <div class="masonry-item ${randomShape}">
                    <img src="${trackImages[j]}" alt="Campus Experience" loading="lazy">
                </div>
            `;
        }

        html += `</div></div>`;
    });

    galleryContainer.innerHTML = html;
});

// Pause/Play functionality
window.toggleGalleryAnimation = function(state) {
    for (let i = 0; i < 4; i++) {
        const track = document.getElementById('galleryTrack' + i);
        if (track) {
            track.style.animationPlayState = state;
        }
    }
};
