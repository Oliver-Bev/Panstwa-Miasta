import React, { useState } from "react";
import "./App.css";

function App() {
  // Alfabet z pominięciem liter: Ą, Ć, Ę, Q, X, Y, Z
  const ALPHABET = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "Ł",
    "M", "N", "Ń", "O", "Ó", "P", "R", "S", "Ś", "T", "U", "W", "Ź", "Ż"
  ];

  const [showMainMenu, setShowMainMenu] = useState(true); // Ekran główny (przycisk "Nowa Gra")
  const [showRoundsMenu, setShowRoundsMenu] = useState(false); // Menu z wyborem liczby rund
  const [rounds, setRounds] = useState(0); // Ilość rund
  const [currentRound, setCurrentRound] = useState(0); // Aktualnie rozgrywana runda
  const [usedLetters, setUsedLetters] = useState([]); // Już wylosowane litery w danej grze
  const [currentLetter, setCurrentLetter] = useState(""); // Wylosowana litera na daną rundę

  // Słowa wpisywane przez gracza
  const [words, setWords] = useState({
    panstwo: "",
    miasto: "",
    imie: "",
    zwierze: "",
    rzecz: "",
    zbiornik: "",
    roslina: "",
  });

  // Czy inputy zostały zablokowane ("Zatwierdź słowa")
  const [locked, setLocked] = useState(false);

  // Przechowuje punkty z każdej rundy i kategorii
  // Struktura: [ { panstwo: X, miasto: Y, ... }, { ... }, ... ]
  const [allScores, setAllScores] = useState([]);

  // ------ Obsługa ekranu głównego ------
  const startNewGame = () => {
    setShowMainMenu(false);
    setShowRoundsMenu(true);
  };

  // ------ Obsługa wyboru liczby rund ------
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
      resetInputsAndLock();
    }
  };

  // ------ Losowanie litery ------
  const drawLetter = () => {
    const availableLetters = ALPHABET.filter((letter) => !usedLetters.includes(letter));
    if (availableLetters.length === 0) {
      alert("Wykorzystano już wszystkie dostępne litery!");
      return;
    }
    const randomIndex = Math.floor(Math.random() * availableLetters.length);
    const letter = availableLetters[randomIndex];
    setCurrentLetter(letter);
    setUsedLetters((prev) => [...prev, letter]);
  };

  // ------ Obsługa inputów ------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (!locked) {
      setWords((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // ------ Zatwierdzanie słów (blokada inputów) ------
  const lockWords = () => {
    setLocked(true);
  };

  // ------ Zmiana wartości punktów (checkboxy) ------
  // Tylko jeden checkbox może być zaznaczony w danej kategorii, więc jeśli
  // ktoś kliknie w nowy checkbox, ustawiamy tę wartość, a jeśli odznaczy – ustawiamy 0
  const handleCheckboxChange = (e, category, val) => {
    setAllScores((prevScores) => {
      const newScores = [...prevScores];
      if (!newScores[currentRound - 1]) {
        newScores[currentRound - 1] = {};
      }
      // Jeśli właśnie "zaznaczyliśmy" checkbox:
      if (e.target.checked) {
        newScores[currentRound - 1][category] = val;
      } else {
        // Odznaczenie tego samego checkboxa – ustawia wartość punktów na 0
        newScores[currentRound - 1][category] = 0;
      }
      return newScores;
    });
  };

  // Pomocnicza funkcja do sprawdzania, czy w danej kategorii
  // w aktualnej rundzie jest wybrana wartość `val`
  const isCheckboxChecked = (category, val) => {
    // Jeśli nie ma w ogóle wpisu dla tej rundy, zwracamy false
    if (!allScores[currentRound - 1]) return false;
    return allScores[currentRound - 1][category] === val;
  };

  // ------ Przechodzenie do następnej rundy ------
  const nextRound = () => {
    // Jeśli aktualna runda to ostatnia, pokażemy wynik końcowy
    if (currentRound === parseInt(rounds, 10)) {
      setCurrentRound(0);
      return;
    }
    // Inaczej przechodzimy do kolejnej
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

  // ------ Obliczanie wyniku końcowego ------
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

  // ------ Zakończ grę i reset do ekranu głównego ------
  const endGame = () => {
    setShowMainMenu(true);
    setShowRoundsMenu(false);
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
  };

  // ------ Restart gry (nowa gra) ------
  const restartGame = () => {
    setShowRoundsMenu(true);
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
  };

  // Ekran główny
  if (showMainMenu) {
    return (
      <div className="main">
        <button onClick={startNewGame}>Nowa Gra</button>
      </div>
    );
  }

  // Menu z wyborem liczby rund
  if (showRoundsMenu) {
    return (
      <div className="rounds">
        <h2>Podaj liczbę rund</h2>
        <input
          type="number"
          min="1"
          value={rounds}
          onChange={handleRoundsChange}
          placeholder="np. 5"
        />
        <button onClick={startRounds}>Rozpocznij Grę</button>
      </div>
    );
  }

  // Jeśli rozgrywka trwa i currentRound <= rounds
  if (currentRound > 0 && currentRound <= rounds) {
    return (
      <div className="game">
        <h2>Runda {currentRound} z {rounds}</h2>
        
        {/* Pokazuj przycisk „Losuj literę” tylko, gdy nie zatwierdziliśmy jeszcze słów */}
        {!locked && (
          <>
            <button onClick={drawLetter} disabled={!!currentLetter}>
              Losuj Literę
            </button>
            {currentLetter && <h3>Wylosowana litera: {currentLetter}</h3>}
          </>
        )}

        {/* Inputy pojawiają się tylko, gdy nie są zablokowane */}
        {!locked && (
          <div className="inputs">
            <label>
              Państwo:
              <input
                name="panstwo"
                value={words.panstwo}
                onChange={handleInputChange}
                disabled={locked}
              />
            </label>

            <label>
              Miasto:
              <input
                name="miasto"
                value={words.miasto}
                onChange={handleInputChange}
                disabled={locked}
              />
            </label>

            <label>
              Imię:
              <input
                name="imie"
                value={words.imie}
                onChange={handleInputChange}
                disabled={locked}
              />
            </label>

            <label>
              Zwierzę:
              <input
                name="zwierze"
                value={words.zwierze}
                onChange={handleInputChange}
                disabled={locked}
              />
            </label>

            <label>
              Rzecz:
              <input
                name="rzecz"
                value={words.rzecz}
                onChange={handleInputChange}
                disabled={locked}
              />
            </label>

            <label>
              Zbiornik wodny:
              <input
                name="zbiornik"
                value={words.zbiornik}
                onChange={handleInputChange}
                disabled={locked}
              />
            </label>

            <label>
              Roślina:
              <input
                name="roslina"
                value={words.roslina}
                onChange={handleInputChange}
                disabled={locked}
              />
            </label>
          </div>
        )}

        {/* Przycisk „Zatwierdź słowa” też tylko gdy nie zablokowane */}
        {!locked && (
          <button onClick={lockWords}>Zatwierdź słowa</button>
        )}

        {/* Sekcja wyboru punktów (checkboxy) – widoczna dopiero PO zatwierdzeniu słów */}
        {locked && (
          <div className="scores">
            {currentLetter && <h3>Wylosowana litera: {currentLetter}</h3>}
            {Object.keys(words).map((category) => (
              <div key={category} className="score-row">
                <span className="score-label">{words[category]}:</span>
                <div className="checkbox-group">
                  {[0, 5, 10, 15].map((val) => (
                    <label key={val} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={isCheckboxChecked(category, val)}
                        onChange={(e) => handleCheckboxChange(e, category, val)}
                      />
                      {val}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={nextRound}>Następna runda</button>
          </div>
        )}
      </div>
    );
  }

  // Po ukończeniu wszystkich rund - wynik końcowy
  if (currentRound === 0 && !showMainMenu && !showRoundsMenu) {
    const finalScore = getFinalScore();

    return (
      <div className="summary">
        <h2>Koniec gry!</h2>
        <h3>Twój łączny wynik: {finalScore} punktów</h3>
        <button onClick={endGame}>Zakończ grę</button>
        <button onClick={restartGame}>Nowa Gra</button>
      </div>
    );
  }

  // W razie czego zwracamy null (nie powinno wystąpić)
  return null;
}

export default App;
