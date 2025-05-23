

import "./header.css";
import { FaHome } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';






function Header(){
  const navigate = useNavigate();


    function navigateToHome(){
      switch(localStorage.getItem('userType')){
        case 'admin':
          navigate('/AdminHome');
          break;
        case 'manager':
          navigate('/ManagerHome');
          break;
        default:
          navigate('/home');
          break;
      }
    }

    function logOut(){
      localStorage.removeItem('username');
      localStorage.removeItem('userId');
      navigate('/');
    }

    const username = localStorage.getItem('username');
    return(
        <header className="home-header">
            <div className="header-left">
          <h1>Welcome back, {username}!</h1>
          </div>
          {/* <p>Manage your smart home efficiently.</p> */}

        <div className="header-right">
        <button className="homeButton" onClick={navigateToHome}>
            <FaHome /> Home
          </button>
          <button className="logoutButton" onClick={logOut}>
            <IoLogOut /> Logout
          </button>
        </div>
      </header>
    )
}


export default Header;