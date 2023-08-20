import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import './Profile.css' // We are reusing some css from the profile component
import './PlaceInfo.css'

export default function PlaceInfo() {

    // Retrieving the id of the place from the url parameter
    const { id } = useParams()
    const location = useLocation();
    const token = location.state?.token

    // State variable with the current place
    const [place, setPlace] = useState({})
    const [landlordPlaces, setLandlordPlaces] = useState([])
    const [isTheLandlord, setIsTheLandlord] = useState(false)
    const [isTenant, setIsTenant] = useState(true)
    const [theLandlord, setTheLandlord] = useState({})

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

                // Verification for all roles in order to make the component reusable

                setIsTenant(decodeData.isTenant)

                if (decodeData.isLandlord) {
                    
                    fetch(`http://localhost:5000/listing/getPlacesByLandlordId/${decodeData.id}`)
                        .then((response) => response.json())
                        .then((data) => setLandlordPlaces(data.message))
                }

                fetch(`http://localhost:5000/listing/getListingById/${id}`)
                        .then((response) => response.json())
                        .then((data) => setPlace(data.message))
                        .then(() => {
                            fetch(`http://localhost:5000/user/getUserById/${place.userId}`)
                            .then((response) => response.json())
                            .then((data) => setTheLandlord(data.message))
                        })
            })
            .catch(error => {
                console.error(error);
            })
        })
        .catch(error => {
            console.error(error);
        })
        
    }, [id, token])

    useEffect(() => {

        for (const placeItem of landlordPlaces) {
            if (parseInt(placeItem.id) === parseInt(id)) {
                setIsTheLandlord(true);
                break; // No need to continue looping once a match is found
            }
        }

    }, [id, landlordPlaces]);

    return (
        <main className='App-place-container'>
            <div className='App-place'>
                {isTheLandlord && <Link to='/' style={{position: "relative", left: "35%"}}>
                    <div className="App-profile-edit">
                        <div className="App-profile-edit-button">
                            <div className="App-profile-edit-cog">
                                <img src="https://icon-library.com/images/white-gear-icon-png/white-gear-icon-png-12.jpg" alt="Edit-profile" className="App-profile-edit-favicon"/>
                            </div>  
                            <span>Edit Place</span>
                        </div>
                    </div>
                </Link>}
                <br/><br/>
                <div className='App-place-info-container'>
                    <div className='App-place-visuals'>
                        <div className='App-place-photos'></div>
                        <div className='App-place-map'></div>
                    </div>
                    <div className='App-place-text-info'>
                        <h2>{place.name}</h2>
                        <div>
                            <img src="https://static.vecteezy.com/system/resources/previews/001/189/080/original/star-png.png" alt="star" className="App-star"/>
                            <span>{place.reviewAvg} • </span>
                            <span><u>{place.reviewCount} <b>Reviews</b></u> • </span>
                            <span><u>{place.neighborhood} {place.city}, {place.country}</u></span>
                        </div>
                        <br></br>
                        <h3>{place.spaceType}</h3>{isTenant && !isTheLandlord && <h3>Host: {theLandlord.firstname} {theLandlord.lastname}</h3>}
                        <h3>Host: {theLandlord.firstname} {theLandlord.lastname}</h3>
                        <span>{place.address} • </span>
                        <span>{place.photos} • </span>
                        <span>{place.houseRules} • </span>
                        <span>{place.minimumLengthStay} • </span>
                        <span>{place.checkIn} • </span>
                        <span>{place.checkOut} • </span>
                        <span>{place.maxGuests} • </span>
                        <span>{place.bedsNumber} •</span>
                        <span>{place.bathroomsNumber} • </span>
                        <span>{place.bedroomsNumber} • </span>
                        <span>{place.squareMeters} • </span>
                        <span>{place.amenities} • </span>
                        <span>{place.spaceType} • </span>
                        <span>{place.minPrice} • </span>
                        <span>{place.dailyPrice} • </span>
                        <span>{place.map} • </span>
                        <span>{place.transit} • </span>
                        <span>{place.reviewCount} • </span>
                        <span>{place.reviewAvg} • </span>
                        <span>{place.hasLivingRoom} • </span>
                        <span>{place.description} • </span>
                        <span>{place.isBooked}</span>

                    </div>
                </div>
            </div>
        </main>
    )
}