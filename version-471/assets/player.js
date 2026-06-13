(function () {
    function setupVideoPlayer(config) {
        var video = document.querySelector(config.videoSelector);
        var playButton = document.querySelector(config.playButtonSelector);
        var cover = document.querySelector(config.coverSelector);
        var attached = false;
        var hls = null;

        if (!video || !playButton || !cover || !config.source) {
            return;
        }

        function attachSource() {
            if (attached) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = config.source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(config.source);
                hls.attachMedia(video);
            } else {
                video.src = config.source;
            }

            attached = true;
        }

        function startPlayback() {
            attachSource();
            cover.classList.add("is-hidden");
            video.controls = true;

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        playButton.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            startPlayback();
        });

        cover.addEventListener("click", function () {
            startPlayback();
        });

        video.addEventListener("click", function () {
            if (!attached) {
                startPlayback();
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    window.setupVideoPlayer = setupVideoPlayer;
})();
