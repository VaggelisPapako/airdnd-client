import React from 'react';
import { Link } from 'react-router-dom';

// Props contains all the "arguments" that are passed to the component from the parent component
export default function NavbarButton(props) {
  return (
    <li className={props.className} >
      {/* Each navbar button is a link to another route in the app */}
      <Link to={props.path}>{props.name}</Link>
    </li>
  );
}
