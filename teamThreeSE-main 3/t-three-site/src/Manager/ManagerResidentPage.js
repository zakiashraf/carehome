import { useLocation } from "react-router-dom";
import DevicePreview from "../devices/DevicePreview";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import EnergyUse from '../graphs/energyUse';
import urlStart from '../Global';
import Header from "../header/header";
import { useNavigate } from "react-router-dom";
import DarkModeModule from "../home/DarkModeToggle";
import GiveMessage from "../home/GiveMessage";
import './ManagerResidentPage.css';
function ManagerResidentPage() {
    const navigate = useNavigate();

    const [timeFrame, setTimeFrame] = useState('day');
    const [userMessage, setUserMessage] = useState('');
    const [devices, setDevices] = useState([]);
    const [selectedDeviceType, setSelectedDeviceType] = useState("all");
    const [allowMessage, setAllowMessage] = useState(false);
    const deviceTypes = Array.from(new Set(devices.map((device) => device.type)));

  
    const location = useLocation();
    var user = location.state.user;
    console.log(user)
    

      


        useEffect(() => {
          if (user && user.user_id) {
              getDevices();
          } else {
              console.error('User data is missing, cannot fetch devices');
          }
      }, [user]); // Only re-run if user changes

        async function getDevices() {



          console.log('userId:', user.user_id);
          console.log("trying thiss")
          try {
            const response = await fetch(urlStart + 'api/getDevices',{
              method: 'POST',
              headers: {
                "Authorization": "Bearer " + process.env.REACT_APP_AUTH_KEY,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ userId: user.user_id }),
            }
            );
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('data:', data);
            console.log(data.results)
            setDevices(data.results);
          } catch (error) {
            console.error('Failed to fetch devices:', error);
          }
        }
    
        async function SendMessage() {

          console.log("sending message" + userMessage);
          console.log(user.user_id);

          try {
            const response = await fetch(urlStart + 'api/updateMessage',{
              method: 'POST',
              headers: {
                "Authorization": "Bearer " + process.env.REACT_APP_AUTH_KEY,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ userId: user.user_id, message: userMessage }),
            }
            );
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('data:', data);
            console.log(data.results)
                    } catch (error) {
            console.error('Failed to fetch devices:', error);
          }

        }

        function handleMessageChange(event) {
          setUserMessage(event.target.value);
          if (event.target.value.length > 0) {
            console.log('Message:', event.target.value);
            setAllowMessage(true);
          }
        }
          

  return (
    <div>
      <Header />
    <div className="manager-r-home-container">
      {/* <p>Resident ID: {user.user_id}</p> */}
      <p>Resident UserName: {user.username}</p>

    </div>

{allowMessage && (    <button className="btn primary" onClick={SendMessage}>
  Send message
</button>)}

    <div className="home-actions">
        {/* <Link to="/devices" className="btn">View Devices</Link> */}
        <button onClick= {() => {
          navigate('/addDevice', { state: { user } });
        }} className="btn primary"> Add device</button>
      </div>

      <div className="home-main layout-grid">
        <aside className="device-section">
          <h2>Their Devices</h2>
          <div className="device-list">
            {devices.map((device, index) => (
              <DevicePreview key={index} deviceData={device} isManager={true}/>
            ))}
          </div>

        </aside>

        <main className="energy-section centered">
          <div className="energy-Main">
          <h2>Energy Usage</h2>
          <div className="timeframe-selector">
            <label>View data for: </label>
            <select value={timeFrame} onChange={(e) => setTimeFrame(e.target.value)}>
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>

          <div className="device-selector">
              <label>View data for device type: </label>
              <select
                value={selectedDeviceType}
                onChange={(e) => setSelectedDeviceType(e.target.value)}
              >
                <option value="all">All Devices</option>
                {deviceTypes.map((type, index) => (
                  <option key={index} value={type.toLowerCase()}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

          <div className="energy-grid">
            <EnergyUse
              timeFrame={timeFrame}
              deviceType={selectedDeviceType}
              rawDataIn={devices}
            />
          </div> 
          <div className="extrasRow">
                <DarkModeModule />
                <GiveMessage userId={user.user_id}/>

          </div>
          </div>

        </main>
    </div>
    </div>
  );
}

export default ManagerResidentPage;