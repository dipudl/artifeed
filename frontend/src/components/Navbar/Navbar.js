import React from "react";
import { Link, NavLink } from "react-router-dom";
import logo from '../../assets/logo.svg'
import './Navbar.css'

function Navbar() {
  return (
    <nav className={"navbar"}>
      <Link className={"logolink"} to="/">
        <img className={"logo"} src={logo} alt="logo"/>
        <h2 className={"logotext"}>ARTIFEED</h2>
      </Link>
      <div className="navlink-container">
        <NavLink className={"navlink"} to="/login">Login</NavLink>
        <NavLink className={"navlink filled"} to="/register">Create account</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;