import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminHome.css';

export default function AdminHome(props) {

    const [users, setUsers] = useState([])
    const navigate = useNavigate();
    
    // Retrieve all users
    useEffect(() => {

        fetch('http://localhost:5000/user/validateToken', {
            method: 'GET',
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
                if(decodeData.isAdmin) {
                    fetch('http://localhost:5000/user/getAllUsers')
                    .then((res) => res.json())
                    .then((data) => setUsers(data.message))
                }
                
            })
            .catch(error => {
                console.error(error);
            })

        })
        .catch(error => {
            console.error(error);
        })
    }, [props.token])

    // Navigating the admin to each individual user's info page
    async function handleClick(event, user) {
        const id = user.id

        navigate(`/userinfo/${id}`, { state: { token: props.token } })
    }

    // This is every user row in the admin table
    const userElements = users.map((user) => 
        (<tr onClick={event => handleClick(event, user)} key={user.id} className='App-user-info'>
            <td>{user.username}</td>
            <td>{user.firstname} {user.lastname}</td>
            <td>{user.email}</td>
            <td>
                {user.isAdmin && `Admin`} {user.isTenant && `Tenant`} {user.isLandlord && `Landlord`}
            </td>
            <td>{user.isApproved ? "User Approved" : "User not Approved"}</td> 
        </tr>)
    )

    return (
        <div className='App-admin-home'>
            <h1>User Info</h1>
            <br />
            <div className='scroll-container'>
                <table className='scroll'>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Fullname</th>
                            <th>Email</th>
                            <th>Roles</th>
                            <th>Approved State</th>
                        </tr>
                    </thead>
                    <tbody className='scroll-body'>
                        {userElements}
                    </tbody>  
                </table>
            </div>
        </div>
    )
}