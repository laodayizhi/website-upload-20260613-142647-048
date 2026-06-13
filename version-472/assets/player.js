(function () {
    window.initCinemaPlayer = function (config) {
        var root = document.querySelector(config.element);

        if (!root) {
            return;
        }

        var video = root.querySelector("video");
        var overlay = root.querySelector(".player-overlay");
        var source = config.source;
        var loaded = false;
        var hls = null;

        function loadSource() {
            if (loaded || !video || !source) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }

            loaded = true;
        }

        function startPlayback() {
            loadSource();

            if (overlay) {
                overlay.classList.add("is-hidden");
            }

            if (video) {
                video.controls = true;
                var attempt = video.play();

                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {});
                }
            }
        }

        if (overlay) {
            overlay.addEventListener("click", startPlayback);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    startPlayback();
                }
            });
        }
    };
})();
