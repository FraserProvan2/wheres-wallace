const levels = 5;
const initialPeopleCount = 50;
const maxPeopleCount = 200;
const timeLimit = 8;
const base_scaling = 75;
let currentLevel = 1;
let startTime;
let timerInterval;
let backgroundIndex = 0;

const stageLabels = [
  "1: Echoes of a Peaceful Past - Wallace in a busy market before the chaos",
  "2: Highland Refuge - Wallace in a remote highland village, beginning the fight",
  "3: Stirling Bridge - Wallace’s daring tactics at Stirling Bridge",
  "4: Falkirk's Fury - Wallace faces overwhelming odds at Falkirk",
  "5: The Final Stand - Wallace’s last epic battle for freedom"
];

function loadHighScores() {
  const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  const highScoresDiv = document.getElementById('high-scores');
  
  if (highScores.length === 0) {
    highScoresDiv.innerHTML = '';
    return;
  }

  highScoresDiv.innerHTML = '<h3>High Scores</h3>';
  highScores.slice(0, 5).forEach((score, index) => {
    highScoresDiv.innerHTML += `<p>${index + 1}. ${score.name}: ${score.time} seconds</p>`;
  });
}

function saveHighScore(newScore) {
  const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  highScores.push(newScore);
  highScores.sort((a, b) => a.time - b.time);
  localStorage.setItem('highScores', JSON.stringify(highScores));
}

function getRandomPosition(maxWidth, maxHeight, elementWidth, elementHeight) {
  const restrictedTopMargin = maxHeight * 0.1;
  const x = Math.random() * (maxWidth - elementWidth);
  const y = Math.random() * (maxHeight - restrictedTopMargin - elementHeight) + restrictedTopMargin;
  return { x, y };
}

function startGame() {
  const playerName = document.getElementById('player-name').value;
  if (!playerName) {
    alert('Please enter your name to start the game.');
    return;
  }

  document.getElementById('start-button').disabled = true;
  document.querySelector('.container').style.display = 'none';
  document.getElementById('game-area').style.display = 'block';
  startTime = new Date();

  loadAssetsAndStartLevel(playerName);
}

function loadAssetsAndStartLevel(playerName) {
  const backgroundImages = [
    '1.png',
    '2.png',
    '3.png',
    '4.png',
    '5.png'
  ];
  const peopleImages = [
    'person1.png',
    'person2.png',
    'person3.png',
    'person4.png',
    'person5.png',
    'person6.png'
  ];

  nextLevel(backgroundImages, peopleImages, playerName);
}

function nextLevel(backgroundImages, peopleImages, playerName) {
  if (currentLevel > levels) {
    endGame(playerName);
    return;
  }

  resetGameArea();
  setupBackground(backgroundImages);
  setupPeople(peopleImages, backgroundImages, playerName);
  setupProgressBar();
  updateStageLabel();
  startTimer(playerName);
}

function resetGameArea() {
  const gameArea = document.getElementById('game-area');
  gameArea.innerHTML = '<div id="progress-bar"><div id="progress"></div></div><div id="stage-label"></div>';
}

function setupBackground(backgroundImages) {
  if (backgroundIndex >= backgroundImages.length) {
    backgroundIndex = 0;
  }
  const selectedBackground = backgroundImages[backgroundIndex++];
  const gameArea = document.getElementById('game-area');
  gameArea.style.backgroundImage = `url('./images/backgrounds/${selectedBackground}')`;
}

function setupPeople(peopleImages, backgroundImages, playerName) {
  const scale = 1 - (currentLevel - 1) * 0.1;
  const gameArea = document.getElementById('game-area');
  const gameAreaWidth = gameArea.offsetWidth;
  const gameAreaHeight = gameArea.offsetHeight;

  let peopleCount = initialPeopleCount + Math.floor((maxPeopleCount - initialPeopleCount) * (currentLevel - 1) / (levels - 1));

  if (currentLevel === levels) {
    peopleCount *= 20;
  }

  for (let i = 0; i < peopleCount; i++) {
    createCharacter(peopleImages, gameAreaWidth, gameAreaHeight, scale);
  }

  createWallace(gameAreaWidth, gameAreaHeight, scale, backgroundImages, peopleImages, playerName);
}

function createCharacter(peopleImages, gameAreaWidth, gameAreaHeight, scale) {
  const img = document.createElement('img');
  
  let availablePeopleImages = peopleImages.slice(0, 4);

  if (currentLevel >= 3) {
    availablePeopleImages = peopleImages.slice(0, 6);
  }
  
  img.src = `./images/people/${availablePeopleImages[Math.floor(Math.random() * availablePeopleImages.length)]}`;
  img.className = 'character';
  img.style.width = `${base_scaling * scale}px`;
  img.style.height = `${base_scaling * scale}px`;

  const position = getRandomPosition(gameAreaWidth, gameAreaHeight, base_scaling * scale, base_scaling * scale);
  img.style.left = `${position.x}px`;
  img.style.top = `${position.y}px`;

  document.getElementById('game-area').appendChild(img);
}

function createWallace(gameAreaWidth, gameAreaHeight, scale, backgroundImages, peopleImages, playerName) {
  const wallace = document.createElement('img');
  wallace.src = './images/william_wallace.png';
  wallace.className = 'character wallace';
  wallace.style.width = `${base_scaling * scale}px`;
  wallace.style.height = `${base_scaling * scale}px`;

  const wallacePosition = getRandomPosition(gameAreaWidth, gameAreaHeight, base_scaling * scale, base_scaling * scale);
  wallace.style.left = `${wallacePosition.x}px`;
  wallace.style.top = `${wallacePosition.y}px`;

  const directions = ['scaleX(1)', 'scaleX(-1)'];
  wallace.style.transform = directions[Math.floor(Math.random() * directions.length)];

  wallace.addEventListener('click', () => {
    highlightWallace(wallace, true);
    setTimeout(() => {
      alert('You found Wallace!');
      clearInterval(timerInterval);
      currentLevel++;
      nextLevel(backgroundImages, peopleImages, playerName);
    }, 100);
  });

  document.getElementById('game-area').appendChild(wallace);
}

function setupProgressBar() {
  const progressBar = document.getElementById('progress');
  progressBar.style.width = '0%';
}

function startTimer(playerName) {
  let elapsedTime = 0;
  const progressBar = document.getElementById('progress');
  const currentLimit = currentLevel === levels ? timeLimit * 2 : timeLimit;
  timerInterval = setInterval(() => {
    elapsedTime += 0.1;
    progressBar.style.width = `${(elapsedTime / currentLimit) * 100}%`;
    if (elapsedTime >= currentLimit) {
      clearInterval(timerInterval);
      const wallace = document.querySelector('#game-area .wallace');
      highlightWallace(wallace, false);
      setTimeout(() => {
        alert('Time\'s up! You lost.');
        resetGame(playerName);
      }, 100);
    }
  }, 100);
}

function highlightWallace(wallace, found) {
  if (wallace) {
    wallace.style.outline = found ? '3px solid green' : '3px solid red';
    wallace.style.boxShadow = found ? '0 0 10px green' : '0 0 10px red';
    wallace.style.backgroundColor = found ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)';
    wallace.style.zIndex = 1000;
  }
}

function updateStageLabel() {
  const stageLabel = document.getElementById('stage-label');
  if (currentLevel <= stageLabels.length) {
    stageLabel.textContent = stageLabels[currentLevel - 1];
  } else {
    stageLabel.textContent = 'Congratulations!';
  }
}

function resetGame(playerName) {
  document.getElementById('game-area').style.display = 'none';
  document.querySelector('.container').style.display = 'block';
  document.getElementById('start-button').disabled = false;
  currentLevel = 1;
  backgroundIndex = 0;
  loadHighScores();
}

function endGame(playerName) {
  const endTime = new Date();
  const timeTaken = (endTime - startTime) / 1000;

  saveHighScore({ name: playerName, time: timeTaken });

  alert(`Congratulations, ${playerName}! You completed the game in ${timeTaken} seconds.`);
  resetGame(playerName);
}

document.getElementById('start-button').addEventListener('click', startGame);
window.onload = loadHighScores;
