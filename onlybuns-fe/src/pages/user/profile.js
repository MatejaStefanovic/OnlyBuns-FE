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
  const { user: contextUser, token } = useUser(); // Get user from context
  const navigate = useNavigate();

  const [user, setUser] = useState(contextUser || null);
  const [userr, setUserr] = useState(null);
  const [loading, setLoading] = useState(!contextUser);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [posts, setPosts] = useState([]);
  const [isFollowed, setIsFollowed] = useState(false);  
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  
  useEffect(() => {
    // Fetch user data dynamically if not in context
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/api/users/findUser?username=${username}`);
        if (!response.ok) throw new Error('User not found');
        const data = await response.json();

      
        if (data.email === contextUser.email) {
          navigate('/myProfile');
        } else {
          setUser(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!contextUser || contextUser.username !== username) {
      fetchUserData();
    } else {
      setUser(contextUser);
    }
  }, [contextUser, username, navigate]);

  useEffect(() => {
    if (user) {
      setIsFollowed(
        user?.followers?.some((follower) => contextUser.username === follower)
      );
    }
  }, [user, contextUser.username]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!token || !user?.email) {
        setError('Token not available');
        return;
      }
      setLoading(true);

      try {
        const response = await fetch(`http://localhost:8080/api/post/userPosts?email=${user.email}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch user posts');

        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchPosts();
  }, [user, token]);


const fetchFollowers = async () => {
  try {
    const response = await fetch(`http://localhost:8080/api/users/followers?username=${username}`);
    const data = await response.json();
    setFollowers(data);
  } catch (error) {
    console.error('Error fetching followers:', error);
  }
};

const fetchFollowing = async () => {
  try {
    const response = await fetch(`http://localhost:8080/api/users/following?username=${username}`);
    const data = await response.json();
    setFollowing(data);
  } catch (error) {
    console.error('Error fetching following:', error);
  }
};

// Call these functions when needed, e.g., when activeSection changes to "following"
useEffect(() => {
  if (activeSection === "following") {
    fetchFollowers();
    fetchFollowing();
  }
}, [activeSection, username]);


  const followUser = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/users/follow?usernameFollower=${contextUser.username}&usernameFollowing=${username}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setIsFollowed(true);
      } else if (response.status === 429) {
        const errorMessage = await response.text();
        alert(errorMessage || 'You have reached the follow limit. Try again later.');
      } else {
        alert('An error occurred while following the user.');
      }
    } catch (error) {
      console.error('Error in follow function:', error);
    }
  };


async function unfollowUser(){
    try {
        await fetch(`http://localhost:8080/api/users/unfollow?usernameFollower=${contextUser.username}&usernameFollowing=${username}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`, 
            }
        });
        setIsFollowed(false); 
         
    } catch (error) {
        console.error("Error in follow function:", error);
    }
}

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (contextUser.username === username){
    navigate("/myprofile");
  }
  const userData = user || contextUser; // Use fetched user or context user

  return (
    <div className="user-profile">
    <button className="follow-button"  onClick={() => (isFollowed ? unfollowUser() : followUser())}>  {isFollowed ? "Unfollow" : "Follow"}</button>
      <div className="profile-header">
        <h1>{userData.firstName} {userData.lastName}</h1>
        <p>Email: {userData.email}</p>
        <button className="home-button" style={{ marginRight: 22.2 + "rem" }} onClick={() => setActiveSection("profile")}>Profile information</button>
        <button className="home-button" style={{ marginRight: 9.8 + "rem" }} onClick={() => setActiveSection("following")}>Followers and Following</button>
        <button className="home-button" onClick={() => setActiveSection("posts")}>Posts</button>
        <button className="home-button" onClick={() => navigate('/home')}>Home</button>
      </div>

      {activeSection === "profile" && (
        <>
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
              center={[userData.location ?.lat || 51.505, userData.location ?.lng || -0.09]}
              zoom={13}
              style={{ height: '300px', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[userData.location ?.lat || 51.505, userData.location ?.lng || -0.09]} />
            </MapContainer>
          </div>
        </div>
      </>
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
                    <strong>Comments:</strong> {post.comments.length}
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

export default ProfilePage;
