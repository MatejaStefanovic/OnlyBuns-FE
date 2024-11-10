import './App.css';
import HomePage from './pages/home'
import ProfilePage from './pages/profile';
import InboxPage from './pages/inbox';
import AnaliticsPage from './pages/analitics';
import NearMePage from './pages/postsNearMe';
import CreatePost from './pages/create-post';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  
  return (
  
  
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />}>
      </Route>
      <Route path="profile" element={<ProfilePage />} />
      <Route path="analitics" element={<AnaliticsPage />} />
      <Route path="inbox" element={<InboxPage />} />
      <Route path="nearMe" element={<NearMePage />} />
      <Route path="createPost" element={<CreatePost />} />
    </Routes>
  </BrowserRouter>
  
  
  );
}

export default App;
