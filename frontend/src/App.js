const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const DATA_FILE = 'data.json';

// Load matches from file
function loadMatches() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE));
  }
  return [];
}

// Save matches to file
function saveMatches(matches) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(matches, null, 2));
}

// Compute table stats from matches
function computeTable(matches) {
  const teams = {};
  for (const [t1, t2, s1, s2] of matches) {
    if (!teams[t1]) teams[t1] = { name: t1, P: 0, W: 0, L: 0, PS: 0, PC: 0, DIFF: 0, Str: 0, PTS: 0 };
    if (!teams[t2]) teams[t2] = { name: t2, P: 0, W: 0, L: 0, PS: 0, PC: 0, DIFF: 0, Str: 0, PTS: 0 };

    const a = teams[t1], b = teams[t2];
    a.P++; b.P++;
    a.PS += s1; a.PC += s2;
    b.PS += s2; b.PC += s1;
    a.DIFF = a.PS - a.PC;
    b.DIFF = b.PS - b.PC;

    if (s1 > s2) {
      a.W++; b.L++; a.Str = a.Str >= 0 ? a.Str + 1 : 1;
      b.Str = b.Str <= 0 ? b.Str - 1 : -1; a.PTS += 2; b.PTS += 1;
    } else {
      b.W++; a.L++; b.Str = b.Str >= 0 ? b.Str + 1 : 1;
      a.Str = a.Str <= 0 ? a.Str - 1 : -1; b.PTS += 2; a.PTS += 1;
    }
  }
  return Object.values(teams).sort((a, b) =>
    b.PTS !== a.PTS ? b.PTS - a.PTS :
    b.DIFF !== a.DIFF ? b.DIFF - a.DIFF : b.PS - a.PS
  );
}

// GET league table
app.get('/api/table', (req, res) => {
  const matches = loadMatches();
  const table = computeTable(matches);
  res.json(table);
});

// POST add match result
app.post('/api/match', (req, res) => {
  const { team1, team2, score1, score2 } = req.body;
  if (!team1 || !team2 || typeof score1 !== 'number' || typeof score2 !== 'number' || team1 === team2) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  const matches = loadMatches();
  matches.push([team1, team2, score1, score2]);
  saveMatches(matches);
  res.json({ success: true });
});

// DELETE reset table (clear all matches)
app.delete('/api/reset', (req, res) => {
  saveMatches([]); // save empty array, clears all matches
  res.json({ success: true, message: 'Table reset successfully.' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
