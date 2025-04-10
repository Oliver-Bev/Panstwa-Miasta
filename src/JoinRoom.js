// JoinRoom.js
import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const JoinRoom = ({ onJoinSuccess }) => {
  const [roomCode, setRoomCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState(null);

  const joinRoom = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', roomCode)
      .single();

    if (error || !data) {
      setError('Nie znaleziono pokoju.');
      return;
    }

    const gameState = data.game_state ? JSON.parse(data.game_state) : {};
    if (!gameState.players) gameState.players = [];

    if (gameState.players.find((p) => p.name === nickname)) {
      setError('Gracz o tym nicku już istnieje.');
      return;
    }

    gameState.players.push({ name: nickname });

    await supabase
      .from('rooms')
      .update({ game_state: JSON.stringify(gameState) })
      .eq('room_code', roomCode);

    onJoinSuccess(roomCode, nickname);
  };

  return (
    <div className="join-room">
      <h2>Dołącz do pokoju</h2>
      <input
        type="text"
        placeholder="Kod pokoju"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
      />
      <input
        type="text"
        placeholder="Twój nick"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      <button onClick={joinRoom}>Dołącz</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default JoinRoom;