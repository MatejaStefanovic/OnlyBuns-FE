import React from 'react';
import '../home/home.css';
import CreatePost from '../../components/posts/create-post';
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
