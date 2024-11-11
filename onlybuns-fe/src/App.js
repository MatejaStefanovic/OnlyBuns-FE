import './App.css';
import HomePage from './pages/home/home'
import ProfilePage from './pages/user/profile';
import InboxPage from './pages/inbox/inbox';
import AnaliticsPage from './pages/analytics/analitics';
import NearMePage from './pages/postsNearMe';
import Login from './pages/auth/login/login'
import SignUp from './pages/auth/registration/signup'
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
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<SignUp />} />
    </Routes>
  </BrowserRouter>
  
  
  );
}

export default App;
