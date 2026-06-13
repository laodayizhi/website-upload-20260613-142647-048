import { H as Hls } from '../original/video-dru42stk.js';

function setupPlayer(container) {
    const video = container.querySelector('video');
    const overlay = container.querySelector('[data-play-button]');

    if (!video || !overlay) {
        return;
    }

    const source = video.getAttribute('data-source');
    let loaded = false;
    let hlsInstance = null;

    function loadSource() {
        if (loaded || !source) {
            return;
        }

        loaded = true;

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);

            hlsInstance.on(Hls.Events.ERROR, function (_, data) {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                    return;
                }

                if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                    return;
                }

                hlsInstance.destroy();
                hlsInstance = null;
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        }
    }

    function startPlayback() {
        loadSource();
        video.controls = true;
        overlay.classList.add('is-hidden');

        const playRequest = video.play();

        if (playRequest && typeof playRequest.catch === 'function') {
            playRequest.catch(function () {
                overlay.classList.remove('is-hidden');
            });
        }
    }

    overlay.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayback();
    });

    video.addEventListener('click', function () {
        if (!loaded || video.paused) {
            startPlayback();
        } else {
            video.pause();
        }
    });

    video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
            overlay.classList.remove('is-hidden');
        }
    });

    video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}

Array.from(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
