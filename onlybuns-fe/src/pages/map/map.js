import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/userContext'; // Assuming a user context is available
import '@fortawesome/fontawesome-free/css/all.min.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import userIcon from '../../assets/icons/user.png';
import shelterIcon from '../../assets/icons/rabbit_shelter.png';
import vetIcon from '../../assets/icons/rabbit_vet.png';
import postIcon from '../../assets/icons/rabbitPost.png';

const MapPage = () => {
    const { user, token, setUser } = useUser();
    const [coordinates, setCoordinates] = useState(null);
    const [location, setLocation] = useState({
        country: '',
        city: '',
        street: '',
    });

    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');

    const UserIcon = L.icon({
        iconUrl: userIcon, 
        iconSize: [48, 48],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });

    const ShelterIcon= L.icon({
        iconUrl: shelterIcon, 
        iconSize: [48, 48],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });

    const VetIcon= L.icon({
        iconUrl: vetIcon, 
        iconSize: [48, 48],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });

    const PostIcon= L.icon({
        iconUrl: postIcon, 
        iconSize: [80, 80],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });

    const fetchLocation = async (lat, lng) => {
        const apiKey = 'f915ad90ad804f96aaea9b30c818d1ab'; // Replace with your valid OpenCage API key
        try {
            const response = await fetch(
                `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`
            );

            const data = await response.json();
            if (data.results.length > 0) {
                const components = data.results[0].components;
                setCoordinates({ lat, lng });
                setLocation({
                country: components.country || '',
                city: components.city || components.town || components.village || '',
                street: components.road || '',});
            }

            else {
            setLocation({ country: '', city: '', street: '' });
            }
        } catch (err) {
          console.error('Error fetching location:', err);
          setError('Failed to fetch location. Try again later.');
        }
    };

   
    const fetchPosts = async () => {
        if (!token || !user.email) {
            setError("Token not available");
            return;
        }

        setError(null);

        try {
            const response = await fetch(`http://localhost:8080/api/post/userPosts?email=${user.email}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch user posts');

            const data = await response.json();

            // 🔁 Geocode each post with an address
            const postsWithCoordinates = await Promise.all(
                data.map(async (post) => {
                    if (post.lat && post.lng) return post; // already has coords

                    const coords = await getCoordinatesFromAddress(post.location);
                    return coords
                        ? { ...post, lat: coords.lat, lng: coords.lng }
                        : null;
                })
            );

            setPosts(postsWithCoordinates.filter(Boolean));
        } catch (err) {
            setError(err.message);
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
        } 
        catch (error) {
            console.error('Error geocoding address:', error);
        }

        return null;
    };

    function UserMarker() {
        return coordinates === null ? null : (
            <Marker position={[coordinates.lat, coordinates.lng]}
                icon={UserIcon}
            >

                <Popup>You are here!</Popup>
            </Marker>
        );
    }
    
    function PostMarkers({ posts, icon }) {
        return (
            <>
                {posts.map((post, index) => (
                    <Marker key={index} position={[post.lat, post.lng]} icon={icon}>
                        <Popup>
                            <div style={{ width: "275px", height: "285px", overflow: "hidden" }}>
                                <p>
                                    Posted by: <strong>{post.user.username}</strong><br />
                                    Street: {post.location.street} <br />
                                    City: {post.location.city}
                                </p>
                                <img
                                    src={`data:image/jpeg;base64,${post.image.imageBase64}`}
                                        style={{
                                        position: "relative",
                                        width: "275px",
                                        height: "185px",
                                        objectFit: "contain",
                                        zIndex: 1,
                                    }}
                                />
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </>
        );
    }

    function ShelterMarker() {
        return coordinates === null ? null : (
            <Marker position={[coordinates.lat, coordinates.lng]}
                icon={ShelterIcon}
            >

                <Popup>This is a rabbit shelter</Popup>
            </Marker>
        );
    }
        
    useEffect(() => {
        if (user.location && user.location.city && user.location.country) {
            getCoordinatesFromAddress(user.location).then(coords => {
                if (coords) {
                    setCoordinates(coords);
                }
            });
        }
    }, [user]);
    
    useEffect(() => {
        fetchPosts();
    }, [user, token]);
    
    return (
        <div style={{ width: '100%', height: '100vh' }}>
            {coordinates ? (
                <MapContainer
                    center={[coordinates.lat, coordinates.lng]} // watch order!
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <UserMarker/>
                    <PostMarkers posts={posts} icon={PostIcon} />
                </MapContainer>
            ) : (
                <p>Loading map...</p>
            )}
        </div>
    );

};

export default MapPage;
