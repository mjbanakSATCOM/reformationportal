(function () {
  var player = document.getElementById("hymn-player");
  var btn = document.getElementById("hymn-toggle");
  var audio = document.getElementById("hymn-audio");
  var titleEl = player && player.querySelector(".hymn-player-title");
  if (!player || !btn || !audio) return;

  var tracks = [
    { src: "./assets/hymn-ein-feste-burg.mp3", title: "Ein feste Burg ist unser Gott" },
    { src: "./assets/hymn-aus-tiefer-not.mp3", title: "Aus tiefer Not schrei ich zu dir" },
    { src: "./assets/hymn-nun-komm.mp3", title: "Nun komm, der Heiden Heiland" },
    { src: "./assets/hymn-vom-himmel-hoch.mp3", title: "Vom Himmel hoch da komm ich her" }
  ];

  var index = 0;
  var advancing = false;
  audio.volume = 0.28;
  audio.loop = false;
  audio.setAttribute("playsinline", "");
  audio.playsInline = true;

  function setTitle() {
    if (titleEl) titleEl.textContent = tracks[index].title;
  }

  function setPlaying(on) {
    player.classList.toggle("is-playing", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute(
      "aria-label",
      on ? "Pause Luther hymn strings" : "Play Luther hymn strings"
    );
  }

  function loadTrack(i) {
    index = (i + tracks.length) % tracks.length;
    audio.src = tracks[index].src;
    setTitle();
  }

  function playCurrent() {
    var p = audio.play();
    if (p && p.then) {
      return p.then(function () { setPlaying(true); return true; }).catch(function () {
        setPlaying(false);
        return false;
      });
    }
    setPlaying(true);
    return Promise.resolve(true);
  }

  loadTrack(0);

  btn.addEventListener("click", function () {
    if (audio.paused) playCurrent();
    else {
      audio.pause();
      setPlaying(false);
    }
  });

  // Start on the visitor's first interaction (browsers block true autoplay).
  var firstEvents = ["pointerdown", "keydown", "touchstart"];
  var armed = true;
  function disarm() {
    if (!armed) return;
    armed = false;
    firstEvents.forEach(function (ev) {
      document.removeEventListener(ev, onFirstInteraction, true);
    });
  }
  function onFirstInteraction(e) {
    if (!armed) return;
    disarm();
    // Let the player button handle its own click so it doesn't toggle twice.
    if (e.target && player.contains(e.target)) return;
    if (audio.paused) playCurrent();
  }
  firstEvents.forEach(function (ev) {
    document.addEventListener(ev, onFirstInteraction, { capture: true, passive: true });
  });
  btn.addEventListener("click", disarm);

  audio.addEventListener("ended", function () {
    advancing = true;
    loadTrack(index + 1);
    playCurrent().then(function () { advancing = false; });
  });

  audio.addEventListener("pause", function () {
    if (!advancing && !audio.ended) setPlaying(false);
  });
  audio.addEventListener("play", function () { setPlaying(true); });

})();
