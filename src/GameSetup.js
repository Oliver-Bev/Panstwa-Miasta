// Nowy plik, np. GameSetup.js
import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const GameSetup = ({ onRoomCreated }) => {
  const [players, setPlayers] = useState(2);
  const [rounds, setRounds] = useState(3);
  const [creating, setCreating] = useState(false);
  const [roomCode, setRoomCode] = useState(null);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
  };

  const createRoom = async () => {
    setCreating(true);
    const code = generateRoomCode();
    const { data, error } = await supabase.from('rooms').insert([
      {
        room_code: code,
        game_state: JSON.stringify({
          started: false,
          playersExpected: players,
          rounds: rounds,
          currentRound: 0,
          history: [],
          scores: {},
        })
      }
    ]);

    if (error) {
        alert('Błąd przy tworzeniu pokoju: ' + error.message);
        console.error('Supabase error:', error);
      }

    setRoomCode(code);
    onRoomCreated(code);
  };

  return (
    <div className="game-setup">
      <h2>Stwórz pokój gry</h2>
      <label>Liczba graczy:
        <input
          type="number"
          min="2"
          value={players}
          onChange={(e) => setPlayers(parseInt(e.target.value))}
        />
      </label>

      <label>Liczba rund:
        <input
          type="number"
          min="1"
          value={rounds}
          onChange={(e) => setRounds(parseInt(e.target.value))}
        />
      </label>

      <button onClick={createRoom} disabled={creating}>Stwórz pokój</button>

      {roomCode && (
        <div>
          <p>Pokój stworzony! Kod pokoju: <strong>{roomCode}</strong></p>
          <p>Podziel się tym kodem ze znajomymi.</p>
        </div>
      )}
    </div>
  );
};

export default GameSetup;
