import React from 'react';
import './home.css';
import CreatePost from '../components/create-post';
import './create-post.css';

const CreatePostPage = () => {
  return (
 
    
    <div className="page-layout">
    <div className="main-content">
      <div className="content-wrapper">
        <CreatePost />
      </div>
    </div>
  </div>
      
    
  );
};

export default CreatePostPage;
