import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import NavBar from "./components/NavBar"
import Home from "./pages/Home"
import Footer from './components/Footer'
import Login from "./pages/Login";
import { Toaster } from 'react-hot-toast';
import AddData from "./pages/AddData";
import Notifications from "./pages/Notifications";
import ViewData from "./pages/ViewData";
import AddNode from "./pages/AddNode";
import AuthOutlet from '@auth-kit/react-router/AuthOutlet'
import axios from "axios";
import { useEffect, useState } from "react";
import { backendUrl } from "./Constants/Constants";
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated'
import ViewNode from "./pages/ViewNode";
function App() {
  const [nodeDetails, setNodeDetails] = useState({ PortNumber: 0, nodeUrl: '', PublicKey: '' });
  useEffect(() => {
    axios.get(`${backendUrl}/api/v1/nodes/`).then((response) => {
      setNodeDetails(response.data);
    }).catch((error) => {
      console.error(error);
    });
  }, []);
  const isAuthenticated = useIsAuthenticated()
  return (
    <>
      <Router>
        <NavBar portNumber={nodeDetails.PortNumber} nodeUrl={nodeDetails.nodeUrl} PublicKey={nodeDetails.PublicKey} />
        <Toaster />
        <Routes>
          <Route index element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/view-node' element={<ViewNode />} />

          <Route element={<AuthOutlet fallbackPath='/login'  />}>
            <Route path="/" element={<Home />} />
            <Route path="/add-data" element={<AddData />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/view-data" element={<ViewData />} />
            <Route path="/addnode" element={<AddNode />} />
          </Route >
        </Routes>
        <Footer />
      </Router>
    </>
  );
}

export default App;