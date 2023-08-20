import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

export default function UserInfo() {

    // Retrieving the id of the user from the url parameter
    const { id } = useParams()
    const location = useLocation();
    const token = location.state?.token

    // State variable with the current user
    const [user, setUser] = useState({})

    // Getting the current user from the server app updating the state
    useEffect(() => {
        fetch('http://localhost:5000/user/validateToken', {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${token}`
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
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(decodeResponse => {
                if (!decodeResponse.ok) {
                    throw new Error("Token decoding failed");
                }
                return decodeResponse.json();
            })
            .then(decodeData => {
                if(decodeData.isAdmin) {
                    fetch(`http://localhost:5000/user/getUserById/${id}`)
                        .then((response) => response.json())
                        .then((data) => setUser(data.message))
                }
                
            })
            .catch(error => {
                console.error(error);
            })

        })
        .catch(error => {
            console.error(error);
        })
        
    }, [id, token])

    /**
     * State that contains the data obtained from the form.
     * Changes whenever a field on the form changes
     */
    const [formData, setFormData] = useState({
        isApproved: user.isApproved,    // Checks if the user is approved
        isEmpty: true,                  // Checks if both radio buttons are not checked
        isSubmitted: false              // Checks if the choice is submitted
    })

    // Message state that prints to the admin if a landlord user has just been approved or disapproved
    const [message, setMessage] = useState("")

    // All the favicons shown in the contact section of the user info
    const contacts = [
        {id:1, favicon: 'https://cdn3.iconfinder.com/data/icons/social-messaging-ui-color-line/245532/72-512.png', alt:"email", name:user.email},
        {id:2, favicon: 'https://cdn.icon-icons.com/icons2/644/PNG/512/red_phone_icon-icons.com_59526.png', alt:"phone", name:user.phoneNumber}
    ]

    // User contact information as html elements
    // We are reusing the user profile css
    const contactElements = contacts.map(contact => 
        <div key={contact.id} className='App-profile-contact'>
            <img src={contact.favicon} alt={contact.alt} />
            <h3>{contact.name}</h3>
        </div>
    )

    // Function handling changes to the approval state of a landlord user from the admin
    function handleClick(event) {
        const {name, value} = event.target
        setFormData(prevFormData => ({
            ...prevFormData,
            isEmpty: false,
            isSubmitted: false,
            [name]: value
        }))

        const approveMessage = (value === 'true') ? "Landlord Approved!" : "Landlord Disapproved!"
        setMessage(approveMessage)
    }

    // This is where the user approval process begins and ends
    function handleSubmit(event) {

        // We don't want to be redirected to the home page
        event.preventDefault()

        // The form is submitted
        setFormData(prevState => ({
            ...prevState,
            isSubmitted: true
        }))

        // The approval state of the user is changed
        setUser(prevState => ({
            ...prevState,
            isApproved: formData.isApproved
        }))


        fetch('http://localhost:5000/user/validateToken', {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${token}`
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
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(decodeResponse => {
                if (!decodeResponse.ok) {
                    throw new Error("Token decoding failed");
                }
                return decodeResponse.json();
            })
            .then(decodeData => {
                if(decodeData.isAdmin) {
                    // Updating the approval state of the user in the database 
                    // Calling the server using a request with the put method with a custom body {id, isApproved}
                    const requestOptions = {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({id:user.id, isApproved:formData.isApproved})
                    }

                    fetch('http://localhost:5000/user/approveUser', requestOptions)
                }
                
            })
            .catch(error => {
                console.error(error);
            })

        })
        .catch(error => {
            console.error(error);
        })
    }

    return (
        <main className="App-profile-container">
            <div className="App-profile"> 
                <div className="App-profile-user">
                    <div className="App-profile-userInfo">
                        {/* Displays the profile image of the user. For now it is the default profile image, profile images are not working yet in the app. */}
                        <div className="App-profile-image">
                            <img src={user.image === "" ? "https://i.pinimg.com/originals/46/72/f8/4672f876389036583190d93a71aa6cb2.jpg" : user.image} alt="prof"/>
                        </div>
                        {/* Important User Info */}
                        <h2 className='App-profile-fullname'>{user.firstname} {user.lastname}</h2>
                        <h2 className='App-profile-username'>{user.username}</h2>
                        <h3 className='App-profile-role'>{user.isTenant && "Tenant"} {user.isLandlord && "Landlord"}</h3>
                        <br /><br /><br />
                        {/* Contact Section in the profile page */}
                        <div className='App-profile-contacts'>
                            <h2 className='App-profile-contacts-title'>Contact:</h2>
                            {contactElements}
                        </div>
                    </div>
                    <div className='App-profile-userHistory'>
                        {/* These are set to appear depending on the roles of the user, we don't have the corresponding info yet in the database */}
                        {user.isLandlord && <div className='App-profile-landlord'>
                            <h3>Landlord Info</h3>
                        </div>}
                        {user.isTenant && <div className='App-profile-tenant'>
                            <h3>Tenant Info</h3>
                        </div>}
                        {user.isLandlord && <form className='App-approve-user' onSubmit={handleSubmit}>
                            {/* User Approval form using radio buttons because we can only choose one of them */}
                            <h3>Approved to be landlord?</h3>
                            <div className='App-approval-radios'>
                                <div className='App-approval-radio'>
                                    <input type="radio" id="Yes" name="isApproved" value="true" onClick={handleClick}/>
                                    <label htmlFor="Yes">Yes</label>
                                </div>
                                <div className='App-approval-radio'>
                                    <input type="radio" id="No" name="isApproved" value="false" onClick={handleClick}/>
                                    <label htmlFor="No">No</label>
                                </div>      
                            </div>
                            <br /><br />
                            {/* In React Submit input can be labeled as button inside forms */}
                            <button 
                                // static style of the submit button
                                className='App-approval-submit'
                                // dynamic styling of the submit button 
                                style={{
                                    backgroundColor: formData.isEmpty ? "#484848" : "#ff585d",
                                    cursor: formData.isEmpty && "default"
                                }}
                                // You can have both static and dynamic styling, they can complement and contradict each other
                                // Can be helpful sometimes 
                            >Save Changes</button>
                        </form>}
                        {/* The approval or disapproval message appears here */}
                        {message !== "" && formData.isSubmitted && <h3>{message}</h3>}
                    </div>
                </div>
            </div>
        </main>
    )
}