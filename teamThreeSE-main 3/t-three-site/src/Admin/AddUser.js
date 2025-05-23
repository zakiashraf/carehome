import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddUser.css';
import urlStart from '../Global';
import Header from '../header/header';
import LoadingSpinner from '../Generic/LoadingSpinner';

function AddUser() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [showButton, setShowButton] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userType, setUserType] = useState('resident');
    const [newLocation, setNewLocation] = useState('');
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    function updateUserName(nameIn) {
        console.log('nameIn:', nameIn);
        setUserName(nameIn);
        updateShowButton(nameIn, password);
    }

    function updatePassword(passwordIn) {
        console.log('passwordIn:', passwordIn);
        setPassword(passwordIn);
        updateShowButton(userName, passwordIn);
    }

    function updateShowButton(name, password) {
        if (name.length > 3 && password.length > 5) {
            setShowButton(true);
        } else {
            setShowButton(false);
        }
    }

    function submitData() {
        setIsLoading(true);
        console.log('Adding user:', userName, password);
        async function addUser() {
            try {
              const response = await fetch(urlStart + 'api/addUser',{
                method: 'POST',
                headers: {
                    "Authorization": "Bearer " + process.env.REACT_APP_AUTH_KEY,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: userName, password: password, userType: userType, userLocation: newLocation }),
              }
              );
              if (!response.ok) {
                setIsLoading(false);
                throw new Error('Network response was not ok');
              }
              const data = await response.json();
              console.log('data:', data);
              setIsLoading(true);
              navigate("/adminHome?timestamp=" + (new Date()).getTime());

            } catch (error) {
                setIsLoading(false);
              console.error('Failed to add user:', error);
            }
        }
      
        addUser();
        setUserName('');
        setPassword('');
        setShowButton(false);
        //navigate("/adminHome?timestamp=" + (new Date()).getTime());
    }

    return (
        <div>
            <Header />
        <div class ="add-user-container">

            <h1>Add User</h1>
            <p>Enter the username:</p>
            <input
                type="text"
                placeholder='Username'
                value={userName}
                onChange={e => updateUserName(e.target.value)}
            />    
            <p>Enter the user password:</p>
            <input
                type="text"
                placeholder='Password'
                value={password}
                onChange={e => updatePassword(e.target.value)}
            />
                        <select
                value={userType}
                onChange={e => setUserType(e.target.value)}
            >
                <option value="resident">resident</option>
                <option value="manager">manager</option>
                <option value="admin">admin</option>

            </select>

            <select onChange={e => setNewLocation(e.target.value)}>
                <option value="FloorOne">Floor 1</option>
                <option value="FloorTwo">Floor 2</option>
                <option value="FloorThree">Floor 3</option>
                <option value="ExtraCare">Extra Care</option>
                </select>


            {showButton && (
                <button onClick={submitData}>Submit</button>
            )}
                        {isLoading && (

<LoadingSpinner colorIn={'green'} textIn={'Adding User'}/>

)}
        </div>
        </div>
    )
}

export default AddUser;