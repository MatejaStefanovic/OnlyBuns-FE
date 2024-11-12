import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './editPosts.css';
import rabbitPreview from '../../assets/icons/rabbitPreview.png';
import { useUser } from '../../context/userContext';
import { useLocation } from 'react-router-dom';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function EditPost() {
  const location = useLocation();
  const { post } = location.state || {}; 
  
  const [description, setDescription] = useState(post?.description || '');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(post?.image ? `data:image/png;base64,${post.image.imageBase64}` : rabbitPreview);
  const [coordinates, setCoordinates] = useState(post?.location?.coordinates || null);
  const [locationInfo, setLocationInfo] = useState({
    city: post?.location?.city || '',
    country: post?.location?.country || '',
    street: post?.location?.street || '',
  });

  const { user, token } = useUser();

  if (!user) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('description', description);
    if (image) formData.append('image', image); // Only append image if a new one is selected
    formData.append('city', locationInfo.city);
    formData.append('country', locationInfo.country);
    formData.append('street', locationInfo.street);
    formData.append('email', user.email);

    const url = `http://localhost:8080/api/posts/update/${post.id}`;
    const method = 'PUT';
    fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Post saved successfully:', data);
        if (!post) {
          setDescription('');
          setImage(null);
          setImagePreview(rabbitPreview);
          setLocationInfo({ city: '', country: '', street: '' });
        }
      })
      .catch((error) => console.error('Error saving post:', error));
  };

  const fetchLocation = async (lat, lng) => {
    const apiKey = 'f915ad90ad804f96aaea9b30c818d1ab';
    const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`);
    const data = await response.json();
    if (data.results.length > 0) {
      const components = data.results[0].components;
      setCoordinates({ lat, lng });
      setLocationInfo({
        city: components.city || components.town || components.village || '',
        country: components.country || '',
        street: components.road || ''
      });
    }
  };

  function LocationMarker() {
    useMapEvents({
      click(e) {
        fetchLocation(e.latlng.lat, e.latlng.lng);
      },
    });

    return coordinates ? <Marker position={[coordinates.lat, coordinates.lng]}></Marker> : null;
  }

  return (
    <form onSubmit={handleSubmit} className="create-post-form">
      <div className="form-group">
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Image:</label>
        <div className="image-preview-wrapper">
          <img src={imagePreview} alt="Preview" className="image-preview" />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            id="file-input"
          />
          <label htmlFor="file-input" className="choose-file-button">Choose File</label>
        </div>
      </div>
      <div className="form-group">
        <label>Select Location:</label>
        <MapContainer
          center={coordinates || [51.505, -0.09]}
          zoom={13}
          style={{ height: '100px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
        </MapContainer>
      </div>
      <button type="submit" className="submit-button-for-post">
        {post ? 'Update Post' : 'Create Post'}
      </button>
    </form>
  );
}

export default EditPost;
