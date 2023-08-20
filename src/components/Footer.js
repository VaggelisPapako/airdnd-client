import React from 'react'

export default function Footer() {

    const links = [
        {id:1, href:"https://www.facebook.com/airbnbuk", name:"Facebook"},
        {id:2, href:"https://www.instagram.com/airbnb/", name:"Instagram"}
    ]

    const linkElements = links.map(link => <h5 key={link.id}><a className='App-footer-link' href={link.href}>{link.name}</a></h5>)

    return (
        <footer className='App-footer'>
            <br />
            <h4 className='App-footer-title'>Find us on:</h4>
            {linkElements}
            <p className='App-footer-signoff'>
                All rights reserved<br />
                Παπακώστας Ευάγγελος sdi1800152<br />
                Τασιούλας Ραφαήλ-Χρήστος sdi1800191<br />
            </p>
            <br />
        </footer>
    )
}