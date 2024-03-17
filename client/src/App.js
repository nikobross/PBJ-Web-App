import React, { useState, useEffect, createContext, useContext } from 'react'
import './App.css';
import './Button.css';
import { RxHamburgerMenu } from "react-icons/rx";
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import users from './users.json';


function StartPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const onStartButtonClick = () => {
    if (isLoggedIn) { // Add this check
      navigate('/search');
    } else {
      alert('You must be logged in to search.');
    }
  };

    return (
      <div className="page1">
        <h1>PB&J Exotic Scanner</h1>
        <button className="custom-button1" onClick={onStartButtonClick}>Search</button>
      </div>
    );
}

function SearchPage({ onBackButtonClick }) {

    const [data, setData] = useState([{}])
    
    useEffect(() => {
        fetch("/search").then(
            res => res.json()
        ).then(
            data => {
                setData(data)
                console.log(data)
            }
        )
    }, [])

    return (
        <div className="page2">
            
          {typeof data.users === 'undefined' ? (
              <p>Scanning...</p>
          ) : data.users.length === 0 ? (
              <p>No users found</p>
          ) : (
              data.users.map((user, i) => (
                  <p key={i}>{user}</p>
              ))
          )}

        <button className="custom-button1" onClick={onBackButtonClick}>Back to Start</button>
        </div>
    )
}

function Profile({ onStartButtonClick }) {
  return (
    <div className="page1">
      <h1>Profile</h1>
      <button className="custom-button1" onClick={onStartButtonClick}>Set Profile</button>
    </div>
  );
}

function SignIn({ onStartButtonClick }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
  
    // Check if there is a user with the entered username and password
    const user = users.find(user => user.username === username && user.password === password);
  
    if (user) {
      setMessage('Login successful');
      navigate('/home');
    } else {
      setMessage('Invalid username or password');
    }
  };

  return (
    <div className="formPage">
      <h1>Sign In</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit} className="formPage">
        <input
          className="custom-text-input"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="custom-text-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="custom-button1" type="submit">Submit</button>
      </form>
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
          <div><Link to="/home">Home</Link></div>
          <div><Link to="/profile">Profile</Link></div>
          <div><a href="#">About</a></div>
          <div><Link to="/signin">Sign in</Link></div>
          <div><a href="#">Log Out</a></div>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <div>
        <HamburgerMenu />
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/home" element={<StartPage />} />
          <Route path="*" element={<SignIn />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App


/*
function App() {
    const [currentPage, setCurrentPage] = useState('start');
  
    const handleStartButtonClick = () => {
      setCurrentPage('search');
    };
  
    const handleBackButtonClick = () => {
      setCurrentPage('start');
    };
  
    return (
      <div>
        <HamburgerMenu />
        {currentPage === 'start' && (
          <StartPage onStartButtonClick={handleStartButtonClick} />
        )}
        {currentPage === 'search' && (
          <SearchPage onBackButtonClick={handleBackButtonClick} />
        )}
      </div>
    );
  }


*/