import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [teams, setTeams] = useState([]);

  // Replace this with your actual backend URL
  const BACKEND_URL = 'https://gbl-ruy1.onrender.com';

  const fetchTable = () => {
    fetch(`${BACKEND_URL}/api/table`)
      .then(res => res.json())
      .then(data => setTeams(data))
      .catch(err => console.error("Failed to fetch table:", err));
  };

  useEffect(() => {
    fetchTable();
  }, []);

  return (
    <div className="App">
      <h1>Basketball League Table</h1>

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
