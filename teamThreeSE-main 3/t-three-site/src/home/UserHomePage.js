import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import DevicePreview from "../devices/DevicePreview";
import EnergyUse from "../graphs/energyUse";
import "./userHome.css";
import urlStart from "../Global";
import WeatherModule from "./WeatherModule";
import DarkModeModule from "./DarkModeToggle";
import Header from "../header/header";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../Generic/LoadingSpinner";
import UserMessage from "./ShowMessage";

import VoiceControl from "../Generic/VoiceController";

// const urlStart = 'http://127.0.0.1:8787/'
function HomePage() {
    const navigate = useNavigate();
    const devicesRef = useRef([]);

    const [timeFrame, setTimeFrame] = useState("day");
    const [deviceFilter, setDeviceFilter] = useState("all");
    const [selectedDeviceType, setSelectedDeviceType] = useState("all");
    const [selectedDeviceGroup, setSelectedDeviceGroup] = useState("all");
    const [deviceGroups, setDeviceGroups] = useState([]);
    const [devices, setDevices] = useState([]);
    const [newDeviceName, setNewDeviceName] = useState("");
    const [viewableDevices, setViewableDevices] = useState([]);
    const [darkMode, setDarkMode] = useState(false);
    const automationTimeoutRef = useRef(null);
    const [currentTemp, setCurrentTemp] = useState(0.0);
    const [currentWeather, setCurrentWeather] = useState("sunny");
    const [selectedDevices, setSelectedDevices] = useState({});
    const [pendingAutomations, setPendingAutomations] = useState([]);
    const [userMessage, setUserMessage] = useState("");

    function makeNewGroup() {
        if (newDeviceName === "" || newDeviceName === " ") {
            return;
        }

        var newGroup = {
            groupName: newDeviceName,
            devices: [],
        };

        if (deviceGroups.some((group) => group.groupName === newDeviceName)) {
            return;
        }

        setDeviceGroups([...deviceGroups, newGroup]);
        setNewDeviceName("");
    }

    // this function is used to update the group of a device
    function updateDeviceGroup(deviceId, newGroup, remove) {
        var localDevices = [...devicesRef.current];
        for (var i = 0; i < localDevices.length; i++) {
            if (remove) {
                if (localDevices[i].name === deviceId) {
                    // Default to empty array if device.group is null/undefined.
                    var localGroups = localDevices[i].group
                        ? JSON.parse(localDevices[i].group)
                        : [];
                    var locationIndex = localGroups.indexOf(newGroup);
                    if (locationIndex > -1) {
                        localGroups.splice(locationIndex, 1);
                    }
                    networkNewGroup(
                        JSON.stringify(localGroups),
                        localDevices[i].device_id
                    );
                    localDevices[i].group = JSON.stringify(localGroups);
                }
            } else {
                if (localDevices[i].name === deviceId) {
                    // Default to empty array if device.group is null/undefined.
                    var localGroups = localDevices[i].group
                        ? JSON.parse(localDevices[i].group)
                        : [];
                    localGroups.push(newGroup);
                    localDevices[i].group = JSON.stringify(localGroups);
                    networkNewGroup(
                        JSON.stringify(localGroups),
                        localDevices[i].device_id
                    );
                }
            }
        }
        devicesRef.current = localDevices;
        setDevices(localDevices);
    }

    function addDeviceToGroup(groupId, deviceId) {
        var newGroups = [...deviceGroups];
        for (var i = 0; i < newGroups.length; i++) {
            if (newGroups[i].groupName === groupId) {
                // Check if the device is already in the group
                if (!newGroups[i].devices.includes(deviceId)) {
                    newGroups[i].devices.push(deviceId);
                }
            }
        }
        updateDeviceGroup(deviceId, groupId);
        setDeviceGroups(newGroups);
    }
    function removeDeviceFromGroup(groupName, deviceToRemove) {
        const newGroups = deviceGroups.map((group) => {
            if (group.groupName === groupName) {
                return {
                    ...group,
                    devices: group.devices.filter((device) => device !== deviceToRemove),
                };
            }
            return group;
        });
        setDeviceGroups(newGroups);
    }

    async function updateDevices() {
        try {
            const response = await fetch(urlStart + "api/updateDevices", {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + process.env.REACT_APP_AUTH_KEY,
                    "Content-Type": "application/json",
                },
                body: "",
            });
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            console.log(data);
            if (data){
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function networkNewGroup(group, deviceId) {
        const data = {
            deviceId: deviceId,
            groups: group,
        };
        const result = await fetch(urlStart + "api/updateGroup", {
            method: "POST",
            headers: {
                Authorization: "Bearer " + process.env.REACT_APP_AUTH_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            mode: "cors",
        });
    }

    function deleteGroup(groupName) {
        //for each device in the group, remove the group from the device
        const group = deviceGroups.find((g) => g.groupName === groupName);
        if (group) {
            console.log("group:", group);
            group.devices.forEach((deviceName) => {
                console.log("group name " + groupName);
                updateDeviceGroup(deviceName, groupName, true);
            });
        }

        setDeviceGroups(
            deviceGroups.filter((group) => group.groupName !== groupName)
        );
    }

    function turnOnGroupDevices(groupName) {
        const group = deviceGroups.find((g) => g.groupName === groupName);
        if (group) {
            group.devices.forEach((deviceName) => {
                const device = devices.find((d) => d.name === deviceName);
                if (device) {
                    updateDeviceState(device.device_id, "on");
                }
            });
        }
    }

    function turnOffGroupDevices(groupName) {
        const group = deviceGroups.find((g) => g.groupName === groupName);
        if (group) {
            group.devices.forEach((deviceName) => {
                const device = devices.find((d) => d.name === deviceName);
                if (device) {
                    updateDeviceState(device.device_id, "off");
                }
            });
        }
    }

    function furtherCommands(command) {
        if (command.includes("add") && command.includes("device")) {
            window.location.href = "/addDevice";
        }

        //show devices in list
        else if (command.includes("show")) {
            if (command.includes("lights") || command.includes("light")) {
                filterDevices("light", devices);
            } else if (
                command.includes("radiator") ||
                command.includes("radiators")
            ) {
                filterDevices("radiator", devices);
            } else if (command.includes("blinds") || command.includes("blind")) {
                filterDevices("blind", devices);
            } else if (command.includes("plugs") || command.includes("plug")) {
                filterDevices("plug", devices);
            } else {
                filterDevices("all", devices);
            }
        } else if (
            command.includes("set") ||
            command.includes("change") ||
            command.includes("update")
        ) {
            for (var i = 0; i < devices.length; i++) {
                if (command.includes(devices[i].name.toLowerCase())) {
                    var selectedDevice = devices[i];
                    if (selectedDevice.type.toLowerCase() == "radiator") {
                        //we need to see if there is a number in the command
                        var number = command.match(/\d+/);
                        if (number) {
                            var newTemp = number[0];
                            if (newTemp > 30 || newTemp < 0) {
                                return;
                            }
                            updateDeviceState(selectedDevice.device_id, newTemp);
                        }
                    } else {
                        if (command.includes("on")) {
                            updateDeviceState(selectedDevice.device_id, "on");
                        } else if (command.includes("off")) {
                            updateDeviceState(selectedDevice.device_id, "off");
                        }
                    }
                }
            }
        } else if (command.includes("add") && command.includes("device")) {
            window.location.href = "/addDevice";
        } else {
            for (var i = 0; i < devices.length; i++) {
                if (command.includes(devices[i].name.toLowerCase())) {
                    var selectedDevice = devices[i];
                    console.log("selected device:", selectedDevice);
                    navigate("/devices/" + devices[i].device_id, {
                        state: { device: selectedDevice },
                    });
                }
            }
        }
    }

    const toggleTheme = () => {
        setDarkMode((prevMode) => {
            if (!prevMode) {
                document.documentElement.classList.add("theme-dark");
            } else {
                document.documentElement.classList.remove("theme-dark");
            }
            return !prevMode;
        });
    };

    useEffect(() => {
        if (window.location.href.includes("?timestamp")) {
            window.location.assign("https://teamthreese.pages.dev/home");
        }
        async function getDevices() {
            console.log("userId:", localStorage.getItem("userId"));
            try {
                const response = await fetch(urlStart + "api/getDevices", {
                    method: "POST",
                    headers: {
                        Authorization: "Bearer " + process.env.REACT_APP_AUTH_KEY,
                        "Content-Type": "application/json",
                    },
                    // body: JSON.stringify({ userId: localStorage.getItem('userId') }),
                    body: JSON.stringify({ userId: localStorage.getItem("userId") }),
                });
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                console.log("data:", data);
                console.log(data.results);
                setDevices(data.results);
                devicesRef.current = data.results;
                filterDevices("all", data.results);

                const groupMap = {};

                // Process all devices and their group membership
                for (var i = 0; i < data.results.length; i++) {
                    const device = data.results[i];
                    const deviceName = device.name;

                    try {
                        var localGroups = JSON.parse(device.group);

                        // Add this device to each of its groups
                        for (var j = 0; j < localGroups.length; j++) {
                            const groupName = localGroups[j];

                            // If group doesn't exist yet, create it
                            if (!groupMap[groupName]) {
                                groupMap[groupName] = {
                                    groupName: groupName,
                                    devices: [],
                                };
                            }

                            // Add the device to the group if not already there
                            if (!groupMap[groupName].devices.includes(deviceName)) {
                                groupMap[groupName].devices.push(deviceName);
                            }
                        }
                    } catch (error) {
                        console.error("Error parsing group data for device:", device);
                    }
                }

                // Convert the map to an array for state update
                const updatedGroups = Object.values(groupMap);
                console.log("Updated groups with devices:", updatedGroups);

                // Update state with all groups and their devices
                setDeviceGroups(updatedGroups);

                var localPendingAutomations = [];
                var locaIds = [];
                for (var i = 0; i < data.results.length; i++) {
                    for (
                        var j = 0;
                        j < JSON.parse(data.results[i].data).automations.length;
                        j++
                    ) {
                        localPendingAutomations.push(
                            JSON.parse(data.results[i].data).automations[j]
                        );
                        locaIds.push(data.results[i].device_id);
                    }
                }

                // setPendingAutomations(localPendingAutomations, localIds);
                // console.log('pending automations:', localPendingAutomations);
                // console.log('pending ids:', locaIds);
                runAutomations(localPendingAutomations, locaIds);
            } catch (error) {
                console.error("Failed to fetch devices:", error);
            }
        }
        updateDevices();
        getDevices();
    }, []);


    useEffect(() => {
        async function fetchUserMessage() {
            console.log("userId:", localStorage.getItem("userId"));
            try {
                const response = await fetch(urlStart + "api/getMessage", {
                    method: "POST",
                    headers: {
                        Authorization: "Bearer " + process.env.REACT_APP_AUTH_KEY,
                        "Content-Type": "application/json",
                    },
                    // body: JSON.stringify({ userId: localStorage.getItem('userId') }),
                    body: JSON.stringify({ userId: localStorage.getItem("userId") }),
                });
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                console.log("data:", data.message);
                setUserMessage(data.message);
                // devicesRef.current = data.results;
            }
            catch (error) {
                console.error("Failed to fetch devices:", error);
            }
        }
        fetchUserMessage();
    }, []);



    const deviceTypes = Array.from(new Set(devices.map((device) => device.type)));

    async function runAutomations(newAutomationsIn, idsIn, tempIn) {
        var currentTime = new Date();
        var dayOfWeek = currentTime.getDay();
        var days = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];
        var currentDay = days[dayOfWeek];
        var autoToReRun = [];
        var deviceIds = [];

        var localTemp = await getWeather();
        console.log("local temp:", localTemp);

        for (var i = 0; i < newAutomationsIn.length; i++) {
            var currentAutomation = newAutomationsIn[i];

            console.log("current automation:", currentAutomation);
            var completedAuto = false;

            switch (currentAutomation.triggerType.toLowerCase()) {
                case "weather":
                    console.log("weather automation");
                    completedAuto = conditionValid(
                        currentWeather,
                        currentAutomation.triggerCondition,
                        currentAutomation.triggerValue
                    );
                    break;

                case "time":
                    completedAuto = timeConvert(currentAutomation.triggerValue);
                    console.log("time automation");
                    //completedAuto = conditionValid(currentTime.getHours(), currentAutomation.triggerCondition, currentAutomation.triggerValue);
                    break;

                case "temperature":
                    console.log("temperature automation");
                    completedAuto = conditionValid(
                        localTemp,
                        currentAutomation.triggerCondition,
                        currentAutomation.triggerValue
                    );
                    break;

                case "day":
                    console.log("day automation");
                    console.log("trigger day:", currentAutomation.triggerValue);
                    console.log("current day:", currentDay);
                    completedAuto = currentAutomation.triggerValue == currentDay;
                    console.log("completed auto:", completedAuto);
                    break;
            }

            if (completedAuto) {
                // console.log('automation completed');
                // console.log(idsIn[i]);
                //send the update to the device
                updateDeviceState(idsIn[i], currentAutomation.action);
            } else {
                autoToReRun.push(currentAutomation);
                deviceIds.push(idsIn[i]);
            }
        }

        // console.log("remaining autos: " + autoToReRun.length)
        // console.log("remaining autos: " + autoToReRun.length)

        if (autoToReRun.length > 0) {
            setTimeout(() => {
                runAutomations(autoToReRun, deviceIds);
                updateDevices();
            }, 10000);
        }
    }

    async function updateDeviceState(deviceId, newState) {
        //update the local device state first
        // console.log("devices:", deviceId);
        // console.log("new state:", newState);
        // return
        console.log("updating device state");
        // Use devicesRef instead of devices for immediate access
        var localDevices = [...devicesRef.current];
        console.log("local devices:", localDevices.length);

        for (var i = 0; i < localDevices.length; i++) {
            console.log("device id:", localDevices[i].device_id);
            if (localDevices[i].device_id == deviceId) {
                localDevices[i].state = newState;
                console.log("updating local device state");
            }
        }

        // Update both the ref and the state
        devicesRef.current = localDevices;
        setDevices(localDevices);
        filterDevices(deviceFilter, localDevices);

        // console.log("updating device state");
        // console.log("device id:", deviceId);
        // console.log("new state:", newState);

        const data = {
            id: deviceId,
            newState: newState,
        };
        const result = await fetch(urlStart + "api/updateDeviceState", {
            method: "POST",
            headers: {
                Authorization: "Bearer " + process.env.REACT_APP_AUTH_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            mode: "cors",
        });

        // console.log("response:", result);
    }

    function timeConvert(timeIn) {
        var currentHour = new Date().getHours();
        var currentMinute = new Date().getMinutes();

        var timeArray = timeIn.split(":");
        var timeHour = parseInt(timeArray[0]);
        var timeMinute = parseInt(timeArray[1]);

        if (currentHour == timeHour && currentMinute == timeMinute) {
            return true;
        } else {
            return false;
        }
    }
    async function getWeather() {
        try {
            const response = await fetch(urlStart + "api/getWeatherData", {
                method: "GET",
                headers: {
                    Authorization: "Bearer " + process.env.REACT_APP_AUTH_KEY,
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            var newTemp = parseFloat(data.data.values.temperature);
            return newTemp;
            //setCurrentWeather(getWeatherIcon(data.data.values.weatherCode));
        } catch (error) { }
    }

    useEffect(() => {
        getWeather();
    }, []);

    function conditionValid(current, condition, value) {
        switch (condition.toLowerCase()) {
            case "above":
                return current > value;
            case "below":
                return current < value;
            case "equal":
                return current == value;
        }
    }

    function filterDevices(deviceIn, deviceData) {
        if (deviceIn === "all") {
            setViewableDevices(deviceData ? deviceData : devices);
        } else if (deviceIn.includes("group-")) {
            const groupName = deviceIn.replace("group-", "");
            const group = deviceGroups.find((g) => g.groupName === groupName);
            if (group) {
                setViewableDevices(
                    devices.filter((d) => group.devices.includes(d.name))
                );
            }
        } else {
            setViewableDevices(
                devices.filter((device) => device.type.toLowerCase() === deviceIn)
            );
        }
        setDeviceFilter(deviceIn);
    }

  return (
    <div className="home-container">
      <Header />
      <div className="home-actions">
        {/* <Link to="/devices" className="btn">View Devices</Link> */}
        
      </div>

      <div className="home-main layout-grid">
        <aside className="device-section">
          <h2>Your Devices</h2>
          <div className="timeframe-selector">
          <Link to="/addDevice" className="btn primary">
          Add Device{" "}
        </Link>
            <label>View: </label>
            <select
              value={deviceFilter}
              onChange={(e) => filterDevices(e.target.value)}
            >
              <option value="all">All Devices</option>
              <option value="light">Lights</option>
              <option value="radiator">Radiators</option>
              <option value="blind">Blinds</option>
              <option value="plug">Plugs</option>
              {deviceGroups.length > 0 && (
                <>
                  {deviceGroups.map((group, index) => (
                    <option
                      key={`group-${index}`}
                      value={`group-${group.groupName}`}
                    >
                      Group: {group.groupName}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
          {/* {viewableDevices.length === 0 && (
            <LoadingSpinner colorIn={"green"} textIn={"Loading"} />
          )} */}
                    <div className="device-list">
                        {viewableDevices.map((device, index) => (
                            <DevicePreview key={index} deviceData={device} />
                        ))}
                    </div>
                </aside>

                <main className="energy-section centered">
                    <div className="energyMain">
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

                        <div className="device-selector">
                            <label>View device type: </label>
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

                        <div className="group-selector">
                            <label>View device group: </label>
                            <select
                                value={selectedDeviceGroup}
                                onChange={(e) => setSelectedDeviceGroup(e.target.value)}
                            >
                                <option value="all">All Groups</option>
                                {deviceGroups.map((group, index) => (
                                    <option key={index} value={group.groupName.toLowerCase()}>
                                        {group.groupName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="energy-grid">
                            <EnergyUse
                                timeFrame={timeFrame}
                                deviceType={selectedDeviceType}
                                deviceGroup={selectedDeviceGroup}
                                rawDataIn={devices}
                            />
                        </div>
                    </div>

                    <div className="extrasRow">
                        <WeatherModule />
                        <DarkModeModule />
                        <VoiceControl detailedCommands={furtherCommands} />
                        <UserMessage messageIn={userMessage} userId={localStorage.getItem("userId")} />
                    </div>
                    <div className="groups">
                        <h2>Manage Groups</h2>

                        <div className="group-form">
                            <input
                                className="group-form-text"
                                type="text"
                                value={newDeviceName}
                                onChange={(e) => setNewDeviceName(e.target.value)}
                                placeholder="Enter group name"
                            />
                            <button className=" btn primary" onClick={makeNewGroup}>
                                Create Group
                            </button>
                        </div>

                        <div className="group-list">
                            {deviceGroups.map((group, index) => (
                                <div key={index} className="group-item">
                                    <p>
                                        <p>Group Name:</p> {group.groupName}
                                    </p>

                                    <div className="group-controls">
                                        <button
                                            className=" btn primary"
                                            onClick={() => turnOnGroupDevices(group.groupName)}
                                        >
                                            Turn On
                                        </button>
                                        <button
                                            className=" btn primary"
                                            onClick={() => turnOffGroupDevices(group.groupName)}
                                        >
                                            Turn Off
                                        </button>
                                    </div>

                                    <p>
                                        <p>Devices:</p>{" "}
                                        <div className="group-devices-list">
                                            {group.devices.map((device, deviceIndex) => (
                                                <div key={deviceIndex} className="group-device-item">
                                                    <div>
                                                        {device}{" "}
                                                        <button
                                                            className="btn-remove"
                                                            onClick={() =>
                                                                removeDeviceFromGroup(group.groupName, device)
                                                            }
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </p>
                                    <div className="group-controls">
                                        <button
                                            className="btn-delete"
                                            onClick={() => deleteGroup(group.groupName)}
                                        >
                                            Delete Group
                                        </button>
                                    </div>
                                    <div className="timeframe-selector">
                                        <select
                                            value={selectedDevices[group.groupName] || ""}
                                            onChange={(e) =>
                                                setSelectedDevices({
                                                    ...selectedDevices,
                                                    [group.groupName]: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="" disabled>
                                                Select device to add
                                            </option>
                                            {devices.map((device, deviceIndex) => (
                                                <option key={deviceIndex} value={device.name}>
                                                    {device.name} ({device.type})
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            className="btn primary"
                                            onClick={() => {
                                                const selectedDeviceId =
                                                    selectedDevices[group.groupName];
                                                if (selectedDeviceId) {
                                                    addDeviceToGroup(group.groupName, selectedDeviceId);
                                                    // Reset selection after adding
                                                    setSelectedDevices({
                                                        ...selectedDevices,
                                                        [group.groupName]: "",
                                                    });
                                                }
                                            }}
                                        >
                                            {" "}
                                            Add device
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default HomePage;
