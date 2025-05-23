import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import urlStart from '../Global';
import './DeviceList.css';

function DeviceList() {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    async function getDevices() {
      console.log('fetching devices');
      try {
        const response = await fetch(urlStart + 'api/getDevices');
        //pass in a user 
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('data:', data);
        setDevices(data);
      } catch (error) {
        console.error('Failed to fetch devices:', error);
      }
    }

    getDevices();
  }, []);

  return (
    <div className="deviceListBase">
      <h1>Device List</h1>
      <ul className="deviceList">
        {devices.length > 0 ? (
          devices.map((device, index) => (
            <li key={index}>
              <Link to={`/devices/${device.id}`} state={{ device }}>
                {device.deviceName}
              </Link>
            </li>
          ))
        ) : (
          <li>No devices found</li>
        )}
      </ul>
    </div>
  );
}

export default DeviceList;