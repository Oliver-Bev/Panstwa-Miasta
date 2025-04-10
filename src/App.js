// App.js z multiplayer + widoczność graczy w pokoju
import React, { useState, useEffect } from 'react';
import GameSetup from './GameSetup';
import JoinRoom from './JoinRoom';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  const ALPHABET = ['A','B','C','D','E','F','G','H','I','J','K','L','Ł','M','N','O','P','R','S','T','U','W'];

  const [view, setView] = useState('menu');
  const [roomCode, setRoomCode] = useState(null);
  const [nickname, setNickname] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [words, setWords] = useState({ panstwo: '', miasto: '', imie: '', zwierze: '', rzecz: '', zbiornik: '', roslina: '' });
  const [locked, setLocked] = useState(false);
  const [allScores, setAllScores] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const categoryLabels = {
    panstwo: 'Państwo', miasto: 'Miasto', imie: 'Imię', zwierze: 'Zwierzę', rzecz: 'Rzecz', zbiornik: 'Zbiornik wodny', roslina: 'Roślina'
  };

  useEffect(() => {
    if (!roomCode) return;

    const channel = supabase
      .channel(`room-${roomCode}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `room_code=eq.${roomCode}` }, (payload) => {
        const newState = JSON.parse(payload.new.game_state);
        setGameState(newState);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode]);

  useEffect(() => {
    if (!gameState) return;
    if (gameState.currentRound > 0 && view !== 'game' && view !== 'summary') setView('game');
    if (gameState.currentRound === 0 && view === 'game') setView('summary');
  }, [gameState]);

  const updateGameState = async (newState) => {
    setGameState(newState);
    await supabase.from('rooms').update({ game_state: JSON.stringify(newState) }).eq('room_code', roomCode);
  };


  useEffect(() => {
    if (!nickname || !gameState || isHost) return;
  
    console.log('Gracz', nickname, 'próbuje się dodać...');
  
    if (!gameState.players.find(p => p.name === nickname)) {
      const updated = {
        ...gameState,
        players: [...(gameState.players || []), { name: nickname }]
      };
      console.log('Dodajemy gracza:', nickname);
      updateGameState(updated);
    }
  }, [nickname, gameState]);
  
  const handleRoomCreated = (code) => {
    const initialState = {
      players: [{ name: 'Host' }],
      currentRound: 0,
      currentLetter: '',
      roundStarted: false
    };
    updateGameState(initialState);
    setRoomCode(code);
    setNickname('Host');
    setIsHost(true);
    setView('waiting');
  };

  const handleJoinSuccess = (code, name) => {
    setRoomCode(code);
    setNickname(name);
    setIsHost(false);
    setView('waiting');
  };

  useEffect(() => {
    if (!nickname || !gameState || isHost) return;
    if (!gameState.players.find(p => p.name === nickname)) {
      const updated = { ...gameState, players: [...(gameState.players || []), { name: nickname }] };
      updateGameState(updated);
    }
  }, [nickname, gameState]);

  const drawLetter = () => {
    const letter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    updateGameState({ ...gameState, currentLetter: letter, roundStarted: true });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (!locked) setWords((prev) => ({ ...prev, [name]: value }));
  };

  const lockWords = () => setLocked(true);

  const handleCheckboxChange = (e, category, val) => {
    setAllScores((prev) => {
      const copy = [...prev];
      const roundIndex = (gameState?.currentRound ?? 1) - 1;
      if (!copy[roundIndex]) copy[roundIndex] = {};
      copy[roundIndex][category] = e.target.checked ? val : 0;
      return copy;
    });
  };

  const isCheckboxChecked = (category, val) => {
    const roundIndex = (gameState?.currentRound ?? 1) - 1;
    return allScores[roundIndex]?.[category] === val;
  };

  const saveRoundToHistory = () => {
    const roundIndex = (gameState?.currentRound ?? 1) - 1;
    setGameHistory((prev) => {
      const copy = [...prev];
      copy[roundIndex] = { round: gameState.currentRound, letter: gameState.currentLetter, words: { ...words }, scores: allScores[roundIndex] || {} };
      return copy;
    });
  };

  const nextRound = () => {
    saveRoundToHistory();
    updateGameState({ ...gameState, currentRound: gameState.currentRound + 1, currentLetter: '', roundStarted: false });
    setWords({ panstwo: '', miasto: '', imie: '', zwierze: '', rzecz: '', zbiornik: '', roslina: '' });
    setLocked(false);
  };

  const getFinalScore = () => allScores.reduce((sum, r) => sum + (r ? Object.values(r).reduce((s, v) => s + v, 0) : 0), 0);

  if (view === 'menu') return (
    <div className="main">
      <a className="text"><p>Witaj!</p> <p>w grze Państwa Miasta</p></a>
      <button onClick={() => setView('create')}>Stwórz Pokój</button>
      <button onClick={() => setView('join')}>Dołącz do Pokoju</button>
    </div>
  );

  if (view === 'create') return <GameSetup onRoomCreated={handleRoomCreated} />;
  if (view === 'join') return <JoinRoom onJoinSuccess={handleJoinSuccess} />;

  if (view === 'waiting') {
    const players = gameState?.players || [];
    return (
      <div className="waiting">
        <h2>Pokój: {roomCode}</h2>
        <p>{nickname ? `Cześć, ${nickname}!` : ''}</p>
        <p>Gracze ({players.length}/5):</p>
        <ul>
          {players.map((p, i) => (
            <li key={i}>{p.name}</li>
          ))}
        </ul>
        {isHost && (
          <button onClick={() => updateGameState({ ...gameState, currentRound: 1, currentLetter: '', roundStarted: false })}>
            Rozpocznij Grę
          </button>
        )}
      </div>
    );
  }

  if (view === 'game' && gameState?.currentRound > 0) {
    return (
      <div className="game">
        <h2>Runda {gameState.currentRound}</h2>
        {!gameState.roundStarted && isHost && <button className="losuj" onClick={drawLetter}>Losuj Literę</button>}
        {gameState.roundStarted && (
          <>
            <h3>Wylosowana litera: {gameState.currentLetter}</h3>
            {!locked && (
              <div className="inputs">
                {Object.keys(words).map((key) => (
                  <label key={key}>
                    <input className="wartosc" placeholder={categoryLabels[key]} name={key} value={words[key]} onChange={handleInputChange} />
                  </label>
                ))}
              </div>
            )}
            {!locked && <button onClick={lockWords}>Zatwierdź słowa</button>}
            {locked && (
              <div className="scores">
                {Object.keys(words).map((category) => (
                  <div key={category} className="score-row">
                    <span className="score-label">{categoryLabels[category]}: {words[category]}</span>
                    <div className="checkbox-group">
                      {[0, 5, 10, 15].map((val) => (
                        <label key={val} className="checkbox-label">
                          <input type="checkbox" value={val} checked={isCheckboxChecked(category, val)} onChange={(e) => handleCheckboxChange(e, category, val)} />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                {isHost && <button className="nastepna" onClick={nextRound}>Następna runda</button>}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  if (view === 'summary') {
    const finalScore = getFinalScore();
    return (
      <div className="summary">
        <h2>Koniec gry!</h2>
        <h3>Wynik: {finalScore} punktów</h3>
        <button onClick={() => setView('menu')}>Powrót do menu</button>
        <button onClick={() => setShowHistory(true)}>Historia gry</button>
      </div>
    );
  }

  if (showHistory) {
    return (
      <div className="history">
        <h2>Historia Gry</h2>
        <div className="history-container">
          {gameHistory.map((roundData, index) => (
            <div key={index} className="history-round">
              <h3>Runda {roundData.round} - Litera: {roundData.letter}</h3>
              <div className="history-words">
                {Object.entries(roundData.words).map(([category, word]) => (
                  <div key={category} className="history-word">
                    <span className="history-category">{categoryLabels[category]}:</span>
                    <span className="history-value">{word}</span>
                    <span className="history-score">{roundData.scores[category] ? `(${roundData.scores[category]} pkt)` : '(0 pkt)'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setShowHistory(false)}>Powrót</button>
      </div>
    );
  }

  return null;
}

export default App;