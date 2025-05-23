import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '@mui/material/Icon';
import Slider from '@mui/material/Slider';
import urlStart from '../Global';
import LightModeIcon from '@mui/icons-material/LightMode';
import Switch from "react-switch";
import DoneIcon from '@mui/icons-material/Done';
import Header from '../header/header';

import LoadingSpinner from '../Generic/LoadingSpinner';

import './DeviceDetails.css';
function DeviceDetails() {

  const location = useLocation();
  const { device } = location.state;

  const originalTempState = parseInt(device.state);
  const [deviceState, setDeviceState] = useState(device.state);
  const [lightOn, setLightOn] = useState(device.state.toLowerCase() == 'on' ? true : false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actuallyDeleting, setActuallyDeleting] = useState(false);
  const [deviceType, setDeviceType] = useState(device.type.toLowerCase());
  const [currentAutomations, setCurrentAutomations] = useState(JSON.parse(device.data).automations);
  const [creatingAutomation, setCreatingAutomation] = useState(false);

  const [automationTriggerType, setAutomationTriggerType] = useState('Temperature');
  const [automationTriggerCondition, setAutomationTriggerCondition] = useState('Above');
  const [automationTriggerValue, setAutomationTriggerValue] = useState('');
  const [automationAction, setAutomationAction] = useState(deviceType === 'radiator' ? '' : 'On');
  

  const isManager = localStorage.getItem('userType') === 'manager' ? true : false;

    //does the actual network request to update the device state
    async function updateDeviceState(updatedState) {


      // if(isManager){
      //   return
      // }

      console.log('updating device state to ' + updatedState);
      const data = {
        id: device.device_id,
        newState: updatedState
      };
      const result = await fetch(urlStart + 'api/updateDeviceState', {
        method: 'POST',
        headers: {
          "Authorization": "Bearer " + process.env.REACT_APP_AUTH_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        mode: 'cors'
      });
      console.log('response:', result);
    }

  //sets the color of the temperature slider
  function getTempColor(temp){
    if(temp < 10){
      return '#25c1f5';
    }
    else if(temp <20){
      return '#f5b840';
    }

    else{
      return '#fa4932';
    }


  }
    
  function temperatureUpdated(temp){

    //we need to convert the temp to a string
    setDeviceState(temp.target.value + "");
    updateDeviceState(temp.target.value + "");
  }


  function triggerStartSelected(triggerStart){
    console.log('trigger start selected' + triggerStart);

  }


  async function uploadAutomation(automationObject) {
    console.log('updating device automation to ' + automationObject);
    const data = {
      deviceId: device.device_id,
      automation: automationObject
    };
    const result = await fetch(urlStart + 'api/addDeviceAutomation', {
      method: 'POST',
      headers: {
        "Authorization": "Bearer " + process.env.REACT_APP_AUTH_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      mode: 'cors'
    });
    console.log('response:', result);
    if(result.ok){
      setCreatingAutomation(false);
    }
  }

  async function uploadDeleteAutomation(indexIn) {
    console.log('deleteAutomation device automation to ' + indexIn);
    const data = {
      deviceId: device.device_id,
      indexToDelete: indexIn
    };
    const result = await fetch(urlStart + 'api/deleteDeviceAutomation', {
      method: 'POST',
      headers: {
        "Authorization": "Bearer " + process.env.REACT_APP_AUTH_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      mode: 'cors'
    });
    console.log('response:', result);
  }


  function deletePressed(){
    setIsDeleting(true);
  }

  function deleteAutomation(indexIn){
    console.log(currentAutomations[indexIn]);
    var newAutomations = [...currentAutomations];
    newAutomations.splice(indexIn, 1);
    setCurrentAutomations(newAutomations);
    uploadDeleteAutomation(indexIn);


  }

  function updateType(type){
    setAutomationTriggerType(type);
    setAutomationTriggerValue('');
  }

  function createAutomation(){
    console.log('creating automation');


    console.log('automationTriggerType:', automationTriggerType);
    console.log('automationTriggerCondition:', automationTriggerCondition);
    console.log('automationTriggerValue:', automationTriggerValue);
    console.log('automationAction:', automationAction);


    if(automationTriggerType != 'Temperature' && automationTriggerType != 'Time of Day'){
      setAutomationTriggerCondition('');
    }
    else if(automationTriggerType == 'Temperature' || automationTriggerType == 'Time of Day'){
      if(automationTriggerValue == ''){
        console.log('missing fields');
        return;
      }
    }

    if(automationTriggerType == '' || automationTriggerCondition == '' || automationAction == ''){
      console.log('missing fields');
      return;
    }

    var automation = {
      triggerType: automationTriggerType,
      triggerCondition: automationTriggerCondition,
      triggerValue: automationTriggerValue,
      action: automationAction
      
    }
    setCreatingAutomation(true);
    console.log('automation:', automation);
    uploadAutomation(automation);
    setCurrentAutomations([...currentAutomations, automation]);
  }



    function handleLightToggle(newState){
      if(isManager){
        return
      }
      console.log('new state:', newState);
        setLightOn(newState);
        var newDeviceState = newState === true ? 'on' : 'off';
        setDeviceState(newDeviceState);
        updateDeviceState(newDeviceState);
      }

      async function deleteDevice(){
        setActuallyDeleting(true);
        console.log('deleting device');
        try {
          const response = await fetch(urlStart + 'api/deleteDevice',{
            method: 'POST',
            headers: {
              "Authorization": "Bearer " + process.env.REACT_APP_AUTH_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ deviceId: device.device_id }),
          }
          );
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          console.log('data:', data);
          window.location.href = '/home';

        } catch (error) {
          console.error('Failed to fetch devices:', error);
        }
      }


  return (
    <div>
            <Header />
    <div className="deviceDetailsBase">
      <div className="deviceDetailsContainer">
      <h2>Device Details for {device.name}</h2>
      <p>ID: {device.device_id}</p>

      <div className="deviceDetailSpecifics">
          {device.type.toLowerCase() == 'light' && (
            <Switch checked = {lightOn} onChange={handleLightToggle} onColor='#f7e048' checkedIcon={<LightModeIcon />}/>
          )}
          {device.type.toLowerCase() == 'radiator' && (
            
          <Slider
          aria-label="Temperature"
          defaultValue={originalTempState}
          step={2}
          valueLabelDisplay="auto"
          // disabled={isManager}
          onChange={temperatureUpdated}
          min={0}
          max={30}
          marks={[{value: 0, label: "0 °C"}, {value: 30, label: "30 °C"}]}
          sx={{color: getTempColor(deviceState), width: '80%'}}
          />
          )}

    {(device.type.toLowerCase() == 'blind' || device.type.toLowerCase() == 'plug') && (

                <Switch checked = {lightOn} onChange={handleLightToggle} onColor='#03fc39' checkedIcon={<DoneIcon />}/>

              )}
        </div>

        {!isDeleting && (
        <button className='deleteButton' onClick={() => deletePressed()}>Delete Device</button>
      )}

        {isDeleting && (
          <div className='confirmDelete'>
            <p>Are you sure you want to delete this device?</p>
            <button onClick={() => deleteDevice()}>Yes</button>
            <button onClick={() => setIsDeleting(false)}>No</button>
          </div>
        )}

        {actuallyDeleting && (

            <LoadingSpinner colorIn={'red'} textIn={'Deleting'}/>
        )}

        <div>
          <h2> Manage Automations</h2>
          {currentAutomations.length > 0 ? (
            currentAutomations.map((automation, index) => (
              <div key={index} className="automationItem">
                <p> If {automation.triggerType} is {automation.triggerCondition} {automation.triggerValue} then {automation.action}</p>
                <button onClick={() => deleteAutomation(index)}> Delete</button>
              </div>
            ))
          ) : (
            <p>No automations found</p>
          )}

        </div>
      </div>





        <div className='automationList'>

          {creatingAutomation && (
            <LoadingSpinner colorIn={'green'} textIn={'Creating Automation'}/>
          )}

          {!creatingAutomation && ( <div>
          <h2> Create Automation</h2>
          
          <p> If</p>
        <div className='automationType'>
          <select
              value={automationTriggerType}
              onChange={(e) => updateType(e.target.value)}
            >
              <option value="Temperature"> Outside Temperature</option>
              <option value="Time">Time of Day</option>
              <option value="Day">Day of week</option>
              {/* <option value="Weather">Weather</option> */}
            </select>
          </div>

            <p> is</p>
          {automationTriggerType == 'Temperature' && (
            <div>
              <select onChange={(e) => setAutomationTriggerCondition(e.target.value)}>
                <option> Above</option>
                <option> Below</option>
                <option> Equal to</option>
              </select>
              <input type="number" onChange={(e) => setAutomationTriggerValue(e.target.value)}/> celcius
            </div>
          )}

          {automationTriggerType == 'Time' && (
            <div>
              <select onChange={(e) => setAutomationTriggerCondition(e.target.value)}>
                <option> </option>
                <option> Equal</option>
              </select>
              <input type="time" onChange={(e) => setAutomationTriggerValue(e.target.value)}/>
            </div>
          )}

          {automationTriggerType == 'Day' && (
            <div>
              <select onChange={(e) => setAutomationTriggerValue(e.target.value)}>
                <option> Monday</option>
                <option> Tuesday</option>
                <option> Wednesday</option>
                <option> Thursday</option>
                <option> Friday</option>
                <option> Saturday</option>
                <option> Sunday</option>
              </select>
            </div>
          )}

          {automationTriggerType == 'Weather' && (
            <div>
              <select onChange={(e) => setAutomationTriggerValue(e.target.value)}>
                <option> Rainy</option>
                <option> Sunny</option>
                <option> Snowy</option>
                <option> Cloudy</option>
                <option> Windy</option>
              </select>
            </div>
          )}

          <p> Then</p>
          {deviceType == 'light' && (
            <div>
              <p> Turn</p>
              <select onChange={(e) => setAutomationAction(e.target.value)}>
                <option> On</option>
                <option> Off</option>
              </select>
            </div>
  
          )}

          {deviceType == 'radiator' && (  
            <div>
              <p> Set</p>
              <input type="number" onChange={(e) => setAutomationAction(e.target.value)}/> celcius
            </div>
          )}

          <button className='automationButton' onClick={createAutomation}> Create Automation</button>

            </div>
          )}

        </div>

        </div>
    </div>

  );
}

export default DeviceDetails;