import React, { useState, useEffect } from 'react'
import './App.css';
import './Button.css';
import { RxHamburgerMenu } from "react-icons/rx";
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';

function StartPage({ onStartButtonClick }) {
    return (
      <div className="page1">
        <h1>PB&J Exotic Scanner</h1>
        <button className="custom-button1" onClick={onStartButtonClick}>Search</button>
      </div>
    );
  }

  function Page2({ onBackButtonClick }) {
    return (
      <div>
        <h1>This is Page 2</h1>
        <button onClick={onBackButtonClick}>Back to Start</button>
      </div>
    );
  }


  function Page3({ onBackButtonClick }) {
    return (
      <div>
        <h1>This is Page 3</h1>
        <button onClick={onBackButtonClick}>Back to Start</button>
        <h2>Test Text</h2>
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

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Router>
      <div>
        <button onClick={toggleMenu} className="hamburger">
          <RxHamburgerMenu />
        </button>
        {isOpen && (
          <div className="menu">
            <div><Link to="/">Home</Link></div>
            <div><Link to="/profile">Profile</Link></div>
            <div><a href="#">About</a></div>
            <div><a href="#">Sign In</a></div>
            <div><a href="#">Log Out</a></div>
          </div>
        )}
      </div>
      <Routes>
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
};

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

export default App
