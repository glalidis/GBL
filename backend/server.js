const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const DATA_FILE = 'data.json';

// Load full data: teams array and matches array
function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE));
  }
  return { teams: [], matches: [] };
}

// Save full data back to file
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Compute the league table including teams with no matches
function computeTable(data) {
  const { teams: teamList, matches } = data;
  const teams = {};

  // Initialize all teams with zero stats
  teamList.forEach(t => {
    teams[t] = { name: t, P: 0, W: 0, L: 0, PS: 0, PC: 0, DIFF: 0, Str: 0, PTS: 0 };
  });

  // Process each match to update team stats
  for (const [t1, t2, s1, s2] of matches) {
    const a = teams[t1], b = teams[t2];
    if (!a || !b) continue; // skip if team missing

    a.P++; b.P++;
    a.PS += s1; a.PC += s2;
    b.PS += s2; b.PC += s1;
    a.DIFF = a.PS - a.PC;
    b.DIFF = b.PS - b.PC;

    if (s1 > s2) {
      a.W++; b.L++;
      a.Str = a.Str >= 0 ? a.Str + 1 : 1;
      b.Str = b.Str <= 0 ? b.Str - 1 : -1;
      a.PTS += 2;
      b.PTS += 1;
    } else {
      b.W++; a.L++;
      b.Str = b.Str >= 0 ? b.Str + 1 : 1;
      a.Str = a.Str <= 0 ? a.Str - 1 : -1;
      b.PTS += 2;
      a.PTS += 1;
    }
  }

  // Sort table by points, then diff, then points scored
  return Object.values(teams).sort((a, b) =>
    b.PTS !== a.PTS ? b.PTS - a.PTS :
    b.DIFF !== a.DIFF ? b.DIFF - a.DIFF :
    b.PS - a.PS
  );
}

// Get the league table
app.get('/api/table', (req, res) => {
  const data = loadData();
  const table = computeTable(data);
  res.json(table);
});

// Get all teams
app.get('/api/teams', (req, res) => {
  const data = loadData();
  res.json(data.teams);
});

// Add a new team
app.post('/api/team', (req, res) => {
  const { team } = req.body;
  if (!team || typeof team !== 'string') {
    return res.status(400).json({ error: 'Invalid team name' });
  }

  const data = loadData();

  if (data.teams.includes(team)) {
    return res.status(400).json({ error: 'Team already exists' });
  }

  data.teams.push(team);
  saveData(data);

  res.json({ success: true, teams: data.teams });
});

// Add a new match result
app.post('/api/match', (req, res) => {
  const { team1, team2, score1, score2 } = req.body;
  if (
    !team1 || !team2 ||
    typeof score1 !== 'number' || typeof score2 !== 'number' ||
    team1 === team2
  ) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const data = loadData();

  // Make sure both teams exist before adding match
  if (!data.teams.includes(team1) || !data.teams.includes(team2)) {
    return res.status(400).json({ error: 'One or both teams do not exist' });
  }

  data.matches.push([team1, team2, score1, score2]);
  saveData(data);

  res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
