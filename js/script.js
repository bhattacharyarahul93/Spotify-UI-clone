console.log("let's write some javascript");

let currentSong = new Audio();
let songs;
let currentFolder;
let folder;

function secondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currentFolder = folder;
    console.log(folder)
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    // console.log(response);
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

    //show all the song in playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>artis name</div>
                            </div>

                            <div class="playNow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div>
                            </li>`;
    }

    //attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track);
    currentSong.src = `/${currentFolder}/` + track;
    // console.log(currentFolder)
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {

    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let res = await a.text();
    let div = document.createElement("div");
    div.innerHTML = res;
    // console.log(div)
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            
        // console.log(e.href);
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0];
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder=  ${folder} class="card">
            <div class="playButton">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                    <path
                        d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"
                        fill="black" />
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpeg" alt="">
            <h3>${response.title}</h3>
            <p>${response.description}</p>
        </div>`
        }
    }

    //load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        // console.log(e);
        e.addEventListener("click", async item =>{
            // console.log(item.currentTarget.dataset);
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

async function main() {


    //get the list of the all songs
    await getSongs(`songs/cheques`);
    playMusic(songs[0], true);

    //display all the albums on the page
    displayAlbums();

    //play the first song
    //var audio = new Audio(songs[0]);
    // audio.play();

    // audio.addEventListener("ontimeupdate", () => {
    //     let duration = audio.duration;
    //     console.log(duration);
    // })

    //attach an event listener to previous, play & next
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    //listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songTime").innerHTML = `${secondsToMinutes(currentSong.currentTime)} / ${secondsToMinutes(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

        if (currentSong.currentTime == currentSong.duration) {
            play.src = "img/play.svg";
        }

        //Autoplay the next song when the current one ends
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        currentSong.addEventListener("ended", ()=>{
            playMusic(songs[index + 1]);
        })
    });

    //add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    //add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    });

    //add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    //add event listener to previous
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            console.log("previous clicked");
            playMusic(songs[index - 1]);
        }
    });

    //add event listener to next
    next.addEventListener("click", () => {
        currentSong.pause();

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            console.log("next clicked");
            playMusic(songs[index + 1]);
        }
    });

    //add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume === 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/volume.svg", "img/mute.svg");
        }
        else{
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/mute.svg", "img/volume.svg");
        }
    });

    //add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        console.log(e.target)
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });
}

main();
