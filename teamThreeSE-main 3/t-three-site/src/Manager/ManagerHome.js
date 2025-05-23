import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ManagerEnergyUse from "./ManagerEnergyUse";
import "./ManagerHome.css";
import urlStart from "../Global";
import Header from "../header/header";
import DarkModeModule from "../home/DarkModeToggle";

function ManagerHomePage() {
  const username = localStorage.getItem("username");
  const [timeFrame, setTimeFrame] = useState("day");
  const [residents, setResidents] = useState([]);
  const navigate = useNavigate();
  const [selectedDeviceType, setSelectedDeviceType] = useState("all");

  const [deviceFilter, setDeviceFilter] = useState("all");
  const [viewableDevices, setViewableDevices] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedResident, setSelectedResident] = useState("all");
  const [selectedResName, setSelectedResName] = useState("all");
  const [devices, setDevices] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);

  const userLocation = localStorage.getItem("location");

  //const deviceTypes = Array.from(new Set(devices.map((device) => device.type)));

  const residentsList = Array.from(
    new Set(residents.map((resident) => resident.username))
  );

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    window.location.href = "/";
  };

  useEffect(() => {
    async function getResidents() {
      try {
        const response = await fetch(urlStart + "api/getManagerUsers", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + process.env.REACT_APP_AUTH_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ location: userLocation }),
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("Residents data:", data);
        var residentsToSet = [];
        for (var i = 0; i < data.results.length; i++) {
          console.log(data.results[i]);
          if (data.results[i].user_type !== "manager") {
            residentsToSet.push(data.results[i]);
          }
        }
        setResidents(residentsToSet);
      } catch (error) {
        console.error("Failed to fetch residents:", error);
      }
    }
    getResidents();
  }, [userLocation]);

  useEffect(() => {
    async function getDevices() {
      console.log("userLocation:", userLocation);
      try {
        const response = await fetch(urlStart + "api/getDevicesAtLocation", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + process.env.REACT_APP_AUTH_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ location: userLocation }),
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("Device data:", data);
        setDevices(data);
        const types = Array.from(new Set(data.map((device) => device.type)));
        setDeviceTypes(types);
      } catch (error) {
        console.error("Failed to fetch devices:", error);
      }
    }
    getDevices();
  }, [userLocation]);

  function updateSelectedResident(residentName) {
    console.log("Selected resident:", residentName);
    console.log("Selected resident ID:", selectedResident);
    console.log(devices)
    setSelectedResName(residentName);
    for (var i = 0; i < residents.length; i++) {
      if (residents[i].username === residentName) {
        setSelectedResident(residents[i].user_id);
        return;
      }
    }

    if (residentName === "all") {
      setSelectedResident("all");
    }
  }

  return (
    <div className="home-container">
      <Header />
      <div className="home-main layout-grid">
        <aside className="device-section scrollable">
          <h2>Residents in {userLocation}</h2>
          <div className="device-list">
            {residents.map((user, index) => (
              <div
                key={index}
                className="user-item"
                onClick={() =>
                  navigate(`/users/${user.user_id}`, { state: { user } })
                }
                style={{
                  cursor: "pointer",
                  fontWeight:
                    selectedResident === user.user_id ? "bold" : "normal",
                }}
              >
                <p>
                  <strong>Username:</strong> {user.username}
                </p>
                <p>
                  <strong>UserID:</strong> {user.user_id.substring(0, 8)}
                </p>
              </div>
            ))}
          </div>
        </aside>

        <main className="energy-section centered">
          <h2>Energy Usage</h2>
          <div className="timeframe-selector">
            <label>View data for: </label>
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>

          <div className="timeframe-selector">
            <label>View data for residents: </label>
            <select
              value={selectedResName}
              onChange={(e) => {
                updateSelectedResident(e.target.value);
              }}
            >
              <option value="all">All Residents</option>
              {residentsList.map((resident, index) => (
                <option key={index} value={resident.user_id}>
                  {resident}
                </option>
              ))}
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
            <ManagerEnergyUse
              timeFrame={timeFrame}
              deviceType={selectedDeviceType}
              rawDataIn={devices}
              selectedResident={selectedResident}
            />
          </div>
          <DarkModeModule />
        </main>
      </div>
    </div>
  );
}

export default ManagerHomePage;
