import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AddDevice.css';
import urlStart from '../Global';
import Header from '../header/header';

import LoadingSpinner from '../Generic/LoadingSpinner';
function AddDevice(){
    var userId;
    const location = useLocation();
    const [deviceName, setDeviceName] = useState('');
    const [deviceType, setDeviceType] = useState('Light');
    const [showButton, setShowButton] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [devices, setDevices] = useState([]);
    const navigate = useNavigate();

    if(location.state){
        console.log('location.state:', location.state);
        userId = location.state.user.user_id;
    }
    else{
        userId = localStorage.getItem('userId');
    }


    function updateDeviceName(nameIn){
        console.log('nameIn:', nameIn);
        setDeviceName(nameIn);
        updateShowButton(nameIn, deviceType);
    }

    function updateDeviceType(typeIn){
        console.log('typeIn:', typeIn);
        setDeviceType(typeIn);
        updateShowButton(deviceName, typeIn);
    }

    function updateShowButton(name, type){
        if (name.length > 3 && type !== '') {
            setShowButton(true);
        } else {
            setShowButton(false);
        }
    }


    async function apiAddDevice() {   
        console.log('apiAddDevice');
        console.log(userId)         
        try {
            console.log("Sending request with:", { deviceName: deviceName, deviceType: deviceType, deviceLocation: 0, userID: userId})
            ;
            const response = await fetch(urlStart + 'api/addDevice',{
            method: 'POST',
            headers: {
                "Authorization": "Bearer " + process.env.REACT_APP_AUTH_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ deviceName: deviceName, deviceType: deviceType, userID: userId}),
          }
          );
          console.log('test');
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const data = await response.json();
          console.log('addDevicedata:', data);
          setIsLoading(false);
          if(localStorage.getItem('userType') == 'manager'){
            navigate("/ManagerHome");
          }
            else{
                navigate("/home");
            }
        } catch (error) {
          console.error('Failed to add device:', error);
          
        }
    }

    function submitData(){
        console.log('Adding device:', deviceName, deviceType);
        const newDevice = {
            name: deviceName,
            type: deviceType
        };
        const userID = localStorage.getItem('userId')
        let deviceState;
            let devicePowerUsage;
            if (deviceType == 'radiator') {
                deviceState = '0';
                devicePowerUsage = 10;
            } else if (deviceType == 'blind') {
                deviceState = 'open';
                devicePowerUsage = 2;
            } else {
                deviceState = 'off';
                devicePowerUsage = 5;
            };
            setIsLoading(true);
            apiAddDevice();
        setDeviceName('');
        setDeviceType('Light');
        setShowButton(false);
        //navigate("/home?timestamp=" + (new Date()).getTime());
    }

    return (
        <div>
                        <Header />
        <div className="add-device-container">
                        {!isLoading && (<div><h1>Add Device</h1>
            <p>Enter the device name:</p>
            <input
                type="text"
                value={deviceName}
                onChange={e => updateDeviceName(e.target.value)}
            />
            <h1>Device Type</h1>
            <select
                value={deviceType}
                onChange={e => updateDeviceType(e.target.value)}
            >
                <option value="Light">Light</option>
                <option value="radiator">Radiator</option>
                <option value="plug">Plug</option>
                <option value="blind">Blind</option>
            </select>
                       </div>)}
            {showButton && (
                <button onClick={submitData}>Submit</button>
            )}
            {isLoading && (

            <LoadingSpinner colorIn={'green'} textIn={'Adding Device'}/>

            )}
        </div>
        </div>
    )
}

export default AddDevice;