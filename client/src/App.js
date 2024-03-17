import React, { useState, useEffect, createContext, useContext } from 'react'
import './App.css';
import './Button.css';
import { RxHamburgerMenu } from "react-icons/rx";
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import users from './users.json';

function StartPage() {
  const navigate = useNavigate();
  const { username, setUsername, password, setPassword } = useContext(UserContext);

  const onStartButtonClick = () => {
    if (username) { // Add this check
      navigate('/search');
      // alert('Search is currently disabled for testing Username: ' + username + ' Password: ' + password);
    } else {
      alert('You must be logged in to search.');
    }
  };

    return (
      <div className="page1">
        <h1>PB&J Exotic Scanner</h1>
        <button className="custom-button1" onClick={onStartButtonClick}>Proceed to Scanner</button>
      </div>
    );
}

function SearchPage() {

    const [data, setData] = useState([{}])
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate();

    const onSearchButtonClick = () => {
      setIsLoading(true);
      fetch("/search").then(
          res => {
              if (!res.ok) {
                  throw new Error('Network response was not ok');
              }
              // Check if the response is empty
              if (res.headers.get('content-length') === '0' || res.status === 204) {
                  return {};
              }
              return res.json();
          }
      ).then(
          data => {
              setData(data);
              console.log(data);
              setIsLoading(false);
          }
      ).catch(
          error => {
            console.error('(server is probably down) Error:', error)
            setIsLoading(false);
          }
      );
  };

    const onBackButtonClick = async () => {
      try {
        const response = await fetch('/stop-process', { method: 'POST' });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        navigate('/home');
      } catch (error) {
        console.error('Error:', error);
      }
    };
  


    return (
        <div className="page2">

        
            
          {typeof data.users === 'undefined' ? (
              <p></p>
          ) : data.users.length === 0 ? (
              <p>No users found</p>
          ) : (
              data.users.map((user, i) => (
                  <p key={i}>{user}</p>
              ))
          )}

        <button className="custom-button1" onClick={onSearchButtonClick}>{isLoading ? 'Searching...' : 'Search'}</button>
          

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

function LogOut() {
  const { username, setUsername, password, setPassword } = useContext(UserContext);
  const navigate = useNavigate();

  const onClick = () => {
    // Log out the user
    setUsername('');
    setPassword('');
    navigate('/home');

  };

  return (
    <div className="page1">
      <h1>Log Out</h1>
      <button className="custom-button1" onClick={onClick}>Log Out</button>
    </div>
  );
}

function SignIn() {
  const { username, setUsername, password, setPassword } = useContext(UserContext);
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
          <div><Link className="menu-link" to="/home">Home</Link></div>
          <div><Link className="menu-link" to="/profile">Profile</Link></div>
          <div><a className="menu-link" href="#">About</a></div>
          <div><Link className="menu-link" to="/signin">Sign in</Link></div>
          <div><a className="menu-link" href="logout">Log Out</a></div>
        </div>
      )}
    </div>
  );
};

export const UserContext = createContext();

function App() {
  // Create state variables
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <UserContext.Provider value={{ username, setUsername, password, setPassword }}>
      <Router>
        <div>
          <HamburgerMenu />
          <Routes>
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/logout" element={<LogOut />} />
            <Route path="/home" element={<StartPage />} />
            <Route path="*" element={<SignIn />} />
          </Routes>
        </div>
      </Router>
    </UserContext.Provider>
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