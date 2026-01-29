console.log("lets write javascript");

let songs = [];
let currentIndex = 0;
let currentSong = new Audio();

/* ===================== UTIL ===================== */
function secondsToMMSS(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function cleanSongName(path) {
  return decodeURIComponent(path)
    .split("/")
    .pop()
    .replace(".mp3", "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ===================== GET SONGS (FIXED) ===================== */
async function getSongs(folder) {
  const res = await fetch(`/songs/${encodeURIComponent(folder)}/songs.json`);
  const files = await res.json();

  songs = files.map(
    song => `/songs/${encodeURIComponent(folder)}/${encodeURIComponent(song)}`
  );

  currentIndex = 0;
}

/* ===================== RENDER PLAYLIST ===================== */
function renderSongs() {
  const songUL = document.querySelector(".songlist ul");
  songUL.innerHTML = "";

  songs.forEach((song, index) => {
    songUL.innerHTML += `
      <li data-index="${index}">
        <img class="invert" src="img/music.svg">
        <div class="info">
          <div>${cleanSongName(song)}</div>
          <div>Moti💖</div>
        </div>
        <div class="playnow">
          <span>Play now</span>
          <img class="invert" src="img/play.svg">
        </div>
      </li>
    `;
  });

  [...songUL.children].forEach(li => {
    li.addEventListener("click", () => {
      playMusic(Number(li.dataset.index));
    });
  });
}

/* ===================== PLAY MUSIC ===================== */
function playMusic(index, pause = false) {
  if (!songs[index]) return;

  currentIndex = index;
  currentSong.src = songs[index];

  document.querySelector(".songinfo").innerText =
    cleanSongName(songs[index]);
  document.querySelector(".songtime").innerText = "00:00/00:00";

  pause ? currentSong.pause() : currentSong.play();
  play.src = pause ? "img/play.svg" : "img/pause.svg";
}

/* ===================== DISPLAY ALBUMS (FIXED) ===================== */
async function displayalbums() {
  const res = await fetch("/songs/albums.json");
  const albums = await res.json();

  const cardcontainer = document.querySelector(".card-container");
  cardcontainer.innerHTML = "";

  for (const folder of albums) {
    try {
      const metaRes = await fetch(`/songs/${encodeURIComponent(folder)}/info.json`);
      if (!metaRes.ok) continue;

      const meta = await metaRes.json();

      cardcontainer.innerHTML += `
        <div class="card" data-folder="${folder}">
          <div class="play">
            <img src="img/play.svg">
          </div>
          <img src="/songs/${encodeURIComponent(folder)}/cover.jpg">
          <h2>${meta.title}</h2>
          <p>${meta.description}</p>
        </div>
      `;
    } catch {}
  }
}

/* ===================== MAIN ===================== */
async function main() {
  await getSongs("ncs");
  renderSongs();
  playMusic(0, true);
  displayalbums();

  play.onclick = () =>
    currentSong.paused ? playMusic(currentIndex) : playMusic(currentIndex, true);

  next.onclick = () => playMusic(currentIndex + 1);
  previous.onclick = () => playMusic(currentIndex - 1);

  currentSong.ontimeupdate = () => {
    document.querySelector(".songtime").innerText =
      `${secondsToMMSS(currentSong.currentTime)}/${secondsToMMSS(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  };

  document.querySelector(".seekbar").onclick = e => {
    currentSong.currentTime =
      (e.offsetX / e.target.offsetWidth) * currentSong.duration;
  };

  document.querySelector(".card-container").onclick = async e => {
    const card = e.target.closest(".card");
    if (!card) return;

    await getSongs(card.dataset.folder);
    renderSongs();
    playMusic(0);
  };
}

main();