import React, { useState, useEffect, createContext, useContext, useRef } from 'react'
import './App.css';
import './Button.css';
import { RxHamburgerMenu } from "react-icons/rx";
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

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

    const shouldContinueFetching = useRef(true);

    const { username, setUsername, password, setPassword } = useContext(UserContext);

    const onSearchButtonClick = () => {
      setIsLoading(true);
      shouldContinueFetching.current = true;
      const fetchData = () => {
        fetch(`/search?username=${username}`).then(
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
            setData(prevData => ({
              users: [...(prevData.users || []), ...data.users]
          }));
            console.log(data);
            setIsLoading(false);
            // Call fetchData again to fetch the next set of data
            if (shouldContinueFetching.current){
              setTimeout(fetchData, 6000);
            }
          }
        ).catch(
          error => {
            console.error('(server is probably down) Error:', error)
            setIsLoading(false);
          }
        );
      };
      fetchData();
    };

    const onBackButtonClick = async () => {
      try {
        shouldContinueFetching.current = false;
        console.log('Stopping process');
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
          {isLoading ? (
              <p>Loading...</p>
          ) : (!data.users || data.users.length === 0) ? (
              <p>No users found</p>
          ) : (
              data.users.map((user, i) => (
                  <p key={i}>{user}</p>
              ))
          )}

          <button className="custom-button1" onClick={onSearchButtonClick}>
              {isLoading ? 'Searching...' : 'Search'}
          </button>

          <button className="custom-button1" onClick={onBackButtonClick}>
              Back to Start
          </button>
      </div>
  )
}

function Profile() {
  const [formState, setFormState] = useState({
    input1: '',
    input2: '',
    input3: '',
    input4: '',
    input5: '',
  });

  const [inputColors, setInputColors] = useState({
    input1: 'black',
    input2: 'black',
    input3: 'black',
    input4: 'black',
    input5: 'black',
});

  const { username, setUsername, password, setPassword } = useContext(UserContext);

  useEffect(() => {
    const fetchKeys = async () => {
      if (!username) {
        console.log('User is not signed in.');
        return;
      }

      const response = await fetch(`/get-keys?username=${username}`);
      const data = await response.json();
      setFormState({
        input1: data.keys[0] || '',
        input2: data.keys[1] || '',
        input3: data.keys[2] || '',
        input4: data.keys[3] || '',
        input5: data.keys[4] || '',
      });



      console.log(data.keys);
    };

    fetchKeys();
  }, [username]);

  useEffect(() => {
    const checkKeys = async () => {
        for (const [inputName, keyValue] of Object.entries(formState)) {
            const response = await fetch(`/check-keys?key=${keyValue}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ keys: [keyValue], username }),
            });

            if (!response.ok) {
                console.error('Failed to check keys');
                return;
            }

            const data = await response.json();
            console.log(data)
            setInputColors(prevColors => ({
                ...prevColors,
                [inputName]: data.isValid ? 'green' : 'red',
            }));
        }
    };

    checkKeys();
}, [formState, username]);

  const handleInputChange = (event) => {
    setFormState({
      ...formState,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();



    // Convert form state to array of keys
    const keys = Object.values(formState);

    // Send keys and username to backend
    const response = await fetch('/add-keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keys, username }),
    });

    if (!response.ok) {
      console.error('Failed to add keys');
      return;
    }

    const data = await response.json();
    console.log(data.message);
  };

  return (
    <div className="page1">
      <h1>API Keys</h1>
      <form onSubmit={handleSubmit}>
          <input className="custom-text-input2" type="text" name="input1" value={formState.input1} onChange={handleInputChange} style={{ color: inputColors.input1 }} />
          <input className="custom-text-input2" type="text" name="input2" value={formState.input2} onChange={handleInputChange} style={{ color: inputColors.input2 }} />
          <input className="custom-text-input2" type="text" name="input3" value={formState.input3} onChange={handleInputChange} style={{ color: inputColors.input3 }} />
          <input className="custom-text-input2" type="text" name="input4" value={formState.input4} onChange={handleInputChange} style={{ color: inputColors.input4 }} />
          <input className="custom-text-input2" type="text" name="input5" value={formState.input5} onChange={handleInputChange} style={{ color: inputColors.input5 }} />
    <div className="button-container">
        <button type="submit" className="custom-button1">Update Keys</button>
    </div>
      </form>
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: username,
        password: password,
      }),
    });

    if (response.ok) {
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