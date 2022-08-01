import React from "react";
import { Link, NavLink } from "react-router-dom";
import logo from '../../assets/logo.svg'
import useAuth from "../../hooks/useAuth";
import './Navbar.css'

function Navbar({ data }) {
  const { auth } = useAuth();

  return (
    <nav className={"navbar"}>
      <Link className={"logolink"} to="/">
        <img className={"logo"} src={logo} alt="logo"/>
        <h2 className={"logotext"}>ARTIFEED</h2>
      </Link>
      {
        !auth?.accessToken
        ?
        <div className="navlink-container">
          <NavLink className={"navlink"} to={data?.buttonUnfilled?.path || "/login"}>
            {data?.buttonUnfilled?.text || "Login"}
          </NavLink>
          <NavLink className={"navlink filled"} to={data?.buttonFilled?.path || "/register"}>
            {data?.buttonFilled?.text || "Create account"}
          </NavLink>
        </div>
        :
        <div className="navlink-container">
          <NavLink className={"navlink"} to={data?.buttonUnfilled?.authorized_path || "/profile"}>
            {data?.buttonUnfilled?.authorized_text || "Profile"}
          </NavLink>
          <NavLink className={"navlink filled"} to={data?.buttonFilled?.authorized_path || "/article"}>
            {data?.buttonFilled?.authorized_text || "Dashboard"}
          </NavLink>
        </div>
      }
    </nav>
  );
}

export default Navbar;