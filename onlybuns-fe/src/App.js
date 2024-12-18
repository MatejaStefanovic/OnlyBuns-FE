import './App.css';
import HomePage from './pages/home/home'
import ProfilePage from './pages/user/profile';
import InboxPage from './pages/inbox/inbox';
import AnalyticsPage from './pages/analytics/analytics';
import NearMePage from './pages/posts/postsNearMe';
import Login from './pages/auth/login/login'
import SignUp from './pages/auth/registration/signup'
import Layout from './components/layout/layout';
import CreatePost from './pages/posts/create-post';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminList from './pages/adminlist/AdminList';
import TestComponent from './pages/test';
import PostsView from './pages/postsView/posts-view'
import EditPost from './pages/editPosts/editPosts';
function App() {

  return (
    <BrowserRouter>
       <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="nearMe" element={<NearMePage />} />
          <Route path="admin" element={<AdminList />} />
          <Route path="post" element={<CreatePost />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="explore" element={<PostsView />} />
          <Route path="edit" element={<EditPost />} />
        </Route>
    </Routes>
    </BrowserRouter>


  );
}

export default App;
