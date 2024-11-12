import React, { createContext, useState, useContext, useEffect } from 'react';


const UserContext = createContext();

// UserProvider-om obavijamo aplikaciju u index.js tako da se kontekst prenese na sve pod elemente
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // pocetno stanje za usera je null a setUser je zapravo funkcija
  const [token, setToken] = useState(null); // isto to za JWT

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user'); //  Ovde cuvamo podatke kao na webu
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser)); 
    }
  }, []); // This effect runs once on mount to load the data from localStorage
  
  // This effect will run whenever the 'user' state changes
  useEffect(() => {
    if (user) {
      // Update the user details in localStorage whenever the user changes
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]); // Dependency on user state

  // Slava GPT-u ^^^^

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData)); // Ovde cuvamo podatke kao na webu
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };


  const isAuthenticated = () => !!token;

  return (
    //Ovo je kontekst koji se prosledjuje, bilo sta od ovoga mozete koristiti,
    // login logout funkcije, isAuthenticated funckiju, samog usera ili token
    // Postoji primer u login-u kako se bas login koristi ako zatreba
    <UserContext.Provider value={{ user, token, login, logout, isAuthenticated }}> 
      {children}
    </UserContext.Provider>
  );
};

// hook da se pristupi user kontekstu - ovo pozivamo u komponentama
export const useUser = () => {
  return useContext(UserContext);
};
