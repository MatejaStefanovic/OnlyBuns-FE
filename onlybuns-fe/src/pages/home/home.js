import React from 'react';

import NavBar from '../../components/navbar/navbar';
import './home.css';
import SideBar from '../../components/sidebar/sidebar'

const HomePage = () => {
  return (

    <div className="container">
      <NavBar />
      <SideBar />
 
    </div>
  );
};

export default HomePage;
