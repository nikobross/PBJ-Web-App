import React, { useState, useEffect } from 'react'


function StartPage({ onStartButtonClick }) {
    return (
      <div>
        <h1>Start Page</h1>
        <button onClick={onStartButtonClick}>Search</button>
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
        <div>
            
          {typeof data.users === 'undefined' ? (
              <p>Loading...</p>
          ) : data.users.length === 0 ? (
              <p>No users found</p>
          ) : (
              data.users.map((user, i) => (
                  <p key={i}>{user}</p>
              ))
          )}

        <button onClick={onBackButtonClick}>Back to Start</button>
        </div>
    )
}


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
