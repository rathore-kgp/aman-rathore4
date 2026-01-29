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
  return path
    .replace(/\\/g, "/")
    .split("/")
    .pop()
    .replace(".mp3", "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ===================== GET SONGS ===================== */
async function getSongs(folder) {
  const res = await fetch(`/songs/${folder}/`);
  const text = await res.text();

  const div = document.createElement("div");
  div.innerHTML = text;

  const links = Array.from(div.getElementsByTagName("a"));
  songs = links
    .filter(a => a.href.endsWith(".mp3"))
    .map(a => decodeURIComponent(a.href));

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

  Array.from(songUL.children).forEach(li => {
    li.addEventListener("click", () => {
      currentIndex = Number(li.dataset.index);
      playMusic(currentIndex);
    });
  });
}

/* ===================== PLAY MUSIC ===================== */
function playMusic(index, pause = false) {
  if (index < 0 || index >= songs.length) return;

  currentIndex = index;
  currentSong.src = songs[currentIndex];

  document.querySelector(".songinfo").innerText =
    cleanSongName(songs[currentIndex]);
  document.querySelector(".songtime").innerText = "00:00/00:00";

  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  } else {
    play.src = "img/play.svg";
  }
}

/* ===================== DISPLAY ALBUMS ===================== */
async function displayalbums() {
  const res = await fetch("/songs/");
  const html = await res.text();

  const div = document.createElement("div");
  div.innerHTML = html;

  const anchors = Array.from(div.getElementsByTagName("a"));
  const cardcontainer = document.querySelector(".card-container");
  cardcontainer.innerHTML = "";

  for (const a of anchors) {
    const href = a.getAttribute("href");
    if (!href.startsWith("/songs/")) continue;
    if (href.includes(".")) continue;

    let name = href.replace("/songs/", "").replace("/", "");

    try {
      const metaRes = await fetch(`/songs/${name}/info.json`);
      console.log("metaRes:", metaRes);

      if (!metaRes.ok) continue;

      const meta = await metaRes.json();

      cardcontainer.innerHTML += `
        <div class="card" data-folder="${name}">
          <div class="play">
            <img src="./img/play.svg">
          </div>
          <img src="./songs/${name}/cover.jpg">
          <h2>${meta.title}</h2>
          <p>${meta.description}</p>
        </div>
      `;
    } catch (err) {
      console.error("Metadata error for", name, err);
    }
  }
}

/* ===================== MAIN ===================== */
async function main() {
  await getSongs("ncs");
  renderSongs();
  playMusic(0, true);
  displayalbums();

  /* Play / Pause */
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  /* Next */
  next.addEventListener("click", () => {
    if (currentIndex < songs.length - 1) {
      playMusic(currentIndex + 1);
    }
  });

  /* Previous */
  previous.addEventListener("click", () => {
    if (currentIndex > 0) {
      playMusic(currentIndex - 1);
    }
  });

  /* Time update */
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerText =
      `${secondsToMMSS(currentSong.currentTime)}/${secondsToMMSS(currentSong.duration)}`;

    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  /* Seekbar */
  document.querySelector(".seekbar").addEventListener("click", e => {
    const percent = e.offsetX / e.target.offsetWidth;
    currentSong.currentTime = currentSong.duration * percent;
  });

  /* Volume */
  document.querySelector(".range input").addEventListener("input", e => {
    currentSong.volume = e.target.value / 100;
    if(currentSong.volume>0){
      document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg","volume.svg");
    }
  });

  /* Album click */
  document.querySelector(".card-container").addEventListener("click", async e => {
    const card = e.target.closest(".card");
    if (!card) return;

    await getSongs(card.dataset.folder);
    renderSongs();
    playMusic(0, true);
  });

  /* ✅ HAMBURGER FIX */
  const hamburger = document.querySelector(".hamburger");
  const left = document.querySelector(".left");
  const closeBtn = document.querySelector(".close");

  hamburger.addEventListener("click", () => {
    left.style.left = "0";
  });

  closeBtn.addEventListener("click", () => {
    left.style.left = "-120%";
  });
//add an event listner to mute the track
document.querySelector(".volume img").addEventListener("click",e=>{
  
  if(e.target.src.includes("img/volume.svg")){
    e.target.src = e.target.src.replace("img/volume.svg","img/mute.svg");
    currentSong.volume = 0;
    document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
  }
  else{
     e.target.src = e.target.src.replace("img/mute.svg","img/volume.svg");
    currentSong.volume = 0.10;
    document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
  }
})


}

main();
