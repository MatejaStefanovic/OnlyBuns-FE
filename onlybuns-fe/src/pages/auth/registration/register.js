// ./src/pages/auth/Register.js
import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import styles from './register.css'; // Scoped CSS styles

function Register() {
  // Formik for handling form state and validation
  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      email: '',
      location: '',
      role: 'USER',  // Default role
    },
    validationSchema: Yup.object({
      username: Yup.string().min(3).max(16).required('Username is required'),
      password: Yup.string().min(8).max(128).required('Password is required'),
      firstName: Yup.string().required('First name is required'),
      lastName: Yup.string().required('Last name is required'),
      email: Yup.string().email('Invalid email format').required('Email is required'),
      location: Yup.string().required('Location is required'),
    }),
    onSubmit: (values) => {
      // Handle form submission here, e.g., make an API request
      console.log('Form data', values);
      // You could call an API to register the user here
    },
  });

  return (
    <div className={styles.registerContainer}>
      <h2 className={styles.title}>Register</h2>
      <form onSubmit={formik.handleSubmit} className={styles.form}>
        {/* Username */}
        <div className={styles.inputGroup}>
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
            <div className={styles.error}>{formik.errors.username}</div>
          ) : null}
        </div>

        {/* Password */}
        <div className={styles.inputGroup}>
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
            <div className={styles.error}>{formik.errors.password}</div>
          ) : null}
        </div>

        {/* First Name */}
        <div className={styles.inputGroup}>
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
            <div className={styles.error}>{formik.errors.firstName}</div>
          ) : null}
        </div>

        {/* Last Name */}
        <div className={styles.inputGroup}>
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
            <div className={styles.error}>{formik.errors.lastName}</div>
          ) : null}
        </div>

        {/* Email */}
        <div className={styles.inputGroup}>
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
            <div className={styles.error}>{formik.errors.email}</div>
          ) : null}
        </div>

        {/* Location */}
        <div className={styles.inputGroup}>
          <label htmlFor="location">Location</label>
          <select
            id="location"
            name="location"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.location}
          >
            <option value="">Select a Location</option>
            {/* You could dynamically generate these options based on available locations from your API */}
            <option value="New York">New York</option>
            <option value="Los Angeles">Los Angeles</option>
            <option value="Chicago">Chicago</option>
          </select>
          {formik.touched.location && formik.errors.location ? (
            <div className={styles.error}>{formik.errors.location}</div>
          ) : null}
        </div>

        {/* Submit Button */}
        <button type="submit" className={styles.submitButton}>Register</button>
      </form>
    </div>
  );
}

export default Register;
