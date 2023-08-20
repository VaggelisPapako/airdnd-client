import React from 'react'
import logo from '../images/airdnd-logo.png'
import Navbar from './Navbar'

// Header component with logo and navbar
export default function Header(props) {
    return (
        <header className='App-header'>
            <img src={logo} alt="logo" className="App-logo" />
            <Navbar userIsLoggedIn={props.userIsLoggedIn}/>
        </header>
    )
}