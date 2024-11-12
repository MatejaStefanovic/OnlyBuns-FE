import React from 'react';
import './sidebar.css';
import { Link } from "react-router-dom";
import { useUser } from '../../context/userContext'; // Import your context to check user state

const SideBar = () => {
  const { user } = useUser(); // Get the user state from context
  return (
    <div className="sidebar">
      <h1 className="logo">ONLYBUNS</h1>
      <div className="menu">
        <div><Link className="menu-item" to="/">HOME</Link></div>
        <div className="menu-item">EXPLORE</div>
        <div className="menu-item">NOTIFICATIONS</div>
        <div className="menu-item">SETTINGS</div>
        {user && (
          <React.Fragment>
            <div className="menu-item"><Link className="menu-item" to="/nearMe">BUNNIES NEAR ME</Link></div>
            <div className="menu-item"><Link className="menu-item" to="/inbox">INBOX</Link></div>
            <div className="menu-item"><Link className="menu-item" to="/analitics">ANALITICS</Link></div>
            
            {user.role === "ADMIN" && (
              <div className="menu-item"><Link className="menu-item" to="/admin">USERS</Link></div>
            )}
          </React.Fragment>
        )}

      </div>
    </div>
  );
};

export default SideBar;
