import React from "react";
import { Link, NavLink } from "react-router-dom";
import logo from '../../assets/logo.svg'
import './Navbar.css'

function Navbar({data}) {
    return (
        <nav className={"navbar"}>
            <Link className={"logolink"} to="/">
            <img className={"logo"} src={logo} alt="logo"/>
            <h2 className={"logotext"}>ARTIFEED</h2>
            </Link>
            <div className="navlink-container">
            <button
                onClick={() => data.buttonUnfilled.callback()}
                className={"navlink"}
                disabled={data.buttonUnfilled.disabled}
            >
                {data.buttonUnfilled.label}
            </button>
            <button
                onClick={() => data.buttonFilled.callback()}
                className={"navlink filled"}
                disabled={data.buttonFilled.disabled}
            >
                {data.buttonFilled.label}
            </button>
            </div>
        </nav>
    );
}

export default Navbar;