import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './signup.css'; // Import your CSS

function SignUp() {
  const [coordinates, setCoordinates] = useState(null);
  const [location, setLocation] = useState({
    country: '',
    city: '',
    street: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Leaflet Icon Fix
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
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
          street: components.road || '',
        });
      } else {
        setLocation({ country: '', city: '', street: '' });
      }
    } catch (err) {
      console.error('Error fetching location:', err);
      setError('Failed to fetch location. Try again later.');
    }
  };

  function LocationMarker() {
    useMapEvents({
      click(e) {
        fetchLocation(e.latlng.lat, e.latlng.lng);
      },
    });

    return coordinates ? (
      <Marker position={[coordinates.lat, coordinates.lng]} />
    ) : null;
  }

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      email: '',
      role: 'NORMAL', // Default role
    },
    validationSchema: Yup.object({
      username: Yup.string().min(3).max(16).required('Username is required'),
      password: Yup.string().min(8).max(128).required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm Password is required'),
      firstName: Yup.string().required('First name is required'),
      lastName: Yup.string().required('Last name is required'),
      email: Yup.string().email('Invalid email format').required('Email is required'),
    }),
    onSubmit: async (values) => {
      try {
        const data = {
          ...values,
          location,
        };

        const response = await fetch('http://localhost:8080/api/user/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
          setSuccessMessage('Registration successful! You can now log in.');
          setError('');
          formik.resetForm();
          navigate('/login');
        } else {
          setError(result.message || 'Registration failed');
          setSuccessMessage('');
        }
      } catch (err) {
        console.error('Registration error:', err);
        setError('An error occurred. Please try again later.');
      }
    },
  });

  return (
    <div className="registerContainer">
      <h2 className="title">Register</h2>

      {successMessage && <div className="success">{successMessage}</div>}
      {error && <div className="error">{error}</div>}

      <form onSubmit={formik.handleSubmit} className="form">
        {/* Username */}
        <div className="inputGroup">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.username}
          />
          {formik.touched.username && formik.errors.username ? (
            <div className="error">{formik.errors.username}</div>
          ) : null}
        </div>

        {/* Password */}
        <div className="inputGroup">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
          />
          {formik.touched.password && formik.errors.password ? (
            <div className="inputGroup">{formik.errors.password}</div>
          ) : null}
        </div>

        {/* Confirm Password */}
        <div className="inputGroup">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.confirmPassword}
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
            <div className="error">{formik.errors.confirmPassword}</div>
          ) : null}
        </div>

        {/* First Name */}
        <div className="inputGroup">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.firstName}
          />
          {formik.touched.firstName && formik.errors.firstName ? (
            <div className="error">{formik.errors.firstName}</div>
          ) : null}
        </div>

        {/* Last Name */}
        <div className="inputGroup">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.lastName}
          />
          {formik.touched.lastName && formik.errors.lastName ? (
            <div className="error">{formik.errors.lastName}</div>
          ) : null}
        </div>

        {/* Email */}
        <div className="inputGroup">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
          {formik.touched.email && formik.errors.email ? (
            <div className="error">{formik.errors.email}</div>
          ) : null}
        </div>

        {/* Location Section */}
        <div className="inputGroup">
          <label>Location</label>
          <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '300px', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker />
          </MapContainer>
          <div className="locationDetails">
            <p><strong>Country:</strong> {location.country}</p>
            <p><strong>City:</strong> {location.city}</p>
            <p><strong>Street:</strong> {location.street}</p>
          </div>
        </div>

        <button type="submit" className="submitButton">
          Register
        </button>
      </form>
    </div>
  );
}

export default SignUp;