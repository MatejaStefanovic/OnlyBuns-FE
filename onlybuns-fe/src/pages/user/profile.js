import React from 'react';
import { useUser } from '../../context/userContext';

const ProfilePage = () => {
  /*Pogledajte u userContext.js fajlu (direktorijum context)
  na dnu se nalazi UserContext.Provider, sve sto se u njemu nalazi
  mozete izvuci na ovaj nacin, moze i vise odjednom npr [user,token],
  isto vazi i za funkcije poput login, logout  
  */
  const { user } = useUser(); 

  if (!user) {
    return <h1>Please log in to view your profile</h1>; 
  }

  return (
    <div>
      <h1>This will be user profile</h1>
      <h2>Current user: {user.username}</h2> 
    </div>
  );
};

export default ProfilePage;



