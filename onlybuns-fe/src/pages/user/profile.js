import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/userContext'; // Assuming a user context is available
import '@fortawesome/fontawesome-free/css/all.min.css';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './profile.css';

// Update marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const ProfilePage = () => {
  const { username } = useParams(); // Extract username from the route
  const { user: contextUser } = useUser(); // Get user from context if available
  const navigate = useNavigate();

  const [user, setUser] = useState(contextUser || null); // State for user data
  const [loading, setLoading] = useState(!contextUser); // Skip loading if user is available in context
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
      // Fetch user data dynamically if not in context
      const fetchUserData = async () => {
        try {
          setLoading(true);
          const response = await fetch(
            `http://localhost:8080/api/users/findUser?username=${username}` // Replace with your API endpoint
          );
          if (!response.ok) throw new Error('User not found');
          const data = await response.json();
          if(data.email === contextUser.email)
            navigate("/myProfile");
          setUser(data); // Set fetched user data
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    
  }, [contextUser, username]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const userData = user || contextUser; // Use fetched user or context user

  return (
    <div className="user-profile">
      <div className="profile-header">
        <h1>{userData.firstName} {userData.lastName}</h1>
        <p>Email: {userData.email}</p>
        <button className="home-button" style={{marginRight: 9.8 + "rem"}} onClick={() => navigate('/')}>Followers and Following</button>
        <button className="home-button" onClick={() => navigate('/')}>Posts</button>
        <button className="home-button" onClick={() => navigate('/')}>Home</button>
      </div>

      <div className="profile-section">
        <h2>Profile Information</h2>
        <div className="profile-info-row">
          <label><b>Username:</b></label>
          <p>{userData.username}</p>
        </div>
        <div className="profile-info-row">
          <label><b>First Name:</b></label>
          <p>{userData.firstName}</p>
        </div>
        <div className="profile-info-row">
          <label><b>Last Name:</b></label>
          <p>{userData.lastName}</p>
        </div>
        <div className="profile-info-row">
          <label><b>Email:</b></label>
          <p>{userData.email}</p>
        </div>
        <div className="profile-info-row">
          <label><b>Number of followers:</b></label>
          <p>{userData.numberOfFollowing}</p>
        </div>
      </div>

      <div className="profile-section">
        <h2>Location</h2>
        <div>
          <MapContainer
            center={[userData.location?.lat || 51.505, userData.location?.lng || -0.09]}
            zoom={13}
            style={{ height: '300px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[userData.location?.lat || 51.505, userData.location?.lng || -0.09]} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
