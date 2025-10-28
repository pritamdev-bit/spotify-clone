let currentSong = new Audio();
let songs;
let currfolder;

function formatTime(seconds) {
    const totalSeconds = Math.floor(seconds); // Ensures only whole seconds are used
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let aJson = await fetch(`/${folder}/info.json`);
    let arst = await aJson.json();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`%5C`)[3]);
        }
    }

    //all songs in playlist
    let songUL = document.getElementById("ulList");
    songUL.innerHTML = "";
    songs.forEach(song => {
        songUL.innerHTML = songUL.innerHTML + `<li>
    <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                  <div class="widthing">${song.replaceAll("%20", " ")}</div>
                  <div class="widthing">${arst.artist}</div>
                </div>
                <div class="playnow">
                  <span>Play Now</span>
                  <img src="img/play.svg" alt="play" class="invert">
                </div> </li>` ;
    });

    //Attach evtlistnr to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener('click', element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })
    return songs;
}

const playMusic = (track) => {
    currentSong.src = `/${currfolder}/` + track;
    currentSong.play();
    document.getElementById("play").src = "img/pause.svg";
    document.querySelector(".songinfo").innerHTML = track.replaceAll("%20", " ");
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        let e = array[index];
        if (e.href.includes("songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder.replaceAll("%5Csongs", "")}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="/songs/${folder.replaceAll("%5Csongs%5C", "")}/cover.jpeg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder.replaceAll("%5Csongs%5C", "")}`)
            playMusic(songs[0])

        })
    })
}


async function main() {
    //list of all songs
    await getSongs("songs/cs");

    //Display all albums
    displayAlbums();

    //Attach an event listnr to play, next and prev
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            document.getElementById("play").src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            document.getElementById("play").src = "img/play.svg"

        }
    })

    // Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `
        ${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}
        `;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Event listnr to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = (percent + "%");
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener('click', () => {
        document.querySelector(".left").style.left = "0";
    })

    // Add an event listener for close Button
    document.querySelector(".close").addEventListener('click', () => {
        document.querySelector(".left").style.left = "-120%";
    })

    // Add an event listener for previous
    previous.addEventListener('click', () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playMusic(songs[index - 1].replaceAll("%20", " "));
        }
    })

    // Add an event listener for next
    next.addEventListener('click', () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1].replaceAll("%20", " "));
        }
    })

    // Add an eventlistnr to volume
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("click", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })

    //Mute volume eventlistnr
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = .50;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 50;
        }
    })
}


main();