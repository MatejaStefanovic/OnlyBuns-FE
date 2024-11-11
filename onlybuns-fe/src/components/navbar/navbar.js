import React from 'react';
import './navbar.css';
import { Link } from "react-router-dom";
import { useUser } from '../../context/userContext';

const NavBar = () => {
  const { user, logout } = useUser(); // Get the user and logout function from context
  
  return (
    <div className="main-content">
      <div className="header">
        <div className="nav-menu">  
          {user ? (
            <React.Fragment>
              <div className="nav-item"><Link className="nav-item" to="/profile">PROFILE</Link></div>
              <div className="nav-item" onClick={logout}><Link className="nav-item">LOG OUT</Link></div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div className="nav-item"><Link className="nav-item" to="/login">LOG IN</Link></div>
              <div className="nav-item"><Link className="nav-item" to="/signup">SIGN UP</Link></div>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;
