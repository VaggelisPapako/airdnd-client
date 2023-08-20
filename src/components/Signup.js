import React, { useState } from "react";
import './Signup.css';
import { Link } from 'react-router-dom';
import TextInput from './TextInput';

export default function Signup(props) {

    // State used to determine if the user is registered or not
    const [isRegistered, setIsRegistered] = useState(false);

    // State used to determine if the user is approved or not
    // Only the landlord users need to be approved by the admin
    const [userIsApproved, setUserIsApprovred] = useState(true);

    // State that contains the generated JSON Web Token
    const [authToken, setAuthToken] = React.useState("");

    /**
     * State that contains the data obtained from the form.
     * Changes whenever a field on the form changes
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

    // Message state that prints to the user if an error occurred in the register process
    const [message, setMessage] = React.useState("") 

    /**
     * All the input fields inside the form
     * In our formData object, the name attribute of the input is the name of the respective field as well
     * In our formData object, the value attribute of the input is the value of respective the field as well
     */
    const textInputs = [
        {id:1, type: "text", placeholder: "Username", className:"App-signup-form-input", name: "username", value: formData.username},
        {id:2, type: "password", placeholder: "Password", className:"App-signup-form-input", name: "password", value: formData.password},
        {id:3, type: "password", placeholder: "Confirm Password", className:"App-signup-form-input", name: "passwordConfirm", value: formData.passwordConfirm},
        {id:4, type: "text", placeholder: "First name", className:"App-signup-form-input", name: "firstname", value: formData.firstname},
        {id:5, type: "text", placeholder: "Last name", className:"App-signup-form-input", name: "lastname", value: formData.lastname},
        {id:6, type: "email", placeholder: "Email", className:"App-signup-form-input", name: "email", value: formData.email},
        {id:7, type: "text", placeholder: "Phone Number", className:"App-signup-form-input", name: "phoneNumber", value: formData.phoneNumber}
    ]

    // Signup Input html elements
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

        console.log(formData.image)
    }

    // Registration process begins and ends here
    async function handleSubmit(event) {

        // We don't want to be redirected to the home page
        event.preventDefault();
        
        // Checking if any of the form fields is empty and showing the according message sorted by priority
        if (formData.username === "") {
            setMessage("Please enter a username");
            return;
        }
      
        if (formData.password === "" || formData.passwordConfirm === "") {
            setMessage("Please enter a password twice");
            return;
        }
      
        if (formData.firstname === "" || formData.lastname === "") {
            setMessage("Please enter your name");
            return;
        }
      
        if (formData.email === "") {
            setMessage("Please enter your email address");
            return;
        }
      
        if (formData.phoneNumber === "") {
            setMessage("Please enter your number");
            return;
        }
      
        try {
            /* Check if the username is already taken */

            fetch(
                `http://localhost:5000/user/isUsernameTaken/${formData.username}`,
                {
                    method: "GET",
                }
            )
            .then(response => {
                if (!response.ok) {
                    // Handle the response status if it's not successful (e.g., 404, 500, etc.)
                    throw new Error("Network response was not ok");
                }

                return response.json(); // Parse the response JSON
            })
            .then(data => {        
                if (data.message !== "") {
                    setMessage(data.message)
                    return;
                }

                // Checking if the passwords match
                if (formData.password !== formData.passwordConfirm) {
                    setMessage("Error, passwords do not match!");
                    return;
                }
            
                // We need to make sure that the registree has selected at least one of the roles
                if (!formData.isTenant && !formData.isLandlord) {
                    setMessage("Please choose a role in the app");
                    return;
                }
            
                // Handle other conditions and submit the form data
                // Changing the isApproved state to false if the user wants to be a landlord
                if (formData.isLandlord) {
                    setUserIsApprovred(false);
                
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        isApproved: !prevFormData.isApproved,
                    }));
                }
            
                // Copying the form data to pass them as the request body
                const formDataCopy = { ...formData };
                // New user is not admin
                formDataCopy.isAdmin = false;

                // Bugfix: this is how we set the isApproved field in the user
                // User will not be approved initially if they want to be landlord
                formDataCopy.isApproved = !formDataCopy.isLandlord;

                const registerOptions = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: formDataCopy.id,
                        username: formDataCopy.username,
                        password: formDataCopy.password,
                        isAdmin: formDataCopy.isAdmin,
                        isLandlord: formDataCopy.isLandlord,
                        isTenant: formDataCopy.isTenant
                    })
                }

                // Generating and validating a JSON Web Token for the user
                fetch("http://localhost:5000/user/generateToken", registerOptions)
                .then(response => {
                    if (!response.ok) {
                    throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then(data => {
                    const token = data.token;
                    setAuthToken(token); // Update the authToken value

                    // Request token validation from the server
                    return fetch("http://localhost:5000/user/validateToken", {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                })
                .then(validationResponse => {
                    if (!validationResponse.ok) {
                        throw new Error("Token validation failed");
                    }

                    // Token validation succeeded, now you can save the token in the session data
                    sessionStorage.setItem("token", authToken);
                })
                .catch(error => {
                    console.error(error);
                    // Handle the error here, e.g., show an error message to the user
                });
            
                // The request is a Post request with the copy of the form data object as JSON body
                const requestOptions = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formDataCopy),
                };
            
                // Call the API to add the user
                fetch("http://localhost:5000/user/addUser", requestOptions);
            
                setIsRegistered(true);
                props.onRegistrationComplete()
            })
            .catch(error => {
                console.log(error);
            })
        } catch (error) {
            console.log(error);
            setMessage("Failed to add user. Please try again later.");
        }
    }
      

    return (
        <main className="App-signup-form-container">
            {!isRegistered && <form className="App-signup-form" onSubmit={handleSubmit}>
                {/* Any error will be printed to the user here */}
                {message !== "" && <h3 className="App-signup-form-message">{message}</h3>}
                <h1>Let's Get You Started!</h1>
                <br />
                <div className="App-signup-form-inputs">
                    <div className="App-signup-form-text-inputs">
                        {textInputElements}
                    </div>
                    <div className="App-signup-form-other-inputs">
                        <div className="App-signup-form-image-container">
                            {/* Profile picture section in the form, not working yet, it is here because of looks */}
                            <h3>Add your Profile Picture</h3>
                            <div className="App-signup-form-image">
                                <input
                                    id="ProfilePicture"
                                    type="file"
                                    className="App-signup-form-image-uploader"
                                    name="image"
                                    onChange={handleChange}
                                    value={formData.image}
                                    accept="image/png, image/jpeg, image/jpg"
                                />
                                <label htmlFor="ProfilePicture"><img src={formData.image !== "" ? formData.image : "https://i.pinimg.com/originals/46/72/f8/4672f876389036583190d93a71aa6cb2.jpg"} alt="prof"/></label>
                            </div>
                        </div>
                        <h3>Choose any of the roles below: </h3>
                        <p>You can choose either one or both</p>
                        {/* Checkboxes to let the user select the desired roles */}
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
                    Sign up
                </button>
                {/* Redirecting to login if needed */}
                <p>Already have an <Link to='/login'>Account</Link>?</p>
            </form>}
            {isRegistered && userIsApproved && <div className="App-approved">
                {/* Letting the user know they are successfully registered and approved, giving them a link tor retrun to the home page */}
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Eo_circle_light-green_checkmark.svg/2048px-Eo_circle_light-green_checkmark.svg.png" alt="success"/>
                <h2>Sucessfully Registered</h2>
                <h4>Return to <Link to="/" style={{color: "black", textDecoration: 'none'}}>Home Page</Link></h4>
            </div>}
            {isRegistered && !userIsApproved && <div className="App-waiting-for-approval">
                {/* Letting the user know they are successfully registered but need to be approved as landlord, giving them a link tor retrun to the home page */}
                <img src="https://icones.pro/wp-content/uploads/2021/03/icone-d-horloge-rouge.png" alt="pending"/>
                <h2>Waiting for approval to become landlord</h2>
                <h4>Return to <Link to="/" style={{color: "#d04b4d", textDecoration: 'none'}}>Home Page</Link></h4>
            </div>}
        </main>
    )
}