import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


function CreatePost() {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [location, setLocation] = useState({
    city: '',
    country: '',
    street: '',
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    // Generate a preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('description', description);
    formData.append('image', image);
    if (location) {
      formData.append('city', location.city);
      formData.append('country', location.country);
      formData.append('street', location.street);
    }

    fetch('http://localhost:8080/api/post', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Post created successfully:', data);
        // Clear the form and preview after successful submission
        setDescription('');
        setImage(null);
        setImagePreview(null);
        setLocation({
          city: '',
          country: '',
          street: '',
        });

      })
      .catch((error) => {
        console.error('Error creating post:', error);
      });
  };

  const fetchLocation = async (lat, lng) => {
    const apiKey = 'f915ad90ad804f96aaea9b30c818d1ab';
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`
    );
    const data = await response.json();
    if (data.results.length > 0) {
      const components = data.results[0].components;
      setCoordinates({ lat, lng });
      setLocation({
        city: components.city || components.town || components.village || '',
        country: components.country || '',
        street: components.road || ''
      });
    } else {
      setCoordinates(null);
      setLocation({
        city: '',
        country: '',
        street: ''
      });
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

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required
        />
      </div>
      {imagePreview && (
        <div>
          <p>Image Preview:</p>
          <img src={imagePreview} alt="Preview" style={{ maxWidth: '300px' }} />
        </div>
      )}
      <div>
        <label>Select Location:</label>
        <MapContainer
          center={[51.505, -0.09]}
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
      {coordinates && (
        <div>
          <p>Selected Location:</p>
          <p>City: {location.city}</p>
          <p>Country: {location.country}</p>
          <p>Street: {location.street}</p>
        </div>
      )}
      <button type="submit">Create Post</button>
    </form>
  );
}

export default CreatePost;
