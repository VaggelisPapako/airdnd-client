import React from 'react';

export default function Logout(props) {
    const handleLogout = () => {
        // Clear the token from local storage
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
    
        // Redirect the user to the login page or another page
        window.location.href = '/login'; // Change '/login' to the appropriate path
      };
    
      return (
        <div className='App-logout-container'>
            <h1>Are you sure you want to logout?</h1>
            <button className='App-logout-button' onClick={handleLogout}>Logout</button>
        </div>
      );
}