import React from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
    return (
        <div>
            <h1 style={{color: "black"}}>Hi. This is Dashboard.</h1>
            <Link to="/">
                <button className="hero-btn">Go to home</button>
            </Link>
        </div>
    );
}