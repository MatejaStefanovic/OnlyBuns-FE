import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/userContext'; // Assuming userContext is where you get user data
import { useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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

const CurrentUserProfile = () => {
  const { user, token } = useUser();
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [activeSection, setActiveSection] = useState('profile');

  const [coordinates, setCoordinates] = useState({
    lat: user?.location?.lat || 51.505,
    lng: user?.location?.lng || -0.09,
  });

  const [userInfo, setUserInfo] = useState({
    username: user?.username || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    followerCount: user?.numberOfFollowing || 0,
  });

  const [hasChanges, setHasChanges] = useState(false); // To track changes
  const [isLocationChanged, setIsLocationChanged] = useState(false); // To track location change

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Password updated:', newPassword);
    setIsEditingPassword(false);
    setHasChanges(true);
  };

  const handleInputChange = (field, value) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleSaveChanges = () => {
    console.log('User info updated:', userInfo);
    setHasChanges(false);
  };

  const handleSaveLocation = () => {
    console.log('Location saved:', coordinates);
    setIsLocationChanged(false); // Reset location change state after saving
  };

  useEffect(() => {
    const initialUserInfo = {
      username: user?.username,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      followerCount: user?.numberOfFollowing,
    };

    const isUserInfoChanged =
      userInfo.username !== initialUserInfo.username ||
      userInfo.firstName !== initialUserInfo.firstName ||
      userInfo.lastName !== initialUserInfo.lastName;

    setHasChanges(isUserInfoChanged);
    fetchPosts();
  }, [userInfo, user]);
  const fetchLocation = async (lat, lng) => {
    const apiKey = 'f915ad90ad804f96aaea9b30c818d1ab';
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`
    );
    const data = await response.json();

    if (data.results.length > 0) {
      const components = data.results[0].components;
      const country = components.country;
      const city = components.city || components.town || components.village;
      const street = components.road || components.neighbourhood;


      setCoordinates({ lat, lng });
      setUserInfo((prev) => ({
        ...prev,
        location: { country, city, street },
      }));
      setIsLocationChanged(true); // Mark location as changed
    } else {
      setCoordinates({ lat, lng });
      setIsLocationChanged(true); // Mark location as changed
    }
  };

  const fetchPosts = async () => {
    if (!token || !user.email) {
      setError("Token not available");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8080/api/post/userPosts?email=${user.email}`, {
        method: 'GET', // Using GET method for fetching posts
        headers: {
          'Authorization': `Bearer ${token}`, // Include the Authorization header if needed
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user posts');
      }

      const data = await response.json();
      console.log(data);
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  function LocationMarker() {
    useMapEvents({
      click(e) {
        fetchLocation(e.latlng.lat, e.latlng.lng);
      },
    });

    return coordinates === null ? null : (
      <Marker position={[coordinates.lat, coordinates.lng]}></Marker>
    );
  }
  if (!user) return <p>Loading user data...</p>;

  return (
    <div className="user-profile">
      <div className="profile-header">
        <h1>{user.firstName} {user.lastName}</h1>
        <p>Email: {user.email}</p>
        <button className="home-button" style={{ marginRight: 22.2 + "rem" }} onClick={() => setActiveSection("profile")}>Profile information</button>
        <button className="home-button" style={{ marginRight: 9.8 + "rem" }} onClick={() => setActiveSection("following")}>Followers and Following</button>
        <button className="home-button" onClick={() => setActiveSection("posts")}>Posts</button>
        <button className="home-button" onClick={handleHomeClick}>Home</button>
      </div>


      {/* Profile Section */}
      {activeSection === "profile" && (
        <div className="profile-section">
          <h2>Profile Information</h2>

          {/* Username */}
          <div className="profile-info-row">
            <label><b>Username:</b></label>
            <input
              type="text"
              value={userInfo.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
            />
          </div>

          {/* First Name */}
          <div className="profile-info-row">
            <label><b>First Name:</b></label>
            <input
              type="text"
              value={userInfo.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
            />
          </div>

          {/* Last Name */}
          <div className="profile-info-row">
            <label><b>Last Name:</b></label>
            <input
              type="text"
              value={userInfo.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="profile-info-row">
            <label><b>Email:</b></label>
            <p>{userInfo.email}</p>
          </div>

          {/* Follower Count */}
          <div className="profile-info-row">
            <label><b>Number of followers:</b></label>
            <p>{userInfo.followerCount}</p>
          </div>

          {/* Save Changes Button */}
          {hasChanges && (
            <button className="save-changes-btn" onClick={handleSaveChanges}>
              Save Changes
            </button>
          )}

          {/* Change Password */}
          <h2>Change Password</h2>
          {!isEditingPassword ? (
            <button onClick={() => setIsEditingPassword(true)}>Change Password</button>
          ) : (
            <>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button onClick={handlePasswordChange}>Save Password</button>
              <button onClick={() => setIsEditingPassword(false)}>Cancel</button>
            </>
          )}

          {/* Update Location */}
          <h2>Update Location</h2>
          <div>
            <MapContainer
              center={[coordinates.lat, coordinates.lng]}
              zoom={13}
              style={{ height: "300px", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker />
            </MapContainer>
          </div>
          {isLocationChanged && (
            <button onClick={handleSaveLocation}>Save Location</button>
          )}
        </div>
      )}

      {/* Posts Section */}
      {activeSection === "posts" && (
        <div className="profile-section">
          <h2>User Posts</h2>
          <p>Posts will be displayed here...</p>
        </div>
      )}

      {/* Followers Section */}
      {activeSection === "following" && (
        <div className="profile-section">
          <h2>Followers and Following</h2>
          <p>Followers and Following will be displayed here...</p>
        </div>
      )}
    </div>
  );
};

export default CurrentUserProfile;
