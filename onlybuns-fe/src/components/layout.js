
import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './navbar';
import SideBar from './sidebar';
import AdminList from '../pages/adminList';
import  './layout.css'
import TestComponent from '../pages/test';


const Layout = () => {
  return (
    <div className="layout-container">
      <NavBar className="navbar" />
      <div className="content-area">
        <SideBar  className="sidebar"  />
            <Outlet/>
      </div>
    </div>
  );
};

export default Layout;
