console.log("lets write javascript");

let songs = [];
let currfolder;
let currentsong = new Audio();

/* ===================== UTIL ===================== */
function secondsToMMSS(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// clear songname
function cleanSongName(path) {
  return path
    .split(/[\\/]/)      // split on / OR \
    .pop()               // take filename
    .replace(".mp3", ""); // remove extension
}

/* ===================== GET SONGS ===================== */
async function getsongs(folder) {
  currfolder = folder;
  let a = await fetch(`/songs/${folder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let as = div.getElementsByTagName("a");
   songs = [];

  for (let a of as) {
    if (a.href.endsWith(".mp3")) {
      let fullURL = decodeURIComponent(a.href); // ✅ real playable URL
      songs.push(fullURL);
    }
  }



  //
  for (const song of songs) {
    songul.innerHTML += `
    <li data-song="${song}">
      <img class="invert" src="img/music.svg">
      <div class="info">
        <div>${cleanSongName(song)}</div>
        <div>Moti💖</div>
      </div>
      <div class="playnow">
        <span>Play now</span>
        <img class="invert" src="img/play.svg">
      </div>
    </li>`;
  }

  /* ---------- Playlist click ---------- */
  Array.from(document.querySelectorAll(".songlist li")).forEach(li => {
    li.addEventListener("click", () => {
      playmusic(li.dataset.song);
    });
  });

  // /* ---------- Play / Pause ---------- */
  // play.addEventListener("click", () => {
  //   if (currentsong.paused) {
  //     currentsong.play();
  //     play.src = "img/pause.svg";
  //   } else {
  //     currentsong.pause();
  //     play.src = "img/play.svg";
  //   }
  // });
}

/* ===================== PLAY MUSIC ===================== */
const playmusic = (track, pause = false) => {
  currentsong.src = track;


  document.querySelector(".songinfo").innerText = cleanSongName(track);
  document.querySelector(".songtime").innerText = "00:00/00:00";

  if (!pause) {
    currentsong.play();
    play.src = "img/pause.svg";
  } else {
    play.src = "img/play.svg";
  }
};
/* ===================== MAIN ===================== */
async function main() {
   await getsongs("songs/ncs");

  // Load default song (not autoplay)
  playmusic(songs[0], true);

  /* ---------- Render playlist ---------- */
  let songul = document.querySelector(".songlist ul");
  songul.innerHTML = "";



  // //
  // for (const song of songs) {
  //   songul.innerHTML += `
  //   <li data-song="${song}">
  //     <img class="invert" src="img/music.svg">
  //     <div class="info">
  //       <div>${cleanSongName(song)}</div>
  //       <div>Moti💖</div>
  //     </div>
  //     <div class="playnow">
  //       <span>Play now</span>
  //       <img class="invert" src="img/play.svg">
  //     </div>
  //   </li>`;
  // }

  // /* ---------- Playlist click ---------- */
  // Array.from(document.querySelectorAll(".songlist li")).forEach(li => {
  //   li.addEventListener("click", () => {
  //     playmusic(li.dataset.song);
  //   });
  // });

  /* ---------- Play / Pause ---------- */
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "img/pause.svg";
    } else {
      currentsong.pause();
      play.src = "img/play.svg";
    }
  });

  /* ---------- Time update ---------- */
  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML =
      `${secondsToMMSS(currentsong.currentTime)}/${secondsToMMSS(currentsong.duration)}`;

    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  /* ---------- Seekbar ---------- */
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  /* ---------- Previous ---------- */
  previous.addEventListener("click", () => {
    let currentFile = currentsong.src.split("/").pop();
    let index = songs.findIndex(song => song.endsWith(currentFile));

    if (index > 0) {
      playmusic(songs[index - 1]);
    }
  });
  /* ---------- Next ---------- */
  next.addEventListener("click", () => {
    let currentFile = currentsong.src.split("/").pop();
    let index = songs.findIndex(song => song.endsWith(currentFile));

    if (index < songs.length - 1) {
      playmusic(songs[index + 1]);
    }
  });

  /* ---------- Mobile menu ---------- */
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  //add an event to volume;
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    // console.log(e);
    currentsong.volume = parseInt(e.target.value) / 100;
  })

  // load the playlist whenever card is  clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click",async item => {
      console.log(item.target,item.target.dataset);
      songs = await getsongs(`songs/${item.dataset.folder}`);

    })
  })

}

main();