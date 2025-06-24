import React, { useEffect, useState } from 'react';
import './App.css';

const BACKEND_URL = 'https://your-backend-url.onrender.com'; // <-- change to your actual backend URL

function App() {
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({ team1: '', team2: '', score1: '', score2: '' });

  const fetchTable = () => {
    fetch(`${BACKEND_URL}/api/table`)
      .then(res => res.json())
      .then(data => setTeams(data))
      .catch(err => console.error("Failed to fetch table:", err));
  };

  useEffect(() => {
    fetchTable();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submitMatch = async () => {
    const { team1, team2, score1, score2 } = form;

    if (!team1 || !team2 || !score1 || !score2 || team1 === team2) {
      alert("Please fill all fields correctly.");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team1,
          team2,
          score1: parseInt(score1),
          score2: parseInt(score2)
        })
      });

      if (!response.ok) throw new Error("Failed to submit match.");

      setForm({ team1: '', team2: '', score1: '', score2: '' });
      fetchTable(); // Refresh table
    } catch (err) {
      console.error(err);
      alert("Error submitting match");
    }
  };

  // New reset handler
  const resetTable = async () => {
    if (!window.confirm("Are you sure you want to reset the whole table?")) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/reset`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Failed to reset");

      alert("Table reset!");
      fetchTable(); // Refresh empty table
    } catch (err) {
      console.error(err);
      alert("Error resetting table");
    }
  };

  return (
    <div className="App">
      <h1>Basketball League Table</h1>

      <button onClick={resetTable} style={{ margin: '10px', backgroundColor: 'red', color: 'white' }}>
        Reset Table
      </button>

      <table>
        <thead>
          <tr>
            <th>Pos</th><th>Team</th><th>P</th><th>W</th><th>L</th>
            <th>PS</th><th>PC</th><th>DIFF</th><th>Str</th><th>PTS</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, i) => (
            <tr key={team.name}>
              <td>{i < 8 ? '🔵' : '🔴'} {i + 1}</td>
              <td>{team.name}</td>
              <td>{team.P}</td>
              <td>{team.W}</td>
              <td>{team.L}</td>
              <td>{team.PS}</td>
              <td>{team.PC}</td>
              <td>{team.DIFF}</td>
              <td>{team.Str > 0 ? `↑ ${team.Str}` : team.Str < 0 ? `↓ ${-team.Str}` : '0'}</td>
              <td>{team.PTS}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
