import React, { useState, useEffect } from "react";
import "./App.css";

function App() {

  const ALPHABET = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "Ł",
    "M", "N","O","P", "R", "S", "T", "U", "W"
  ];

  const [showMainMenu, setShowMainMenu] = useState(true);
  const [showRoundsMenu, setShowRoundsMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [rounds, setRounds] = useState("");
  const [currentRound, setCurrentRound] = useState("");
  const [usedLetters, setUsedLetters] = useState([]);
  const [currentLetter, setCurrentLetter] = useState("");
  const [gameHistory, setGameHistory] = useState([]);

const categoryLabels = {
  panstwo: "Państwo",
  miasto: "Miasto",
  imie: "Imię",
  zwierze: "Zwierzę",
  rzecz: "Rzecz",
  zbiornik: "Zbiornik wodny",
  roslina: "Roślina"
};


  const [words, setWords] = useState({
    panstwo: "",
    miasto: "",
    imie: "",
    zwierze: "",
    rzecz: "",
    zbiornik: "",
    roslina: "",
  });

  const [locked, setLocked] = useState(false);

  const [allScores, setAllScores] = useState([]);



  useEffect(() => {
    const savedState = localStorage.getItem("panstwaMiastaGameState");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);

        setShowMainMenu(parsed.showMainMenu ?? true);
        setShowRoundsMenu(parsed.showRoundsMenu ?? false);
        setShowHistory(parsed.showHistory ?? false);
        setRounds(parsed.rounds ?? 0);
        setCurrentRound(parsed.currentRound ?? 0);
        setUsedLetters(parsed.usedLetters ?? []);
        setCurrentLetter(parsed.currentLetter ?? "");
        setWords(parsed.words ?? {
          panstwo: "",
          miasto: "",
          imie: "",
          zwierze: "",
          rzecz: "",
          zbiornik: "",
          roslina: "",
        });
        setLocked(parsed.locked ?? false);
        setAllScores(parsed.allScores ?? []);
        setGameHistory(parsed.gameHistory ?? []);
      } catch (error) {
        console.warn("Błąd przy wczytywaniu stanu z localStorage:", error);
      }
    }
  }, []);


  useEffect(() => {
    const stateToSave = {
      showMainMenu,
      showRoundsMenu,
      showHistory,
      rounds,
      currentRound,
      usedLetters,
      currentLetter,
      words,
      locked,
      allScores,
      gameHistory,
    };
    localStorage.setItem("panstwaMiastaGameState", JSON.stringify(stateToSave));
  }, [
    showMainMenu,
    showRoundsMenu,
    showHistory,
    rounds,
    currentRound,
    usedLetters,
    currentLetter,
    words,
    locked,
    allScores,
    gameHistory,
  ]);


  const startNewGame = () => {
    setShowMainMenu(false);
    setShowRoundsMenu(true);
  };

  const handleRoundsChange = (e) => {
    setRounds(e.target.value);
  };

  const startRounds = () => {
    const numberOfRounds = parseInt(rounds, 10);
    if (numberOfRounds > 0) {
      setShowRoundsMenu(false);
      setCurrentRound(1);
      setUsedLetters([]);
      setAllScores([]);
      setGameHistory([]);
      resetInputsAndLock();
    }
  };

  const drawLetter = () => {
    const randomIndex = Math.floor(Math.random() * ALPHABET.length);
    const letter = ALPHABET[randomIndex];
    setCurrentLetter(letter);

    setUsedLetters((prev) => [...prev, letter]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (!locked) {
      setWords((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };


  const lockWords = () => {
    setLocked(true);
  };


  const handleCheckboxChange = (e, category, val) => {
    setAllScores((prevScores) => {
      const newScores = [...prevScores];
      if (!newScores[currentRound - 1]) {
        newScores[currentRound - 1] = {};
      }

      if (e.target.checked) {
        newScores[currentRound - 1][category] = val;
      } else {

        newScores[currentRound - 1][category] = 0;
      }
      return newScores;
    });
  };

  const isCheckboxChecked = (category, val) => {
    if (!allScores[currentRound - 1]) return false;
    return allScores[currentRound - 1][category] === val;
  };

  const saveRoundToHistory = () => {
    setGameHistory(prevHistory => {
      const newHistory = [...prevHistory];
      newHistory[currentRound - 1] = {
        round: currentRound,
        letter: currentLetter,
        words: {...words},
        scores: allScores[currentRound - 1] || {}
      };
      return newHistory;
    });
  };

  const nextRound = () => {
    saveRoundToHistory();
    
    if (currentRound === parseInt(rounds, 10)) {
      setCurrentRound(0);
      return;
    }
    setCurrentRound((prev) => prev + 1);
    resetInputsAndLock();
  };

  const resetInputsAndLock = () => {
    setCurrentLetter("");
    setWords({
      panstwo: "",
      miasto: "",
      imie: "",
      zwierze: "",
      rzecz: "",
      zbiornik: "",
      roslina: "",
    });
    setLocked(false);
  };

  const getFinalScore = () => {
    let sum = 0;
    allScores.forEach((roundObj) => {
      if (roundObj) {
        Object.values(roundObj).forEach((val) => {
          sum += val;
        });
      }
    });
    return sum;
  };

  const showGameHistory = () => {
    setShowHistory(true);
  };

  const hideGameHistory = () => {
    setShowHistory(false);
  };

  const endGame = () => {
    localStorage.removeItem("panstwaMiastaGameState");

    setShowMainMenu(true);
    setShowRoundsMenu(false);
    setShowHistory(false);
    setRounds(0);
    setCurrentRound(0);
    setUsedLetters([]);
    setCurrentLetter("");
    setWords({
      panstwo: "",
      miasto: "",
      imie: "",
      zwierze: "",
      rzecz: "",
      zbiornik: "",
      roslina: "",
    });
    setLocked(false);
    setAllScores([]);
    setGameHistory([]);
  };


  const restartGame = () => {
    localStorage.removeItem("panstwaMiastaGameState");

    setShowRoundsMenu(true);
    setShowHistory(false);
    setRounds(0);
    setCurrentRound(0);
    setUsedLetters([]);
    setCurrentLetter("");
    setWords({
      panstwo: "",
      miasto: "",
      imie: "",
      zwierze: "",
      rzecz: "",
      zbiornik: "",
      roslina: "",
    });
    setLocked(false);
    setAllScores([]);
    setGameHistory([]);
  };


  if (showMainMenu) {
    return (
      <div className="main">
        
        <a className="text"><p>Witaj!</p> <p>w grze Państwa Miasta</p></a>
        <button className="nowa" onClick={startNewGame}>Nowa Gra</button>
      </div>
    );
  }


  if (showRoundsMenu) {
    return (
      <div className="rounds">
        <h2>Podaj liczbę rund</h2>
        <input className="liczbarund"
          type="number"
          min="1"
          value={rounds}
          onChange={handleRoundsChange}
          placeholder="Podaj liczbę rund"
        />
        <button onClick={startRounds}>Rozpocznij Grę</button>
      </div>
    );
  }

  if (currentRound > 0 && currentRound <= rounds) {
    return (
      <div className="game">
        <h2>Runda {currentRound} z {rounds}</h2>

        {!locked && (
          <>
            <button className="losuj" onClick={drawLetter}>
              Losuj Literę
            </button>
            {currentLetter && <h3>Wylosowana litera: {currentLetter}</h3>}
          </>
        )}


        {!locked && (
          <div className="inputs">
            <label>
              <input className="wartosc" placeholder="Państwo"
                name="panstwo"
                value={words.panstwo}
                onChange={handleInputChange}
              />
            </label>

            <label>
              <input className="wartosc" placeholder="Miasto"
                name="miasto"
                value={words.miasto}
                onChange={handleInputChange}
              />
            </label>

            <label>
              <input className="wartosc" placeholder="Imię"
                name="imie"
                value={words.imie}
                onChange={handleInputChange}
              />
            </label>

            <label>
              <input className="wartosc" placeholder="Zwierzę"
                name="zwierze"
                value={words.zwierze}
                onChange={handleInputChange}
              />
            </label>

            <label>
              <input className="wartosc" placeholder="Rzecz"
                name="rzecz"
                value={words.rzecz}
                onChange={handleInputChange}
              />
            </label>

            <label>
              <input className="wartosc" placeholder="Zbiornik wodny"
                name="zbiornik"
                value={words.zbiornik}
                onChange={handleInputChange}
              />
            </label>

            <label>
              <input className="wartosc" placeholder="Roślina"
                name="roslina"
                value={words.roslina}
                onChange={handleInputChange}
              />
            </label>
          </div>
        )}

        {!locked && (
          <button className="zatwierdz" onClick={lockWords}>Zatwierdź słowa</button>
        )}

        {locked && (
          <div className="scores">
          {currentLetter && <h3>Wylosowana litera: {currentLetter}</h3>}
          {Object.keys(words).map((category) => (
            <div key={category} className="score-row">

              <span className="score-label">
                {categoryLabels[category]}: {words[category]}
              </span>
        
              <div className="checkbox-group">
                {[0, 5, 10, 15].map((val) => (
                  <label key={val} className="checkbox-label">
                    <input
                      type="checkbox"
                      value={val} 
                      checked={isCheckboxChecked(category, val)}
                      onChange={(e) => handleCheckboxChange(e, category, val)}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button className="nastepna" onClick={nextRound}>Następna runda</button>
        </div>
        
        )}
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
                    <span className="history-score">
                      {roundData.scores[category] ? `(${roundData.scores[category]} pkt)` : '(0 pkt)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={hideGameHistory}>Powrót</button>
      </div>
    );
  }

  if (currentRound === 0 && !showMainMenu && !showRoundsMenu && !showHistory) {
    const finalScore = getFinalScore();

    return (
      <div className="summary">
        <h2>Koniec gry!</h2>
        <h3>Wynik: {finalScore} punktów</h3>
        <button onClick={endGame}>Zakończ grę</button>
        <button onClick={restartGame}>Nowa Gra</button>
        <button onClick={showGameHistory}>Historia gry</button>
      </div>
    );
  }

  return null;
}

export default App;
