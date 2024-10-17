import React, { useState, useEffect, createContext, useContext } from 'react'
import './App.css';
import './Button.css';
import { RxHamburgerMenu } from "react-icons/rx";
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function JoinGame() {
  const { setUsername } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const gameCode = event.target.elements.name.value;
    const response = await fetch(`/check_game_code?code=${gameCode}`);
    const isValidGameCode = await response.json();
    if (isValidGameCode) {
      navigate('/choosename');
    } else {
      alert('Invalid game code');
    }
  };

  return (
    <div className="formPage">
      <h1>Join Game!</h1>
      <form onSubmit={handleSubmit} className="formPage">
        <input
          className="custom-text-input"
          type="text"
          placeholder="Game Code"
          name="name"
          required
        />
        <button className="custom-button1" type="submit">Join</button>
      </form>
    </div>
  );
}

function ChooseName() {
  const navigate = useNavigate();
  const { setUsername } = useContext(UserContext);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Assuming you have the player's name stored in a state or can retrieve it from the form
    const playerName = event.target.elements.name.value;

    // Prepare the data to be sent in the request
    const playerData = {
      name: playerName,
    };

    try {
      // Send a POST request to the '/add_player' route
      const response = await fetch('/add_player', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playerData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle the response. For example, you can log the server's response message
      const result = await response.text();
      console.log(result);

      // Set the username in the UserContext
      setUsername(playerName);

      // Navigate to the game screen after adding the player
      navigate('/waitingroom');
    } catch (error) {
      console.error('Error adding player:', error);
    }
  };

  return (
    <div className="formPage">
      <h1>Choose Name</h1>
      <form onSubmit={handleSubmit} className="formPage">
        <input
          className="custom-text-input"
          type="text"
          placeholder="Name"
          name="name"
          required
        />
        <button className="custom-button1" type="submit">Submit</button>
      </form>
    </div>
  );
}

function GameScreen() {
  const navigate = useNavigate();
  const { username } = useContext(UserContext);
  const [result, setResult] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    // Extract artist and song title values from the form inputs
    const artist = event.target.elements.name[1].value;
    const songTitle = event.target.elements.name[0].value;

    // Prepare the data to be sent in the request
    const data = { artist: artist, song: songTitle, username: username };

    // Use fetch API to send a POST request to the server
    fetch('/check_guess', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => response.text())
      .then(result => {
        // Handle the server's response
        setResult(result);
        if (result === 'Correct guess!') {
          // window.location.reload();
        }
      })
      .catch(error => {
        // Handle any errors
        console.error('Error:', error);
      })
      .finally(() => {
        navigate('/waitingforallplayers');
      });
  };

  return (
    <div className="formPage">
      <h1>Welcome, {username}!</h1> {/* Display the player's username */}
      <form onSubmit={handleSubmit} className="formPage">
        <input
          className="custom-text-input"
          type="text"
          placeholder="Song Title"
          name="name"
          required
        />
        <input
          className="custom-text-input"
          type="text"
          placeholder="Artist"
          name="name"
          required
        />
        <button className="custom-button1" type="submit">Submit Answers</button>
      </form>
      {result && <p>{result}</p>}
    </div>
  );
}

function WaitingForAllPlayers() {
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();

  const fetchPlayers = () => {
    // Fetch the list of players connected to the game and their guesses
    fetch('/players')
      .then(response => response.json())
      .then(data => {
        const playersWithGuesses = data.players.filter(player => player.current_track_guess && player.current_artist_guess);
        setPlayers(playersWithGuesses);
      });
  };

useEffect(() => {
  const fetchData = () => {
    // Fetch players
    fetch('/players')
      .then(response => response.json())
      .then(data => {
        setPlayers(data.players);
      });

    // Check if a new song is playing
    fetch('/nextpage')
      .then(response => response.json())
      .then(data => {
        if (data.isPlaying) {
          navigate('/waitingfornextsong');
        }
      });
  };

  fetchData(); // Initial fetch

  const interval = setInterval(() => {
    fetchData(); // Re-fetch every 5 seconds
  }, 1000);

  return () => {
    clearInterval(interval);
  };
}, [navigate]);

  return (
    <div className="formPage">
      <h1>Waiting for all players to answer</h1>
      <h2>Guesses:</h2>
      <ul>
        {players.map(player => (
          <li key={player.id}>
            {`${player.name}: ${player.current_track_guess} by ${player.current_artist_guess}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

function HostGame() {
  const [gameCode, setGameCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [isGameStarted, setIsGameStarted] = useState(false); // Add state for game start
  const navigate = useNavigate();

  const generateGameCode = () => {
    // Generate a random game code on the server
    fetch('/generate_code')
      .then(response => response.text())
      .then(code => {
        setGameCode(code);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const fetchPlayers = () => {
    // Fetch the list of players connected to the game
    fetch('/players')
      .then(response => response.json())
      .then(data => {
        // Only update state if data is not empty
        if (data.players.length > 0) {
          setPlayers(data.players);
        } else {
          setPlayers([]); // Clear the players state if data is empty
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  useEffect(() => {
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 1000); // Check for new players every 5 seconds

    return () => {
      clearInterval(interval); // Clean up the interval when the component is unmounted
    };
  }, []);

  const startGame = () => {
    // Perform any necessary actions to start the game
    setIsGameStarted(true);
    fetch('/setnextpage');
    fetch('/play');
    navigate('/waitinghostscreen');
    // You can add additional logic here, such as sending a request to the server to start the game
  };

  return (
    <div className="formPage">
      <h1>Host Game</h1>
      <button className="custom-button1" onClick={generateGameCode}>New Game</button>
      {gameCode && <p>Game Code: {gameCode}</p>}
      <h2>Players:</h2>
      <ul>
        {players.map(player => (
          <li key={player.id}>{player.name}</li>
        ))}
      </ul>
      {!isGameStarted && <button className="custom-button1" onClick={startGame}>Start Game</button>} {/* Add start game button */}
    </div>
  );
}

function WaitingForNewSong() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/players');
      const data = await response.json();
      // Sort players based on score in descending order
      const sortedPlayers = data.players.sort((a, b) => b.score - a.score);
      setPlayers(sortedPlayers);
    } catch (error) {
      console.error(error);
    }
  };

  const checkNewSong = async () => {
    try {
      const response = await fetch('/nextpage');
      const data = await response.json();
      if (data.isPlaying) {
        setIsPlaying(true);
        navigate('/gamescreen');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 1000); // Check for updated scores every 5 seconds
    const songInterval = setInterval(checkNewSong, 1000); // Check for new song every 5 seconds
    return () => {
      clearInterval(interval); // Clean up the intervals when the component is unmounted
      clearInterval(songInterval);
    };
  }, []);

  return (
    <div className="formPage">
      <h1>Waiting for next song</h1>
      <h2>Leaderboard:</h2>
      <ul>
        {players.map(player => (
          <li key={player.id}>
            {player.name} - Score: {player.score}
          </li>
        ))}
      </ul>
    </div>
  );
}

function WaitingHostScreen() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);

  const handleNextSong = async () => {
    try {
      // Fetch the '/setnextpage' route to update the status on the server side
      await fetch('/setnextpage');
      navigate('/hostleaderboard'); // Navigate to the leaderboard page
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/players');
      const data = await response.json();
      setPlayers(data.players.filter(player => player.current_track_guess !== null)); // Only display players who have guessed
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 1000); // Check for updated scores every 5 seconds
    return () => {
      clearInterval(interval); // Clean up the interval when the component is unmounted
    };
  }, []);

  return (
    <div className="formPage">
      <h1>Waiting for Guesses!</h1>
      <ul>
        {players.map(player => (
          <li key={player.id}>
            {player.name}
          </li>
        ))}
      </ul>
      <button className="custom-button1" onClick={handleNextSong}>Next</button>
    </div>
  );
}

function HostLeaderboardScreen() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/players');
      const data = await response.json();
      // Assuming the response is an object with a 'players' array inside it
      setPlayers(data.players); // Adjust this line according to the actual structure
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  useEffect(() => {
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 5000); // Fetch players every 5 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleNextSong = () => {
    fetch('/reset_guesses');
    fetch('/setnextpage');
    fetch('/play');
    navigate('/waitinghostscreen');
  };

  return (
    <div className="formPage">
      <h1>Host Leaderboard Screen</h1>
      <button className="custom-button1" onClick={handleNextSong}>Next Song</button>
      <h2>Leaderboard:</h2>
      <ul>
        {players.map(player => (
          <li key={player.id}>
            {player.name} - Score: {player.score}
          </li>
        ))}
      </ul>
    </div>
  );
}



function WaitingRoom() {
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();

  const fetchPlayers = () => {
    // Fetch the list of players connected to the game
    fetch('/players')
      .then(response => response.json())
      .then(data => {
        // Only update state if data is not empty
        if (data.players.length > 0) {
          setPlayers(data.players);
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  useEffect(() => {
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 1000); // Check for new players every 5 seconds

    const checkNewSong = async () => {
      try {
        const response = await fetch('/nextpage');
        const data = await response.json();
        if (data.isPlaying) {
          navigate('/gamescreen');
        }
      } catch (error) {
        console.error('Error checking new song:', error);
      }
    };

    const songInterval = setInterval(checkNewSong, 1000); // Check for new song every 5 seconds

    return () => {
      clearInterval(interval); // Clean up the player interval when the component is unmounted
      clearInterval(songInterval); // Clean up the song interval when the component is unmounted
    };
  }, [navigate]);

  return (
    <div className="formPage">
      <h1>Waiting for game to start</h1>
      <h2>Players:</h2>
      <ul>
        {players.map(player => (
          <li key={player.id}>{player.name}</li>
        ))}
      </ul>
    </div>
  );
}

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button onClick={toggleMenu} className="hamburger">
        <RxHamburgerMenu />
      </button>
      {isOpen && (
        <div className="menu">
          <div><Link className="menu-link" to="/joingame">Join Game</Link></div>
        </div>
      )}
    </div>
  );
};

export const UserContext = createContext();

function App() {

  const [username, setUsername] = useState('');

  return (
    <UserContext.Provider value={{ username, setUsername }}>
      <Router>
        <div>
          <HamburgerMenu />
          <Routes>
            <Route path="/joingame" element={<JoinGame />} />
            <Route path="/choosename" element={<ChooseName />} />
            <Route path="*" element={<JoinGame />} />
            <Route path="/" element={<JoinGame />} />
            <Route path="/gamescreen" element={<GameScreen />} />
            <Route path="/host" element={<HostGame />} />
            <Route path="/waitingroom" element={<WaitingRoom />} />
            <Route path="/waitinghostscreen" element={<WaitingHostScreen />} />
            <Route path="/waitingfornextsong" element={<WaitingForNewSong />} />
            <Route path="/waitingforallplayers" element={<WaitingForAllPlayers />} />
            <Route path="/hostleaderboard" element={<HostLeaderboardScreen />} />
          </Routes>
        </div>
      </Router>
    </UserContext.Provider>
  );
}

export default App