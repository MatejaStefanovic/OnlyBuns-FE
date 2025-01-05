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
  const { user: contextUser, token } = useUser(); // Get user from context if available
  const navigate = useNavigate();
  const [user, setUser] = useState(contextUser || null); // State for user data
  const [loading, setLoading] = useState(!contextUser); // Skip loading if user is available in context
  const [error, setError] = useState(null); // Error state
  const [activeSection, setActiveSection] = useState('profile');
  const [posts, setPosts] = useState([]);


  
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
        if (data.email === contextUser.email)
          navigate("/myProfile");
        setUser(data); // Set fetched user data
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchPosts();
  }, [contextUser, username]);

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const userData = user || contextUser; // Use fetched user or context user

  return (
    <div className="user-profile">
      <div className="profile-header">
        <h1>{userData.firstName} {userData.lastName}</h1>
        <p>Email: {userData.email}</p>
        <button className="home-button" style={{ marginRight: 22.2 + "rem" }} onClick={() => setActiveSection("profile")}>Profile information</button>
        <button className="home-button" style={{ marginRight: 9.8 + "rem" }} onClick={() => setActiveSection("following")}>Followers and Following</button>
        <button className="home-button" onClick={() => setActiveSection("posts")}>Posts</button>
        <button className="home-button" onClick={() => navigate('/')}>Home</button>
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
          <p>Followers and Following will be displayed here...</p>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
