import React from "react";

// Props contains all the "arguments" that are passed to the component from the parent component
export default function TextInput(props) {

    return(
        <input 
            type={props.type} 
            placeholder={props.placeholder}
            className={props.className}
            name={props.name}
            onChange={props.onChange}
            value={props.value}
        />
    )
}