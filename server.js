const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the "images" folder
app.use('/images', express.static(path.join(__dirname, 'images')));

// Middleware to parse JSON bodies
app.use(express.json());

// Load high scores from a file
const highScoresFile = path.join(__dirname, 'highscores.json');
function loadHighScores() {
  if (fs.existsSync(highScoresFile)) {
    const data = fs.readFileSync(highScoresFile, 'utf8');
    return JSON.parse(data);
  }
  return [];
}

// Save high scores to a file
function saveHighScores(highScores) {
  fs.writeFileSync(highScoresFile, JSON.stringify(highScores, null, 2), 'utf8');
}

// Route to get high scores
app.get('/highscores', (req, res) => {
  const highScores = loadHighScores();
  res.json(highScores);
});

// Route to save a new high score
app.post('/highscores', (req, res) => {
  const newScore = req.body;
  const highScores = loadHighScores();
  highScores.push(newScore);
  highScores.sort((a, b) => a.time - b.time); // Sort scores by time
  saveHighScores(highScores);
  res.status(201).json({ message: 'High score saved!' });
});

// Route to get background images
app.get('/images/backgrounds', (req, res) => {
  const backgroundsDir = path.join(__dirname, 'images', 'backgrounds');
  fs.readdir(backgroundsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read backgrounds directory' });
    }
    res.json(files);
  });
});

// Route to get people images
app.get('/images/people', (req, res) => {
  const peopleDir = path.join(__dirname, 'images', 'people');
  fs.readdir(peopleDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read people directory' });
    }
    res.json(files);
  });
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
