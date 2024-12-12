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
  const { user } = useUser();
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const [coordinates, setCoordinates] = useState({
    lat: user?.location?.lat || 51.505,
    lng: user?.location?.lng || -0.09,
  });

  const [userInfo, setUserInfo] = useState({
    username: user?.username || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
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
    };

    const isUserInfoChanged =
      userInfo.username !== initialUserInfo.username ||
      userInfo.firstName !== initialUserInfo.firstName ||
      userInfo.lastName !== initialUserInfo.lastName ||
      userInfo.email !== initialUserInfo.email;

    setHasChanges(isUserInfoChanged);
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
        <button className="home-button" onClick={handleHomeClick}>Home</button>
      </div>

      <div className="profile-section">
        <h2>Profile Information</h2>
        
        {/* Username */}
        <div className="profile-info-row">
          <p><b>Username: </b></p>
          <p>{userInfo.username}</p>
        </div>

        {/* First Name */}
        <div className="profile-info-row">
          <p><b>First Name: </b></p>
          <p>{userInfo.firstName}</p>
        </div>

        {/* Last Name */}
        <div className="profile-info-row">
          <p><b>Last Name: </b></p>
          <p>{userInfo.lastName}</p>
        </div>

        {/* Email */}
        <div className="profile-info-row">
          <p><b>Email: </b></p>
          <p>{userInfo.email}</p>
        </div>
        {hasChanges && (
          <button className="save-changes-btn" onClick={handleSaveChanges}>Save Changes</button>
        )}
      </div>

      <div className="profile-section">
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
      </div>

      <div className="profile-section">
        <h2>Update Location</h2>
        <div>
          <MapContainer
            center={[coordinates.lat, coordinates.lng]}
            zoom={13}
            style={{ height: '300px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker />
          </MapContainer>
        </div>
        {/* Show Save Location button only if location was changed */}
        {isLocationChanged && (
          <button onClick={handleSaveLocation}>Save Location</button>
        )}
      </div>
    </div>
  );
};

export default CurrentUserProfile;
