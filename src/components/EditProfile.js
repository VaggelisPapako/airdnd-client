import React, { useState, useEffect } from "react";
import './Signup.css';
import TextInput from './TextInput';
import SafetyHazard from './SafetyHazard';
import { Link } from 'react-router-dom'

/**
 * WARNING: This component is very half-baked. The update request exists but needs the user authentication to work properly.
 * Many functions, elements and variables inside are at template state. They need to change when everything gets to work.
 */
export default function EditProfile(props) {

    // This state is copy-pasted from the signup component
    // TODO: Change this to user whenever possible
    const [user, setUser] = useState({});
      
    /**
     * State that contains the data obtained from the form.
     * Changes whenever a field on the form changes
     * Notice that the fields are assigned to values as if a user is not registered.
     * That's because we need the authentication to work properly first to assign the values properly
     */
    const [formData, setFormData] = React.useState({
        username: "",
        password: "",
        passwordConfirm: "",
        firstname: "",
        lastname: "",
        email: "",
        phoneNumber: "",
        isTenant: false,
        isLandlord: false,
        isApproved: true,
        image: ""
    })

    // Storing the previous password, needed for Safety Hazard Check
    const [prevPassword, setPrevPassword] = useState();

    useEffect(() => {

        if(!props.token) {
            return;
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
                    setUser(userData.message)
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

    // This state will be needed to save the user changes in a safely manner
    const [hasMadeChanges, setHasMadeChanges] = useState(false);

    // Message state that prints to the user if an error occurred in the update process
    const [message, setMessage] = React.useState("")

    /**
     * All the input fields inside the form
     * In our formData object, the name attribute of the input is the name of the respective field as well
     * In our formData object, the value attribute of the input is the value of respective the field as well
     */
    const textInputs = [
        {id:1, type: "text", placeholder: "Change Username", className:"App-signup-form-input", name: "username", value: formData.username},
        {id:2, type: "password", placeholder: "Change Password", className:"App-signup-form-input", name: "password", value: formData.password},
        {id:3, type: "password", placeholder: "Confirm Changed Password", className:"App-signup-form-input", name: "passwordConfirm", value: formData.passwordConfirm},
        {id:4, type: "text", placeholder: "Change First name", className:"App-signup-form-input", name: "firstname", value: formData.firstname},
        {id:5, type: "text", placeholder: "Change Last name", className:"App-signup-form-input", name: "lastname", value: formData.lastname},
        {id:6, type: "email", placeholder: "Change Email", className:"App-signup-form-input", name: "email", value: formData.email},
        {id:7, type: "text", placeholder: "Change Phone Number", className:"App-signup-form-input", name: "phoneNumber", value: formData.phoneNumber}
    ]

    // Edit Profile Input html elements
    // We are reusing the ones we used in the signup component
    const textInputElements = textInputs.map(textInput => (
        <TextInput
            key={textInput.id}
            type={textInput.type}
            placeholder={textInput.placeholder}
            className={textInput.className}
            name={textInput.name}
            value={textInput.value}
            onChange={(event) => handleChange(event)}
        />
    ))
    
    // This is where we change the formData members accordingly
    function handleChange(event) {
        const {name, value, type, checked} = event.target
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: type === "checkbox" ? checked : value
        }))
    }

    // Profile update process begins and ends here (Not ready yet)
    function handleSubmit(event) {

        // We don't want to be redirected to the home page
        event.preventDefault()

        setPrevPassword(user.password)

        if (formData.username !== "" && formData.username !== user.username) {
            setHasMadeChanges(true)
            setUser(prevUser => ({
                ...prevUser,
                username: formData.username,
            }))
        }

        if (formData.password !==  formData.passwordConfirm) {
            setMessage("Please confirm your new password")
            return;
        }

        if (formData.password !== "" && formData.password !== user.password)  {
            setHasMadeChanges(true)
            setUser(prevUser => ({
                ...prevUser,
                password: formData.password,
            }))
        }

        if(formData.firstname !== "" && formData.firstname !== user.firstname) {
            setHasMadeChanges(true)
            setUser(prevUser => ({
                ...prevUser,
                firstname: formData.firstname,
            }))
        }

        if(formData.lastname !== "" && formData.lastname !== user.lastname) {
            setHasMadeChanges(true)
            setUser(prevUser => ({
                ...prevUser,
                lastname: formData.lastname,
            }))
        }

        if(formData.email !== "" && formData.email !== user.email) {
            setHasMadeChanges(true)
            setUser(prevUser => ({
                ...prevUser,
                email: formData.email,
            }))
        }

        if(formData.phoneNumber !== "" && formData.phoneNumber !== user.phoneNumber) {
            setHasMadeChanges(true)
            setUser(prevUser => ({
                ...prevUser,
                phoneNumber: formData.phoneNumber,
            }))
        }

        if(formData.image !== user.image) {
            setHasMadeChanges(true)
            setUser(prevUser => ({
                ...prevUser,
                image: formData.image,
            }))
        }

        if(formData.isTenant === true && formData.isTenant !== user.isTenant) {
            setHasMadeChanges(true)
            setUser(prevUser => ({
                ...prevUser,
                isTenant: formData.isTenant,
            }))

            if(formData.isLandlord === false) {
                setUser(prevUser => ({
                    ...prevUser,
                    isLandlord: false,
                    isApproved: true
                }))
            }
        }

        if(formData.isLandlord === true && formData.isLandlord !== user.isLandlord) {
            setHasMadeChanges(true)
            setUser(prevUser => ({
                ...prevUser,
                isLandlord: formData.isLandlord,
                isApproved: false
            }))
            // If someone wants to add a role to his current one, he has to click his current role checkbox + the new roles' one
            if(formData.isTenant === false) {
                setUser(prevUser => ({
                    ...prevUser,
                    isTenant: false,
                }))
            }
        }

        if(user.isLandlord && user.isTenant) {
            if(!formData.isLandlord && !formData.isTenant) {
                return
            }
            else{
                if(!formData.isLandlord) {
                    setHasMadeChanges(true)
                    setUser(prevUser => ({
                        ...prevUser,
                        isLandlord: false,
                        isApproved: true
                    }))
                }
                if(!formData.isTenant) {
                    setHasMadeChanges(true)
                    setUser(prevUser => ({
                        ...prevUser,
                        isTenant: false,
                    }))
                }
            }
        }

        // console.log(user)
        // The user has made changes to their profile, Safety Hazard triggered.
        // We probably need to edit this state to change whenever a change actually happens
        // The submit button can be pressed even if the user has not made changes
    }

    return (
        <main className="App-signup-form-container">
        {!hasMadeChanges && <form className="App-signup-form" onSubmit={handleSubmit}>
            {/* Any error will be printed to the user here */}
            {message !== "" && <h3 className="App-signup-form-message">{message}</h3>}
            <h1>Edit your Account!</h1>
            <br />
            <div className="App-signup-form-inputs">
                <div className="App-signup-form-text-inputs">
                    {textInputElements}
                </div>
                <div className="App-signup-form-other-inputs">
                    {/* Profile picture section in the form, not working yet, it is here because of looks */}
                    <div className="App-signup-form-image-container">
                        <h3>Your Profile Picture</h3>
                        <div className="App-signup-form-image">
                            <input
                                id="ProfilePicture"
                                type="file"
                                className="App-signup-form-image-uploader"
                                name="image"
                                onChange={handleChange}
                                value={formData.image}
                                accept="image/jpeg, image/png, image/jpg"
                            />
                            <label htmlFor="ProfilePicture"><img src={formData.image !== "" ? formData.image : "https://i.pinimg.com/originals/46/72/f8/4672f876389036583190d93a71aa6cb2.jpg"} alt="prof"/></label>
                        </div>
                    </div>
                    <h3>Choose any of the roles below: </h3>
                    <p>You can choose either one or both</p>
                    {/**
                       * Checkboxes to let the user select the desired roles.
                       * The checkboxes that have the roles already selected by the user,
                       * is a good idea to be already selected  
                       */}
                    <div className="App-signup-form-checkboxes">
                        <div className="App-signup-form-roles">
                            <input
                                id="tenant"
                                className="App-signup-form-checkbox"
                                type="checkbox"
                                name="isTenant"
                                onChange={handleChange}
                                checked={formData.isTenant}
                            />
                            <label htmlFor="tenant">Tenant</label>
                        </div>
                        <div className="App-signup-form-roles">
                            <input
                                id="landlord"
                                className="App-signup-form-checkbox"
                                type="checkbox"
                                name="isLandlord"
                                onChange={handleChange}
                                checked={formData.isLandlord}
                            />
                            <label htmlFor="landlord">Landlord</label>
                        </div>         
                    </div>
                </div>
            </div>
            <br /><br /><br />
            {/* In React Submit input can be labeled as button inside forms */}
            <button 
                className="App-signup-form-submit"
            >
                Save Changes
            </button>
            <br />
            <Link to="/profile">
                Go Back
            </Link>
        </form>}
        {hasMadeChanges && <SafetyHazard user={user} token={props.token} prevPassword={prevPassword}/>}
    </main>
    )
}