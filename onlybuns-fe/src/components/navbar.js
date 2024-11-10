import React from 'react';
import './navbar.css'
import { Link } from "react-router-dom";


const NavBar = () => {
  return (
  
    <div className="main-content">
    <div className="header">
      <div className="nav-menu">
        <div className="nav-item"> <Link className="nav-item" to="/profile">PROFILE</Link></div>
        <div className="nav-item">LOG IN</div>
      </div>
    </div>
  </div>
       
      
  );
};

export default NavBar;
