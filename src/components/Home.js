import React, {useState, useEffect} from 'react';
import AdminHome from './AdminHome';
import "react-datepicker/dist/react-datepicker.css";
import './Home.css';
import TextInput from './TextInput';
import DatePicker from "react-datepicker";
import dayjs from "dayjs";
import LandlordHome from "./LandlordHome";

export default function Home(props) {

    const [isAdmin, setIsAdmin] = useState(false) 
    const [isLandlord, setIsLandlord] = useState(false)
    const [isTenant, setIsTenant] = useState(false)
    const [isAnonymous, setIsAnonymous] = useState(true)

    const [hasSearched, setHasSearched] = useState(false)
    const [hasSearchedOnce, setHasSearchedOnce] = useState(false)
    const [searchResults, setSearchResults] = useState([])

    useEffect(() => {

        if(!props.token) {
            return
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
                // Passing the information for the role of the user
                setIsAdmin(decodeData.isAdmin);
                setIsLandlord(decodeData.isLandlord);
                setIsTenant(decodeData.isTenant);
                setIsAnonymous(false)
            })
            .catch(error => {
                console.error(error);
                // Handle the error here, e.g., show an error message to the user
            });

        })
        .catch(error => {
            console.error(error);
            // Handle the error here, e.g., show an error message to the user
        });

    }, [props.token])

    const currentDate = new Date();

    const [formData, setFormData] = useState({
        neighborhood: "",
        city: "",
        country: "",
        checkInDate: currentDate,
        checkOutDate: currentDate,
        numPeople: "",
    })

    // Only the home page for the admin is ready now
    const locationInputs = [
        { id:1, type: "text", placeholder: "Country", className: "App-home-form-location-input", name: "country", value: formData.country},
        { id:2, type: "text", placeholder: "City", className: "App-home-form-location-input", name: "city", value: formData.city},
        { id:3, type: "text", placeholder: "Neighborhood", className: "App-home-form-location-input", name: "neighborhood", value: formData.neighborhood}
    ]

    const dateInputs = [
        { id: 4, placeholder: "Check In", name: "checkInDate", className: "App-home-form-date-input", selected: formData.checkInDate, minDate: new Date()},
        { id: 5, placeholder: "Check Out", name: "checkOutDate", className: "App-home-form-date-input", selected: formData.checkOutDate, minDate: formData.checkInDate },
      ];

    const textInputs = [
        { id:6, type: "text", placeholder: "Number Of Guests", className: "App-home-form-text-input", name: "numPeople", value: formData.numPeople},
    ]

    const locationElements = locationInputs.map(locationInput => (
        <TextInput
            key={locationInput.id}
            type={locationInput.type}
            placeholder={locationInput.placeholder}
            className={locationInput.className}
            name={locationInput.name}
            value={locationInput.value}
            onChange={(event) => handleChange(event)}
        />
    ));
    
    const MyContainer = ({ className, children }) => {
        return (
          <div style={{ padding: "16px", background: "#216ba5", color: "#fff" }}>
            <div className={className}>
              <div style={{ position: "relative" }}>{children}</div>
            </div>
          </div>
        );
    };

    const dateElements = dateInputs.map((dateInput) => (
        <DatePicker
            key={dateInput.id}
            placeholderText={dateInput.placeholder}
            className={dateInput.className}
            selected={dateInput.selected}
            name={dateInput.name}
            dateFormat="dd/MM/yyyy"
            minDate={dateInput.minDate}
            calendarContainer={MyContainer}
            onChange={(date) => handleDateChange(dateInput.name, date)} // Use a separate handler for date changes
        />
    ));

    // Handler for date changes
    function handleDateChange(name, date) {
        setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: date, // Update the selected date
        }));
    }
        
    const textElements = textInputs.map(textInput => (
        <TextInput 
            key={textInput.id}
            type={textInput.type}
            placeholder={textInput.placeholder}
            className={textInput.className}
            name={textInput.name}
            value={textInput.value}
            onChange={(event) => handleChange(event)}
        />
    )); 
        

    // This is where we change the formData members accordingly
    function handleChange(event) {
        const {name, value, type, selected} = event.target
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: type === "date" ? selected : value
        }))
    }

    function handleSubmit(event) {
        
        event.preventDefault();

        // Update the hasSearched state for each condition
        setHasSearched(
            formData.city !== "" ||
            formData.country !== "" ||
            formData.neighborhood !== "" ||
            formData.checkInDate !== null ||
            formData.checkOutDate !== null ||
            formData.numPeople !== ""
        );

        // Update the hasSearched state for each condition
        setHasSearchedOnce(
            formData.city !== "" ||
            formData.country !== "" ||
            formData.neighborhood !== "" ||
            formData.checkInDate !== null ||
            formData.checkOutDate !== null ||
            formData.numPeople !== ""
        );
    }

    // Bugfix so that the search button works at the first search submission
    // Use the useEffect hook to trigger the search when hasSearched changes
    useEffect(() => {
        if (hasSearched) {
            // Construct the URL and perform the search
            const formDataCopy = { ...formData };

            const searchParams = new URLSearchParams();

            formDataCopy.checkInDate = dayjs(formDataCopy.checkInDate).format("YYYY/MM/DD")
            formDataCopy.checkOutDate = dayjs(formDataCopy.checkOutDate).format("YYYY/MM/DD")

            for (const key in formDataCopy) {
                if (formDataCopy.hasOwnProperty(key) && (formDataCopy[key] !== "" || formDataCopy[key] !== null)) {
                    console.log(formDataCopy[key])
                    searchParams.append(key, formDataCopy[key]);
                }
            }

            const url = `http://localhost:5000/listing/searchListings?${searchParams.toString()}`;

            const searchOptions = {
                method: 'GET',
            };

            // Search works only if all fields are filled
            fetch(url, searchOptions)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Search failed");
                    }
                    return response.json();
                })
                .then((data) => {
                    setSearchResults(data.results);
                })
                .catch(error => {
                    console.error("Error:", error);
                });
        }

        // Bugfix so that search works continuously
        setHasSearched(false)
    }, [hasSearched]);

    useEffect(() => {
        console.log(searchResults)
    }, [searchResults])


    const resultElements = searchResults.map((searchResult) => (
        <div key={searchResult.id} className='App-home-template-result'>
            <h6>{searchResult.name}</h6>
            <h6>{searchResult.description}</h6>
        </div> 
    ))
    
    return(
        <main className='App-home'>
            {isAdmin && <AdminHome token={props.token}/>}
            {!isAdmin && (isTenant || isAnonymous) && <div className='App-tenant-home'>
                <form onSubmit={handleSubmit} className='App-home-form'>
                    <div className='App-home-form-details'>
                        <div className='App-home-form-location'>
                            <h3>Location</h3>
                            <div className='App-home-form-location-inputs'>
                                {locationElements}
                            </div> 
                        </div>
                        <div className='App-home-form-date'>
                            <h3>Check In/Out Dates</h3>
                            <div className='App-home-form-date-inputs'>
                                {dateElements}
                            </div>
                        </div>
                        <div className='App-home-form-other'>
                            <div className='App-home-form-text'>
                                <h3>Number Of Guests</h3>
                                <div className='App-home-form-text-inputs'>
                                    {textElements}
                                </div> 
                            </div>
                            <div className='App-home-form-submit-container'>
                                <button className='App-home-form-submit-button'>Search</button>
                            </div>
                        </div>           
                    </div>
                </form>
                <div className='App-home-search-results'>
                    {hasSearchedOnce && resultElements}
                </div>  
            </div>}
            {!isAdmin && !isTenant && isLandlord && <LandlordHome token={props.token}/>}
        </main>
    )
}