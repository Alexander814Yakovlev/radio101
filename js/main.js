let main = document.querySelector('.main')
let update = document.getElementById('update')
let burger = document.querySelector('.burger')
let cover = document.querySelector('.cover>img')
let coverDeafault = 'img/plug.png'
let audioPlayer = document.getElementById('audio-player')
let stationTitle = document.querySelector('h1')
let rightMenu = document.querySelector('.all__stations')
let rightMenuList = document.querySelector('.all__stations-list')

let playButton = document.getElementById('play')
let pauseButton = document.getElementById('pause')
let prevButton = document.getElementById('prev')
let nextButton = document.getElementById('next')

let currentStationIndex = 0;
let stationList;

pauseButton.hidden = true
rightMenu.hidden = true

// Парсинг 101.ру
async function getStation(i) {
    let response = await fetch(
        `https://101.ru/api/channel/getListServersChannel/${i}/channel`
    );
    if (response.ok) {
        let text = await response.json();
        if (text["status"] == 1) {
            return [
                text["result"][0]["titleChannel"],
                text["result"][0]["urlStream"],
            ];
        }
    }
}

async function getCover(i) {
    let response = await fetch(`https://101.ru/radio/channel/${i}`);
    if (response.ok) {
        let html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        let cover_;
        try {
            let elem = doc.getElementsByClassName("channel-info__logo");
            cover_ = elem[0].getAttribute("data-src");
        } catch (e) {
            let elem = doc.getElementsByClassName("channel-info__img");
            cover_ = "https://101.ru" + elem[0].getAttribute("src");
        }
        return cover_;
    }
    return coverDeafault
}

async function getStationList() {
    if (localStorage.radio101) {
        stationList = JSON.parse(localStorage.radio101)
    } else {
        let list = [];
        for (let i = 1; i < 460; i++) {
            try {
                let station = await getStation(i);
                let stationCover = await getCover(i);
                let info = {
                    title: station[0],
                    src: station[1],
                    cover: stationCover,
                }
                list.push(info);
            }
            catch (e) {
                console.log(i)
            }
        }
        localStorage.setItem('radio101', JSON.stringify(list));
        stationList = list;
    }
}

// Основные функции
async function createStationList() {
    await getStationList()
    for (elem of stationList) {
        let li = document.createElement('li');
        let thumb = document.createElement('img')
        let link = document.createElement('button')
        li.className = 'all__stations-item'
        li.dataset.index = stationList.indexOf(elem)
        thumb.src = elem.cover
        thumb.className = 'thumb'
        link.textContent = elem.title
        link.className = 'all__stations-button'
        li.append(thumb)
        li.append(link)
        rightMenuList.append(li)
        li.addEventListener('click', function (e) {
            currentStationIndex = e.target.closest('li').dataset.index;
            playStream(currentStationIndex)
            rightMenu.hidden = true;
            main.style.background = ''

        })
    }
    document.querySelector('h1').textContent = "Онлайн радио"
}

async function playStream(i) {
    let currentStation = stationList[i];
    stationTitle.textContent = currentStation.title;
    audioPlayer.src = currentStation.src;
    cover.src = currentStation.cover;

    audioPlayer.play();
    [pauseButton.hidden, playButton.hidden] = [false, true];
}

async function pauseStream() {
    audioPlayer.pause();
    [pauseButton.hidden, playButton.hidden] = [true, false];
}


// Обработка нажатий
update.onclick = function() {
    localStorage.removeItem('radio101');
    document.querySelector('h1').textContent = "Обновление списка станций..."
    createStationList()
}

burger.onclick = function () {
    rightMenu.hidden = false;
    if (!rightMenu.hidden) {
        main.style.background = 'rgba(0, 0, 0, 0.6)';
        main.addEventListener('click', function (e) {
            if (e.target != burger && !e.target.closest('.burger')) {
                rightMenu.hidden = true;
                main.style.background = ''
            }
        })
    }
}

playButton.onclick = async function () {
    playStream(currentStationIndex);
}

pauseButton.onclick = async function () {
    pauseStream();
}

nextButton.onclick = async function () {
    if (currentStationIndex < stationList.length - 1) {
        currentStationIndex++;
    } else {
        currentStationIndex = 0;
    }
    pauseStream();
    playStream(currentStationIndex);
}

prevButton.onclick = async function () {
    if (currentStationIndex > 0) {
        currentStationIndex--;
    } else {
        currentStationIndex = stationList.length - 1;
    }
    pauseStream();
    playStream(currentStationIndex);
}

createStationList()