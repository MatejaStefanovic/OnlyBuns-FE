import React from 'react';
import NavBar from '../components/Navbar';
import './home.css';
import SideBar from '../components/sidebar';

const HomePage = () => {
  return (
  <div className="container">
     
    <SideBar />
    <NavBar />
    </div>
  );
};

export default HomePage;
