import React from 'react';
import NavBar from '../components/navbar';
import './home.css';
import SideBar from '../components/sidebar';
import CreatePost from '../components/create-post';
import './create-post.css';

const CreatePostPage = () => {
  return (
 
    
    <div className="page-layout">
    <SideBar />
    <div className="main-content">
      <NavBar />
      <div className="content-wrapper">
        <CreatePost />
      </div>
    </div>
  </div>
      
    
  );
};

export default CreatePostPage;
