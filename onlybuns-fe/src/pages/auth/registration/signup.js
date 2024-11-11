import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import styles from './signup.css'; // Scoped CSS styles
import { useNavigate } from 'react-router-dom';

function SignUp() {
  // State for country, city, and street
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  
  // Predefined options for demonstration (you can replace this with API calls)
  const countries = ['USA', 'Canada', 'Germany'];
  const citiesByCountry = {
    USA: ['New York', 'Los Angeles', 'Chicago'],
    Canada: ['Toronto', 'Vancouver', 'Montreal'],
    Germany: ['Berlin', 'Munich', 'Hamburg'],
  };
  const streetsByCity = {
    'New York': ['5th Avenue', 'Broadway', 'Wall Street'],
    'Los Angeles': ['Sunset Boulevard', 'Hollywood Blvd', 'Venice Beach'],
    'Chicago': ['Michigan Ave', 'State Street', 'Wacker Drive'],
    'Toronto': ['Yonge Street', 'Queen Street', 'Bloor Street'],
    'Vancouver': ['Granville Street', 'Robson Street', 'Main Street'],
    'Montreal': ['Saint Catherine Street', 'Sherbrooke Street', 'Saint Denis Street'],
    'Berlin': ['Unter den Linden', 'Kurfürstendamm', 'Alexanderplatz'],
    'Munich': ['Maximilianstrasse', 'Kaufingerstrasse', 'Sendlinger Strasse'],
    'Hamburg': ['Mönckebergstraße', 'Reeperbahn', 'Spitalerstraße'],
  };

  // Handle country change
  const handleCountryChange = (e) => {
    setCountry(e.target.value);
    setCity(''); // Reset city and street
    setStreet('');
  };

  // Handle city change
  const handleCityChange = (e) => {
    setCity(e.target.value);
    setStreet(''); // Reset street when city changes
  };

  const handleStreetChange = (e) => {
    setStreet(e.target.value); // Reset street when city changes
  };

  // Formik setup
  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      email: '',
      role: 'NORMAL', // Default role (assuming all users are NORMAL by default)
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
          username: values.username,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          role: values.role,
          isActivated: false, 
          location: {
            country, 
            city,    
            street,  
          },
        };

        const response = await fetch('http://localhost:8080/api/user/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        // Ceka se odgovor od beka
        const result = await response.json();

        if (response.ok) {     
          setSuccessMessage('Registration successful! You can now log in.');
          setError(''); 
          formik.resetForm(); 
          navigate('/login');
        } else {
          setError(result.message || 'Registration failed');
          setSuccessMessage('');
          navigate('/logi');
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

      {/* Display success message */}
      {successMessage && <div className="success">{successMessage}</div>}

      {/* Display error message */}
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

        {/* Country Dropdown */}
        <div className="inputGroup">
          <label htmlFor="country">Country</label>
          <select
            id="country"
            name="country"
            onChange={handleCountryChange}
            onBlur={formik.handleBlur}
            value={country}
          >
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* City Dropdown */}
        {country && (
          <div className="inputGroup">
            <label htmlFor="city">City</label>
            <select
              id="city"
              name="city"
              onChange={handleCityChange}
              onBlur={formik.handleBlur}
              value={city}
            >
              <option value="">Select City</option>
              {citiesByCountry[country] && citiesByCountry[country].length > 0 ? (
                citiesByCountry[country].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))
              ) : (
                <option value="">No cities available</option>
              )}
            </select>
          </div>
        )}

        {/* Street Dropdown */}
        {city && (
          <div className="inputGroup">
            <label htmlFor="street">Street</label>
            <select
              id="street"
              name="street"
              onChange={handleStreetChange}
              onBlur={formik.handleBlur}
              value={street}
            >
              <option value="">Select Street</option>
              {streetsByCity[city] && streetsByCity[city].length > 0 ? (
                streetsByCity[city].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))
              ) : (
                <option value="">No streets available</option>
              )}
            </select>
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" className="submitButton">
          Register
        </button>
      </form>
    </div>
  );
}

export default SignUp;
