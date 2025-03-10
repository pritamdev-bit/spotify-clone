// console.log("Let's code javascript!");

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
    console.log(arst);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
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
                    // console.log(e.querySelector(".info").firstElementChild.innerHTML)
                    playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
                })
                // console.log(e);
            })
            return songs;
}

const playMusic = (track) => {
    // let audio = new Audio("/songs/" + track);
    currentSong.src = `/${currfolder}/` + track;
    currentSong.play();
    document.getElementById("play").src = "img/pause.svg";
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];
            // console.log(folder)
            //Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            // console.log(response);
            let cardContainer = document.querySelector(".cardContainer")
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50" fill="none">
            <circle cx="12" cy="12" r="10" fill="limegreen" />
            <polygon points="9,7 17,12 9,17" fill="black" />
            </svg>
            </div>
            <img src="/songs/${folder}/cover.jpeg"
            alt="cover">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
            </div>`
        }
    }
    // load the playlist when card clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder
                }`)
            playMusic(songs[0].replaceAll("%20", " "));
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
        // console.log(currentSong.currentTime, currentSong.duration);
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
        // console.log("you clicked previous button");

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playMusic(songs[index - 1].replaceAll("%20", " "));
        }
    })

    // Add an event listener for next
    next.addEventListener('click', () => {
        // console.log("you clicked next button");
        // console.log(currentSong.src.split("/").slice(-1)[0]);

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1].replaceAll("%20", " "));
        }
    })

    // Add an eventlistnr to volume
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("click", (e) => {
        // console.log(e.target, e.target.value);
        currentSong.volume = parseInt(e.target.value) / 100
    })

    //Mute volume eventlistnr
    document.querySelector(".volume>img").addEventListener("click", e=> {
        if(e.target.src.includes("volume.svg")) {
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