import React, { useState, useEffect} from 'react';

import './WeatherModule.css';

import { MdDarkMode } from "react-icons/md";
import { dark } from '@mui/material/styles/createPalette';


function DarkModeModule(){

    const [darkMode, setDarkMode] = useState(false);

    function toggleDarkMode(){
        setDarkMode(!darkMode);
        if (!darkMode) {
            document.documentElement.classList.add('theme-dark');
          } else {
            document.documentElement.classList.remove('theme-dark');
          }
    }
    

  return (
    <div className='moduleBase' onClick={() => toggleDarkMode()}>
        {darkMode && (
            <div className='darkModeBase'>
                    <p> Dark Mode</p>
                    <MdDarkMode/>
                    </div>
        )}
        {!darkMode && (
            <div className='darkModeBase'>
                    <p> Light Mode</p>
                    <MdDarkMode/>
                    </div>
        )}
    </div>
  );
}

export default DarkModeModule;