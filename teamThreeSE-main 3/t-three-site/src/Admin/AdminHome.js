import React, { useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import './AdminHome.css';
import urlStart from '../Global'
import Header from '../header/header';
import { useNavigate } from "react-router-dom";
import DarkModeModule from '../home/DarkModeToggle';

function AdminHomePage() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const [residents, setResidents] = useState([]);

  const users = [
    { name: "John Doe", password: "password" },
    { name: "Jane Smith", password: "password" },
    { name: "Alice Johnson", password: "password" },
    { name: "Bob Brown", password: "password" }
  ];

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    window.location.href = '/';
  };

  useEffect(() => {
    // if (window.location.href.includes("?timestamp") ) {
    //     window.location.assign("https://teamthreese.pages.dev/adminHome");
    // }
    async function getResitdents() {
      try {
        const response = await fetch(urlStart + 'api/getUsers',{
          method: 'GET',
          headers: {
            "Authorization": "Bearer " + process.env.REACT_APP_AUTH_KEY,
            'Content-Type': 'application/json'
          },
        }
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('data:', data);
        setResidents(data);
      } catch (error) {
        console.error('Failed to fetch residents:', error);
      }
    }

    getResitdents();
  }, []);

  return (
    <div>
            <Header />
    <div className="home-container">
      {/* <header className="home-header">
        <h1>Welcome back, {username}!</h1>
        <button className="btn logout" onClick={handleLogout}>Logout</button>
      </header>
       */}
      <div className="home-actions">
        <Link to="/AddUser" className="btn primary">Add User</Link>
      </div> 

      <div className="home-main layout-grid">
        <aside className="user-section scrollable">
          <h2>Users</h2>
            <div className="user-list">
              {residents.map((user, index) => (
                <div key={index} className="user-item">
                  <p><strong>Username:</strong> {user.username}</p>
                  <p><strong>UserID:</strong> {user.user_id}</p>
                  <p><strong>User Type:</strong> {user.user_type}</p>
                  <p><strong>Location:</strong> {user.location}</p>
                  <button className="btn" onClick={() => navigate('/editUser', {state: {user}})}>
        Edit User
    </button>
                </div>
              ))}

            </div>
        </aside>
      </div>
      <DarkModeModule/>
    </div>
    </div>
  );
}

export default AdminHomePage;