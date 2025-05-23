import { useLocation } from 'react-router-dom';
import Header from '../header/header';
import React, { useState, useEffect } from 'react';
import urlStart from '../Global';
import './EditUser.css';
import LoadingSpinner from '../Generic/LoadingSpinner';

function EditUser() {
    const [newUserName, setNewUserName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [isError, setIsError] = useState(false);
    const [inputError, setInputError] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const location = useLocation();
    const user = location.state.user;


    useEffect(() => {
        if (user && user.username) {
            setNewUserName(user.username);
        }
    }, [user]);


    async function saveUser() {
      console.log(newLocation)
        setInputError(false)
        if (newUserName.length < 4 || newPassword.length < 6 || newLocation === '') {
            //check no spaces in username or password

            setInputError(true);
            return;
        }

        if(newUserName.includes(' ') || newPassword.includes(' ')){
            setInputError(true);
            return;
        }

        setIsSaving(true);



        try {
          const response = await fetch(urlStart + 'api/updateUser',{
            method: 'POST',
            headers: {
              "Authorization": "Bearer " + process.env.REACT_APP_AUTH_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({userId: user.user_id, username: newUserName, password: newPassword, location: newLocation}),
          }
          );
          if (!response.ok) {
            throw new Error('Network response was not ok');
            setIsSaving(false);
          }
          const data = await response.json();
          console.log('data:', data);
            setIsSaving(false);
            window.location.href = '/adminHome';



        } catch (error) {
          console.error('Failed to add user:', error);
        }
    }


    async function deleteUser() {
        setIsDeleting(true);
        try {
          const response = await fetch(urlStart + 'api/deleteUser',{
            method: 'POST',
            headers: {
              "Authorization": "Bearer " + process.env.REACT_APP_AUTH_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({userId: user.user_id}),
          }
          );
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          console.log('data:', data);
          window.location.href = '/adminHome';

        } catch (error) {
          console.error('Failed to add user:', error);
        }
    }


    return (
        <div>
            <Header />
        <div className="edit-user-container">
            <h1>Edit User</h1>
            <p>User ID: {user.user_id}</p>

            <div class = "user-details">
                <label>Username: </label>
                <input
                    type="text"
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                />
            </div>

            <div class = "user-details">
                <label>New Password: </label>
                <input
                    type="text"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                />
            </div>

            <div class = "device-selector">
              <div class = "user-details">
                <label>New Location : </label>
              </div>
              <select 
  onChange={e => setNewLocation(e.target.value)}
  value={newLocation}
  required
>
  <option value="" disabled selected>Select a location</option>
  <option value="FloorOne">Floor 1</option>
  <option value="FloorTwo">Floor 2</option>
  <option value="FloorThree">Floor 3</option>
  <option value="ExtraCare">Extra Care</option>
</select>
            </div>

            <div>
                <button onClick={() => saveUser()}>Save</button>
                <button onClick={() => deleteUser()}>Delete</button>
            </div>

            {isError && <p className="error">Failed to save user</p>}
            {inputError && <p className="error">Check username or password and try again</p>}

            {isSaving && <LoadingSpinner colorIn={'green'} textIn={'Saving'}/>}
            {isDeleting && <LoadingSpinner colorIn={'red'} textIn={'Deleting'}/>}
        </div>
        </div>
    );
}

export default EditUser;