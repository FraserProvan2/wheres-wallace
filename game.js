const levels = 5;
const initialPeopleCount = 50;
const maxPeopleCount = 200;
const timeLimit = 8; // seconds
const base_scaling = 75;
let currentLevel = 1;
let startTime;
let timerInterval;

// Function to load high scores from local storage
function loadHighScores() {
  const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  const highScoresDiv = document.getElementById('high-scores');
  highScoresDiv.innerHTML = '<h3>High Scores</h3>';
  highScores.slice(0, 5).forEach((score, index) => {
    highScoresDiv.innerHTML += `<p>${index + 1}. ${score.name}: ${score.time} seconds</p>`;
  });
}

// Function to save a new high score to local storage
function saveHighScore(newScore) {
  const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  highScores.push(newScore);
  highScores.sort((a, b) => a.time - b.time); // Sort scores by time
  localStorage.setItem('highScores', JSON.stringify(highScores));
}

function getRandomPosition(maxWidth, maxHeight, elementWidth, elementHeight) {
  const restrictedTopMargin = maxHeight * 0.1; // Avoid top 10% of the screen
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
    'battleback1.png',
    'battleback2.png',
    'battleback3.png'
    // 'battleback4.png',
    // 'battleback5.png',
    // 'battleback6.png',
    // 'battleback7.png'
  ]; // Add all your background image names here
  const peopleImages = [
    'person1.png', 
    'person2.png',
    'person3.png',
    'person4.png',
    'person5.png',
    'person6.png'
  ]; // Add all your people image names here

  nextLevel(backgroundImages, peopleImages, playerName);
}

function nextLevel(backgroundImages, peopleImages, playerName) {
  if (currentLevel > levels) {
    endGame(playerName);
    return;
  }

  resetGameArea();
  setupBackground(backgroundImages);
  setupCharacters(peopleImages, backgroundImages, playerName);
  setupProgressBar();
  startTimer(playerName);
}

function resetGameArea() {
  const gameArea = document.getElementById('game-area');
  gameArea.innerHTML = '<div id="progress-bar"><div id="progress"></div></div>';
}

function setupBackground(backgroundImages) {
  const selectedBackground = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
  const gameArea = document.getElementById('game-area');
  gameArea.style.backgroundImage = `url('./images/backgrounds/${selectedBackground}')`;
}

function setupCharacters(peopleImages, backgroundImages, playerName) {
  const scale = 1 - (currentLevel - 1) * 0.1;
  const gameArea = document.getElementById('game-area');
  const gameAreaWidth = gameArea.offsetWidth;
  const gameAreaHeight = gameArea.offsetHeight;

  let peopleCount = initialPeopleCount + Math.floor((maxPeopleCount - initialPeopleCount) * (currentLevel - 1) / (levels - 1));

  if (currentLevel === levels) {
    peopleCount *= 20; // 20 times more characters in the final level
  }

  for (let i = 0; i < peopleCount; i++) {
    createCharacter(peopleImages, gameAreaWidth, gameAreaHeight, scale);
  }
  
  createWallace(gameAreaWidth, gameAreaHeight, scale, backgroundImages, peopleImages, playerName);
}

function createCharacter(peopleImages, gameAreaWidth, gameAreaHeight, scale) {
  const img = document.createElement('img');
  img.src = `./images/people/${peopleImages[Math.floor(Math.random() * peopleImages.length)]}`;
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
  wallace.className = 'character';
  wallace.style.width = `${base_scaling * scale}px`;
  wallace.style.height = `${base_scaling * scale}px`;

  const wallacePosition = getRandomPosition(gameAreaWidth, gameAreaHeight, base_scaling * scale, base_scaling * scale);
  wallace.style.left = `${wallacePosition.x}px`;
  wallace.style.top = `${wallacePosition.y}px`;

  wallace.addEventListener('click', () => {
    alert('You found Wallace!');
    clearInterval(timerInterval);
    currentLevel++;
    nextLevel(backgroundImages, peopleImages, playerName);
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
  timerInterval = setInterval(() => {
    elapsedTime += 0.1;
    progressBar.style.width = `${(elapsedTime / timeLimit) * 100}%`;
    if (elapsedTime >= timeLimit) {
      clearInterval(timerInterval);
      alert('Time\'s up! You lost.');
      resetGame(playerName);
    }
  }, 100);
}

function resetGame(playerName) {
  document.getElementById('game-area').style.display = 'none';
  document.querySelector('.container').style.display = 'block';
  document.getElementById('start-button').disabled = false;
  currentLevel = 1;
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
