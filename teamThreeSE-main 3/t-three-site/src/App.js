import logo from './logo.svg';
import './App.css';
import DeviceList from './devices/DeviceList';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import DeviceDetails from './devices/DeviceDetails';
import AddDevice from './devices/AddDevice';
import LoginPage from './home/Login';
import HomePage from './home/UserHomePage';
import AdminHomePage from './Admin/AdminHome';
import AddUser from './Admin/AddUser';
import ManagerHome from './Manager/ManagerHome';
import ManagerResidentPage from './Manager/ManagerResidentPage';
import VoiceControl from './Generic/VoiceController';
import EditUser from './Admin/EditUser';




function App() {
  return (
    <Router>

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/devices" element={<DeviceList />} />
        <Route path="/addDevice" element={<AddDevice />} />
        <Route path="/devices/:deviceId" element={<DeviceDetails />} />

        <Route path="/AdminHome" element={<AdminHomePage />} />
        <Route path="/AddUser" element={<AddUser />} />

        <Route path="/ManagerHome" element={<ManagerHome />} />
        <Route path="/users/:userId" element={<ManagerResidentPage />} />

        <Route path="/editUser" element={<EditUser />} />

      </Routes>

      {/* {window.location.pathname !== '/' && <VoiceControl />} */}
    </Router>
  );
}

export default App;
