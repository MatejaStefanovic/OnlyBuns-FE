import './App.css';
import HomePage from './pages/home'
import ProfilePage from './pages/profile';
import InboxPage from './pages/inbox';
import AnaliticsPage from './pages/analitics';
import NearMePage from './pages/postsNearMe';
import Layout from './components/layout';
import CreatePost from './pages/create-post';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminList from './pages/adminList';
import TestComponent from './pages/test';
function App() {
  
  return (
  
  
    <BrowserRouter>
          <Route path="admin" element={<AdminList />} />
             <Route path="createPost" element={<CreatePost />} />
   
      <Routes>
        {/* Wrap routes within Layout */}
        <Route path="/" element={<Layout />}>
          {/* Nested routes within the layout */}
          <Route index element={<TestComponent />} /> {/* Default route */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="analitics" element={<AnaliticsPage />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="nearMe" element={<NearMePage />} />
          <Route path="admin" element={<AdminList />} />
             <Route path="createPost" element={<CreatePost />} />
        </Route>
      </Routes>
   
  </BrowserRouter>
  
  
  );
}

export default App;
