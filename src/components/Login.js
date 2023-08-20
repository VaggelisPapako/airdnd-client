import React from "react";
import TextInput from './TextInput';
import './Login.css'
import { Link } from 'react-router-dom';

export default function Login(props) {

    /**
     * State that contains the data obtained from the form.
     * Changes whenever a field on the form changes
     */ 
    const [formData, setFormData] = React.useState({
        username: "",
        password: ""
    })

    const [message, setMessage] = React.useState("")

    /**
     * All the input fields inside the form
     * In our formData object, the name attribute of the input is the name of the respective field as well
     * In our formData object, the value attribute of the input is the value of respective the field as well
     */
    const textInputs = [
        {id:1, type: "text", placeholder: "Username", className: "App-login-form-input", name: "username", value: formData.username},
        {id:2, type: "password", placeholder: "Password", className: "App-login-form-input", name: "password", value: formData.password}
    ]

    // Login Input html elements
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

    async function handleSubmit(event) {
        event.preventDefault();
    
        try {
            // Check if the username exists
            const usernameTakenResponse = await fetch(
                `http://localhost:5000/user/isUsernameTaken/${formData.username}`,
                {
                    method: "GET",
                }
            );
    
            if (!usernameTakenResponse.ok) {
                throw new Error("Network response was not ok");
            }
    
            const usernameTakenData = await usernameTakenResponse.json();
    
            if (usernameTakenData.message === "") {
                setMessage(`User with username ${formData.username} does not exist`);
                return;
            }
    
            const userResponse = await fetch(
                `http://localhost:5000/user/getUserByUsername/${formData.username}`,
                {
                    method: "GET",
                }
            );
    
            if (!userResponse.ok) {
                throw new Error("Network response was not ok");
            }
    
            const userData = await userResponse.json();
            const user = userData.message;
    
            if (formData.password !== user.password) {
                setMessage("Incorrect password");
                return;
            }
    
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: user.id,
                    username: user.username,
                    password: user.password,
                    isAdmin: user.isAdmin,
                    isLandlord: user.isLandlord,
                    isTenant: user.isTenant
                })
            };
    
            const generateTokenResponse = await fetch("http://localhost:5000/user/generateToken", requestOptions);
    
            if (!generateTokenResponse.ok) {
                throw new Error("Network response was not ok");
            }
    
            const generateTokenData = await generateTokenResponse.json();
            const token = generateTokenData.token;
    
            const validationResponse = await fetch("http://localhost:5000/user/validateToken", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
    
            if (!validationResponse.ok) {
                throw new Error("Token validation failed");
            }
    
            sessionStorage.setItem("token", token);
            window.location.href = "/";
        } catch (error) {
            console.error(error);
            setMessage("Failed to login. Please try again later.");
        }
    }     

    return (
        <main className="App-login-form-container">
            <form className="App-login-form" onSubmit={handleSubmit}>
                {message !== "" && <h3 className="App-signup-form-message">{message}</h3>}
                <h1>Login</h1>
                <br />
                <div className="App-login-form-inputs">
                    <div className="App-login-form-text-inputs">
                        {textInputElements}
                    </div>
                </div>
                <br /><br /><br />
                {/* In React Submit input can be labeled as button inside forms */}
                <button 
                    className="App-login-form-submit"
                >
                    Login
                </button>
                {/* Redirecting to signup if needed */}
                <p>Don't have an account? <Link to='/signup'>Register!</Link></p>
            </form>
        </main>
    )
}