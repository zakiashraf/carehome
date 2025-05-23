import React, { useEffect, useState } from 'react';
import urlStart from '../Global';
import './DevicePreview.css';
import Switch from "react-switch";
import LightModeIcon from '@mui/icons-material/LightMode';
import DoneIcon from '@mui/icons-material/Done';
import Icon from '@mui/material/Icon';
import Slider from '@mui/material/Slider';
import { useNavigate } from 'react-router-dom';
import { LuHeater, LuLampCeiling} from "react-icons/lu";
import { MdBlinds } from "react-icons/md";
import { BsPlugFill } from "react-icons/bs";


function DevicePreview({deviceData, isManager, onStateChange}) {
  const navigate = useNavigate();
  //first lets get the device data
  var device = deviceData;
  const originalTempState = parseInt(device.state);

  const [deviceState, setDeviceState] = useState(device.state);
  const [lightOn, setLightOn] = useState(device.state.toLowerCase() == 'on' ? true : false);

  const handleStateChange = (newState) => {
    updateDeviceState(newState);
    setDeviceState(newState);
  }

  function moveToDetails(){
    console.log(device.device_id)
    navigate(`/devices/${device.device_id}`, { state: { device }});
  }


    //does the actual network request to update the device state
    async function updateDeviceState(updatedState) {
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

      // Update when props change
  useEffect(() => {
    setDeviceState(device.state);
    setLightOn(device.state.toLowerCase() == 'on' ? true : false);
  }, [device.state]);

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
    setDeviceState(temp.target.value);
    updateDeviceState(temp.target.value + "");
  }


    function handleLightToggle(newState){
      // if(isManager){
      //   return
      // }
      console.log('new state:', newState);
        setLightOn(newState);
        var newDeviceState = newState === true ? 'on' : 'off';
        setDeviceState(newDeviceState);
        updateDeviceState(newDeviceState);
      }

    return (
        <div className="devicePreviewBase" onClick={() => moveToDetails()}>
      <div className="deviceHeader">
      <p className="deviceName">{device.name}</p>
      <div className="deviceIcon">
        {device.type.toLowerCase() === 'light' &&(
          <LuLampCeiling/>
        )}
        {device.type.toLowerCase() === 'radiator' &&(
          <LuHeater />
        )}
        {device.type.toLowerCase() === 'blind' &&(
          <MdBlinds />
        )}
        {device.type.toLowerCase() === 'plug' &&(
          <BsPlugFill />
        )}
        </div>

      </div>
          <div className="deviceSpecifics">

          {device.type.toLowerCase() == 'light' && (
            <div onClick={(e) => e.stopPropagation()}>
            <Switch checked = {lightOn} onChange={handleLightToggle} onColor='#f7e048' checkedIcon={<LightModeIcon />}/>

            </div> 

          )}

          {(device.type.toLowerCase() == 'blind' || device.type.toLowerCase() == 'plug') && (
            <div onClick={(e) => e.stopPropagation()}>
            <Switch checked = {lightOn} onChange={handleLightToggle} onColor='#03fc39' checkedIcon={<DoneIcon />}/>

            </div> 

          )}


          {device.type.toLowerCase() == 'radiator' && (
            <div onClick={(e) => e.stopPropagation()} style={{width: '100%', paddingLeft: '15%'}}>
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
          value={parseInt(deviceState)}
          />
          </div>
          )}
        </div>
        </div>  
      );
    }

export default DevicePreview;