import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/userContext'; 
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
  const { user, token, setUser } = useUser();
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const [activeSection, setActiveSection] = useState('profile');

  const [coordinates, setCoordinates] = useState({
    lat: 51.505,
    lng: -0.09,
  });
  
  const [userInfo, setUserInfo] = useState({
    username: user ?.username || '',
    firstName: user ?.firstName || '',
    lastName: user ?.lastName || '',
    email: user ?.email || '',
    followerCount: user ?.numberOfFollowing || 0,
  });

  const [hasChanges, setHasChanges] = useState(false); // To track changes
  const [isLocationChanged, setIsLocationChanged] = useState(false); // To track location change

const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    if (newPassword.length < 8) {
        alert('Password length must be greater than 8!');
        return;
    }

    try {
        const passwordUpdateData = {
            ...userInfo,
            password: newPassword
        };
        
        const response = await fetch(`http://localhost:8080/api/users/update/${userInfo.email}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(passwordUpdateData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update password');
        }
        
        // No need to update user context for password change
        // as password isn't stored in the user object
        
        console.log('Password updated successfully');
        setIsEditingPassword(false);
        setNewPassword('');
        setConfirmPassword('');
        setHasChanges(false);
        
    } catch (error) {
        console.error('Error updating password:', error);
        alert('Failed to update password. Please try again.');
    }
};

  const handleInputChange = (field, value) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleHomeClick = () => {
    navigate('/home');
  };

const handleSaveChanges = async () => {
    try {
        const response = await fetch(`http://localhost:8080/api/users/update/${userInfo.email}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userInfo)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update user');
        }
        
        const updatedUser = {
            ...user,
            username: userInfo.username,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
        };
        
        setUser(updatedUser);
        
        console.log('User info updated successfully');
        setHasChanges(false);
    } catch (error) {
        console.error('Error updating user:', error);
    }
};

const handleSaveLocation = async () => {
    try {
        if (!userInfo.location) {
            alert('Please select a location on the map first.');
            return;
        }
        
        const response = await fetch(`http://localhost:8080/api/users/update/${userInfo.email}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userInfo)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update location');
        }
        
        setUser(prevUser => ({
            ...prevUser,
            location: userInfo.location
        }));
        
        setIsLocationChanged(false);
        
    } catch (error) {
        console.error('Error updating location:', error);
        alert('Failed to update location. Please try again.');
    }
};

const getCoordinatesFromAddress = async (location) => {
    if (!location || !location.city || !location.country) {
      return null;
    }

    const apiKey = 'c9514f3f109d49aaaf3d7dc0a79ed9f3';
    const address = `${location.street || ''} ${location.city} ${location.country}`.trim();
    
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry;
        return { lat, lng };
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    }
    
    return null;
  };

  useEffect(() => {
    const initialUserInfo = {
      username: user ?.username,
      firstName: user ?.firstName,
      lastName: user ?.lastName,
      email: user ?.email,
      followerCount: user ?.numberOfFollowing,
    };
    
    const isUserInfoChanged =
      userInfo.username !== initialUserInfo.username ||
      userInfo.firstName !== initialUserInfo.firstName ||
      userInfo.lastName !== initialUserInfo.lastName;

    setHasChanges(isUserInfoChanged);
    fetchPosts();
  }, [userInfo, user]);

useEffect(() => {
  if (user.location && user.location.city && user.location.country) {
    getCoordinatesFromAddress(user.location).then(coords => {
      if (coords) {
        setCoordinates(coords);
      }
    });
  }
}, [user]);


const fetchFollowers = async () => {
  try {
    const response = await fetch(`http://localhost:8080/api/users/followers?username=${userInfo.username}`);
    const data = await response.json();
    setFollowers(data);
  } catch (error) {
    console.error('Error fetching followers:', error);
  }
};

const fetchFollowing = async () => {
  try {
    const response = await fetch(`http://localhost:8080/api/users/following?username=${userInfo.username}`);
    const data = await response.json();
    setFollowing(data);
    console.log("hello");
    console.log(userInfo.username);
  } catch (error) {
    console.error('Error fetching following:', error);
  }
};


useEffect(() => {
  if (activeSection === "following") {
    fetchFollowers();
    fetchFollowing();
  }
}, [activeSection, userInfo]);

const fetchLocation = async (lat, lng) => {
    const apiKey = 'c9514f3f109d49aaaf3d7dc0a79ed9f3';
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
      
      const locationObj = { country, city, street };
      
      setUserInfo((prev) => ({
        ...prev,
        location: locationObj
      }));
      
      setIsLocationChanged(true);
      
      return locationObj;
    } else {
      setCoordinates({ lat, lng });
      setIsLocationChanged(true);
      return null;
    }
}
;
  const fetchPosts = async () => {
    if (!token || !user.email) {
      setError("Token not available");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      console.log(user.email)
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
          <h2 className="section-title">User Posts</h2>
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <h3 className="post-title">{post.description}</h3>
                  <p className="post-date">
                    <strong>Created On:</strong> {new Date(post.creationDateTime).toLocaleString()}
                  </p>
                </div>
                {post.image && (
                  <div className="post-image">
                    <img
                      src={`data:image/jpeg;base64,${post.image.imageBase64}`}
                      alt={post.image.relativePath}
                    />
                  </div>
                )}
                <div className="post-details">
                  <p>
                    <strong>Location:</strong> {post.location.city}, {post.location.street},{" "}
                    {post.location.country}
                  </p>
                  <p>
                    <strong>Likes:</strong> {post.likes}
                  </p>
                  <p>
                    <strong>Comments:</strong> {post.comments}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-posts">No posts available...</p>
          )}
        </div>
      )}
      

    {/* Followers Section */}
      {activeSection === "following" && (
        <div className="profile-section">
          <h2>Followers and Following</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr>
                <th style={{ 
                  border: '1px solid #ddd', 
                  padding: '12px', 
                  backgroundColor: '#f2f2f2',
                  textAlign: 'left',
                  width: '50%'
                }}>
                  Followers
                </th>
                <th style={{ 
                  border: '1px solid #ddd', 
                  padding: '12px', 
                  backgroundColor: '#f2f2f2',
                  textAlign: 'left',
                  width: '50%'
                }}>
                  Following
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Determine the maximum length to create equal rows */}
              {Array.from({ 
                length: Math.max(followers?.length || 0, following?.length || 0) 
              }).map((_, index) => (
                <tr key={index}>
                  <td style={{ 
                    border: '1px solid #ddd', 
                    padding: '12px',
                    verticalAlign: 'top'
                  }}>
                    {followers && followers[index] ? (
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                      }}>
                        <span>{followers[index]}</span>
                        <button 
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          onClick={() => navigate(`/profile/${followers[index]}`)}
                        >
                          Go to profile
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#999' }}>-</span>
                    )}
                  </td>
                  <td style={{ 
                    border: '1px solid #ddd', 
                    padding: '12px',
                    verticalAlign: 'top'
                  }}>
                    {following && following[index] ? (
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                      }}>
                        <span>{following[index]}</span>
                        <button 
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          onClick={() => navigate(`/profile/${following[index]}`)}
                        >
                          Go to profile
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#999' }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
              {/* Show message if both arrays are empty */}
              {(!followers || followers.length === 0) && (!following || following.length === 0) && (
                <tr>
                  <td colSpan="2" style={{ 
                    border: '1px solid #ddd', 
                    padding: '12px',
                    textAlign: 'center',
                    color: '#999'
                  }}>
                    No followers or following users yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default CurrentUserProfile;
