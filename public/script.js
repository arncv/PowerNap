// POMODORO

const timer = {
  pomodoro: 1500,
  shortBreak: 300,
  longBreak: 900
};
let mode = 'pomodoro';
let totalTime = 1500;
let timeRemaining;
let pomodoroInterval;
let pomodoroRounds = 0;
let pause = false;
const controlBtn = document.querySelector('#control');

const updateClock = time => {
  let min = Math.floor(time / 60);
  let sec = time - min * 60;
  min = min < 10 ? `0${min}` : min;
  sec = sec < 10 ? `0${sec}` : sec;
  const element = document.querySelector('.clock');
  element.textContent = `${min}:${sec}`;
};

const startTimer = () => {
  timeRemaining = timer[mode];
  if (pause) {
    updateTimer();
    pause = false;
  }
  pomodoroInterval = setInterval(updateTimer, 1000);
  controlBtn.dataset.action = 'pause';
  controlBtn.textContent = 'pause';
};

const stopTimer = () => {
  clearInterval(pomodoroInterval);
  controlBtn.dataset.action = 'start';
  controlBtn.textContent = 'start';
};

const playNotification = () => {
  let count = 1;
  const notification = document.getElementById('notification');
  notification.src = 'assets/sound-effects/notification.mp3';
  notification.play();
  notification.addEventListener('ended', () => {
    if (count < 3) {
      count++;
      notification.play();
    }
  });
};

const updatePomodoroProgress = () => {
  const progressBarPerimeter = 2 * Math.PI * 135;
  const dashLength = (progressBarPerimeter * timeRemaining) / totalTime;
  const pomodoroProgressBar = document.querySelector('.pomodoro-progress-bar');
  // stroke-dasharray: first value = dash length, second value = gap length
  pomodoroProgressBar.style.strokeDasharray = `${dashLength}, ${
    progressBarPerimeter - dashLength
  }`;
  if (dashLength === 0) {
    pomodoroProgressBar.style.strokeWidth = `0`;
  }
};

const switchMode = newMode => {
  mode = newMode;
  totalTime = timer[mode];
  const clock = document.querySelector('.clock');
  clock.textContent =
    mode === 'shortBreak' ? '05:00' : mode === 'longBreak' ? '15:00' : '25:00';
  const menuBtns = document.querySelectorAll('.pomodoro-menu button');
  menuBtns.forEach(button => {
    button.classList.toggle('active', button.dataset.mode === mode);
  });
};

const resetClock = () => {
  timer.pomodoro = 1500;
  timer.shortBreak = 10;
  timer.longBreak = 900;
  controlBtn.removeAttribute('disabled', '');
  const pomodoroProgressBar = document.querySelector('.pomodoro-progress-bar');
  pomodoroProgressBar.style.strokeWidth = `1rem`;
  pomodoroProgressBar.style.strokeDasharray = `${Math.PI * 2 * 135}`;
  pause = false;
};

const handleTimerEnd = async () => {
  stopTimer();
  controlBtn.setAttribute('disabled', '');
  
  playNotification();
 
  fetch('/send-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: 'message' })
  }).then(response => response.json())
  .then(data => {
    console.log(data);
    // do something with the data received
  })
  .catch(error => {
    console.error('Error:', error);
  });
   send_message();

  setTimeout(() => {
    resetClock();
    if (mode !== 'pomodoro') {
      switchMode('pomodoro');
    } else {
      pomodoroRounds++;
      if (pomodoroRounds <= 3) {
        switchMode('shortBreak');
      } else {
        switchMode('longBreak');
        // reset pomodoro rounds, after the long break it'll restart the pomodoro circle
        pomodoroRounds = 0;
      }
    }
    startTimer();
  }, 6000);
};

const updateTimer = () => {
  timer[mode] = timeRemaining--;
  if (timer[mode] === 0) {
    handleTimerEnd();
    return;
  }
  updateClock(timeRemaining);
  updatePomodoroProgress();
};

controlBtn.addEventListener('click', e => {
  const action = e.target.dataset.action;
  if (action === 'start') {
    startTimer();
    // safari fix: safari doesn't play audio without a user interaction first
    // play a silent audio on first interaction on page, before we actually need the sound effect, then we modify the audio src
    const notification = document.getElementById('notification');
    notification.src =
      'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
    notification.play();
  } else {
    stopTimer();
    pause = true;
  }
});

// switch mode: pomodoro, short break, long break
const pomodoroMenu = document.querySelector('.pomodoro-menu');
pomodoroMenu.addEventListener('click', e => {
  if (e.target.tagName !== 'BUTTON') return;
  switchMode(e.target.dataset.mode);
  stopTimer();
  resetClock();
  // reset the rounds when user manually switch modes
  pomodoroRounds = 0;
});

// MUSIC PLAYER

const songs = [
  {
    title: 'Spring Blossom',
    source: 'spirit-blossom.mp3',
    cover: 'spirit-blossom.jpg'
  },
  {
    title: 'Thousand Miles',
    source: 'chillhop-thousand-miles.mp3',
    cover: 'chillhop-thousand-miles.jpg'
  },
  {
    title: 'Motivation',
    source: 'acoustic-motivation.mp3',
    cover: 'acoustic-motivation.jpg'
  },
  {
    title: 'Lofi Song',
    source: 'chill-lofi-song.mp3',
    cover: 'chill-lofi-song.jpg'
  },
  {
    title: 'In the room',
    source: 'in-the-room.mp3',
    cover: 'in-the-room.jpg'
  },
  {
    title: 'Lofi',
    source: 'lofi.mp3',
    cover: 'lofi.jpg'
  },
  {
    title: 'Rain and Nostalgia',
    source: 'rain-and-nostalgia.mp3',
    cover: 'rain-and-nostalgia.jpg'
  },
  {
    title: 'Sunset Vibes',
    source: 'sunset-vibes.mp3',
    cover: 'sunset-vibes.jpg'
  },
  {
    title: 'Travel to the City',
    source: 'travel-to-the-city.mp3',
    cover: 'travel-to-the-city.jpg'
  },
  {
    title: 'Where the light is',
    source: 'where-the-light-is.mp3',
    cover: 'where-the-light-is.jpg'
  },
  {
    title: 'The Beat of Nature',
    source: 'the-beat-of-nature.mp3',
    cover: 'the-beat-of-nature.jpg'
  },
  {
    title: 'To meet the light',
    source: 'to-meet-the-light.mp3',
    cover: 'to-meet-the-light.jpg'
  }
];

let songIndex = 0;
const audio = document.getElementById('audio');
const musicContainer = document.querySelector('.music-container');

const playSong = () => {
  musicContainer.classList.add('play');
  // replace play icon with pause icon
  document.querySelector('#play i').classList.remove('fa-play');
  document.querySelector('#play i').classList.add('fa-pause');
  audio.play();
};

const pauseSong = () => {
  musicContainer.classList.remove('play');
  document.querySelector('#play i').classList.add('fa-play');
  document.querySelector('#play i').classList.remove('fa-pause');
  audio.pause();
};

const loadSong = () => {
  const { title, source, cover } = songs[songIndex];
  audio.src = `assets/music/${source}`;
  document.getElementById('cover').src = `assets/images/${cover}`;
  document.querySelector('.song-title').textContent = title;
};

const nextSong = () => {
  songIndex++;
  if (songIndex === songs.length) {
    songIndex = 0;
  }
  loadSong();
  playSong();
};

const previousSong = () => {
  songIndex--;
  if (songIndex < 0) {
    songIndex = songs.length - 1;
  }
  loadSong();
  playSong();
};

const updateProgress = e => {
  const { duration, currentTime } = e.target;
  const progressPercent = (currentTime / duration) * 100;
  const progressBar = document.querySelector('.progress');
  progressBar.style.width = `${progressPercent}%`;
};

const setProgress = function (e) {
  // get total width of the progress container, this = progress container
  const totalWidth = this.clientWidth;
  // get the coordinate where the click event happened inside the progress container element, this will be the new progress width
  const progressWidth = e.offsetX;
  const songDuration = audio.duration;
  // set the new currentTime
  audio.currentTime = (progressWidth * songDuration) / totalWidth;
};

// Event Listeners

// play song
document.getElementById('play').addEventListener('click', () => {
  const isPlaying = document
    .querySelector('.music-container')
    .classList.contains('play');
  // if there's a song playing, pause
  if (isPlaying) {
    pauseSong();
    return;
  }
  playSong();
});

// change song: next and previous
document.getElementById('next').addEventListener('click', nextSong);
document.getElementById('prev').addEventListener('click', previousSong);

// Song ends: ended event
audio.addEventListener('ended', nextSong);

// Update progress: timeupdate event is fired when currentTime attribute has been updated
audio.addEventListener('timeupdate', updateProgress);

// Click on the progress bar, change song's current time
document
  .querySelector('.progress-container')
  .addEventListener('click', setProgress);

// load song
loadSong();



  
