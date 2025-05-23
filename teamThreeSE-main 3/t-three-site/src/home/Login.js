import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import urlStart from '../Global';
import './Login.css';
import LoadingSpinner from '../Generic/LoadingSpinner';

function LoginPage(){
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState(false);
    const [emptyUsername, setEmptyUsername] = useState(false);
    const [emptyPassword, setEmptyPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
      // Check if user is logged in and we need to redirect
      if (localStorage.getItem('userId') && localStorage.getItem('username') && localStorage.getItem('userType')) {
        
        const userType = localStorage.getItem('userType');
          {
          if (userType === 'admin') {
            window.location.href = '/AdminHome';
          } else if (userType === 'manager') {
            window.location.href = '/ManagerHome';
          } else {
            window.location.href = '/home';
          }
        }
      }
    }, []);
    function tryLogin(){


        setError(false);
        setEmptyUsername(false);
        setEmptyPassword(false);
        // localStorage.setItem('userId', "testUserOne");
        // localStorage.setItem('username', "Test User");
        // navigate('/home');


        if(username == ''){
          setEmptyUsername(true);
        }

        if(password == ''){
          console.log("password is empty")
          setEmptyPassword(true);
        }

        if(username == '' || password == ''){
          return;
        }


        setIsLoading(true);


      logInRequest();

    }
    async function logInRequest() {
      console.log('userId:', localStorage.getItem('userId'));
      try {
        const response = await fetch(urlStart + 'api/login',{
          method: 'POST',
          headers: {
            "Authorization": "Bearer " + process.env.REACT_APP_AUTH_KEY,
            'Content-Type': 'application/json'
          },
          // body: JSON.stringify({ userId: localStorage.getItem('userId') }),
          body: JSON.stringify({ 
            username: username,
            password: password
          }),
        }
        );
        if (!response.ok) {
          setError(true);
          //throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // console.log(JSON.parse(data))

        console.log('data:', data);
        console.log(data.user_id)
        localStorage.setItem('userId', data.user_id);
        localStorage.setItem('username', data.username);
        localStorage.setItem('userType', data.user_type);
        localStorage.setItem('location', data.location);

        setIsLoading(false);

       window.location.href = '/';
        //if we dont go back it wont allow touch for some reason?


      } catch (error) {
        setError(true);
        setIsLoading(false);
        // console.error('Failed to fetch devices:', error);
      }
    }

    function changePage(){
      const userType = localStorage.getItem('userType');

      // Using window.location.replace for a cleaner page reload
      if (userType === 'admin') {
        window.location.replace('/AdminHome');
      }
      else if (userType === 'manager') {
        window.location.replace('/ManagerHome');
      }
      else {
        window.location.replace('/home');
      }
    }


    return (
        <div className="loginBase">
          <div className="loginBox">
          <h1>Login</h1>

            <label className="label" htmlFor='username'>Username</label>
            <input
              type="text"
              id="username"
              className="input"
              placeholder="Enter your username"
              onChange={(e) => setUsername(e.target.value)}
              autoComplete='username'
            />
            {emptyUsername && <p className="errorLogin">Username field can not be empty</p>}
            <label className="label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="input"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              autoComplete='current-password'
            />
            {emptyPassword && <p className="errorLogin">Password field can not be empty</p>}
            {error && <p className="errorLogin">The username or password is incorrect</p>}
           {!isLoading && ( <button className="loginButton" onClick={tryLogin}>Login</button> )}
           {isLoading && ( <LoadingSpinner colorIn={'green'} textIn={'Logging in'}/> )}


            {/* <Link to="/AdminHome">Go to Admin Home</Link>
            <Link to="/ManagerHome">Go to Manager Home</Link> */}

          </div>
        </div>
      );
    }

export default LoginPage;