import React, { useState, useEffect } from 'react'
import './Profile.css'
import { Link } from 'react-router-dom';

export default function Profile(props) {

    const [currentUser, setCurrentUser] = useState({})

    useEffect(() => {
        if (!props.token) {
            return; // No token, no need to proceed
        }

        // Validating and decoding the JSON Web Token
        fetch("http://localhost:5000/user/validateToken", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${props.token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(validationData => {

            // Token validation succeeded, now decode the token to check if the user is an admin
            return fetch("http://localhost:5000/user/decodeToken", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${props.token}`
                }
            })
            .then(decodeResponse => {
                if (!decodeResponse.ok) {
                    throw new Error("Token decoding failed");
                }
                return decodeResponse.json();
            })
            .then(decodeData => {
                // Retrieving the userInfo
                return fetch(`http://localhost:5000/user/getUserById/${decodeData.id}`, {
                    method: "GET"
                })
                .then(userResponse => {
                    if (!userResponse.ok) {
                        throw new Error("Failed to retrieve user");
                    }
                    return userResponse.json();
                })
                .then(userData => {
                    // Setting current user
                    setCurrentUser(userData.message)
                })
                .catch(error => {
                    console.error(error);
                })
            })
            .catch(error => {
                console.error(error);
            })

        })
        .catch(error => {
            console.error(error);
        });
    }, [props.token]) 

    // All the favicons shown in the contact section of the user profile
    const contacts = [
        {id:1, favicon: 'https://cdn3.iconfinder.com/data/icons/social-messaging-ui-color-line/245532/72-512.png', alt:"email", name: currentUser.email},
        {id:2, favicon: 'https://cdn.icon-icons.com/icons2/644/PNG/512/red_phone_icon-icons.com_59526.png', alt:"phone", name: currentUser.phoneNumber}
    ]

    // User contact information as html elements
    const contactElements = contacts.map(contact => 
        <div key={contact.id} className='App-profile-contact'>
            <img src={contact.favicon} alt={contact.alt} />
            <h3>{contact.name}</h3>
        </div>
    )

    return (
        <main className="App-profile-container">
            <div className="App-profile">
                {/* In Link components you can only change the style using javascript styles similar to CSS
                  * but different syntax inside the style attribute of the tag
                  * This is a Link to the edit profile component 
                  */}
                <Link to='/editprofile' style={{position: "relative", left: "35%"}}>
                    <div className="App-profile-edit">
                        <div className="App-profile-edit-button">
                            <div className="App-profile-edit-cog">
                                <img src="https://icon-library.com/images/white-gear-icon-png/white-gear-icon-png-12.jpg" alt="Edit-profile" className="App-profile-edit-favicon"/>
                            </div>  
                            <span>Edit Account</span>
                        </div>
                    </div>
                </Link> 
                <br /><br />
                <div className="App-profile-user">
                    <div className="App-profile-userInfo">
                        {/* Displays the profile image of the user. For now it is the default profile image, profile images are not working yet in the app. */}
                        <div className="App-profile-image">
                            <img src={currentUser.image === "" ? "https://i.pinimg.com/originals/46/72/f8/4672f876389036583190d93a71aa6cb2.jpg" : currentUser.image} alt="prof"/>
                        </div>
                        {/* Important User Info */}
                        <h2 className='App-profile-fullname'>{currentUser.firstname} {currentUser.lastname}</h2>
                        <h2 className='App-profile-username'>{currentUser.username}</h2>
                        <h3 className='App-profile-role'>{currentUser.isAdmin && "Admin"} {currentUser.isTenant && "Tenant"} {currentUser.isLandlord && "Landlord"}</h3>
                        <br /><br /><br />
                        {/* Contact Section in the profile page */}
                        <div className='App-profile-contacts'>
                            <h2 className='App-profile-contacts-title'>Contact:</h2>
                            {contactElements}
                        </div>
                    </div>
                    {/* These are set to appear depending on the roles of the user, the user authentication is not ready yet */}
                    {/* We don't have the corresponding info yet in the database */}
                    <div className='App-profile-userHistory'>
                        {currentUser.isLandlord && <div className='App-profile-landlord'>
                            <h3>Landlord Info</h3>
                            {!currentUser.isApproved && <h2>Landlord not approved yet!!</h2>}
                        </div>}
                        {currentUser.isTenant && <div className='App-profile-tenant'>
                            <h3>Tenant Info</h3>
                        </div>}
                    </div>
                </div>
            </div>
        </main>
    )
}