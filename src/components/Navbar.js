import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NavbarButton from './NavbarButton';
import './Navbar.css';

export default function Navbar(props) {

    // Returning current location in the page
    const location = useLocation()

    // Navbar button state that allows us to change the active button depending on current location
    const [navbarButtons, setNavbarButtons] = useState([]);

    // Changing active button depending on location and user connectivity changes
    useEffect(() => {

        let newButtons;
        if (props.userIsLoggedIn) {
            newButtons = [
                { id: 1, path: '/', name: 'Home', isActive: true },
                { id: 2, path: '/profile', name: 'Profile', isActive: false },
                { id: 3, path: '/logout', name: 'Logout', isActive: false },
                { id: 4, path: '/about', name: 'About', isActive: false },
                { id: 5, path: '/contact', name: 'Contact', isActive: false }
            ]
        } else {
            newButtons = [
                { id: 1, path: '/', name: 'Home', isActive: true },
                { id: 2, path: '/login', name: 'Login', isActive: false },
                { id: 3, path: '/signup', name: 'Sign Up', isActive: false },
                { id: 4, path: '/about', name: 'About', isActive: false },
                { id: 5, path: '/contact', name: 'Contact', isActive: false }
            ]
        }

        // If the button has the same path as the current one it is set as active
        newButtons = newButtons.map(button => {
            return {
                ...button,
                isActive: window.location.pathname === button.path
            }
        })

        setNavbarButtons(newButtons)

    }, [props.userIsLoggedIn, location]);

    // Each button is its own component
    const navbarButtonElements = navbarButtons.map(button => (
        <NavbarButton
            key={button.id}
            className={button.isActive ? 'App-navbar-button-active' : 'App-navbar-button'}
            path={button.path}
            name={button.name}
        />
    ));

    return (
        <nav className="App-navbar">
            <ul className="App-navbar-buttons">
                {navbarButtonElements}
            </ul>
        </nav>
    );
}
