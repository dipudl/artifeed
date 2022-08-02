import React from "react";
import './Error404.css';

import Navbar from "../../components/Navbar/Navbar";

export default function Error404() {
    return (
        <div className="page-not-found-container">
            <Navbar />
            <div className="text-404">
                <h1>404 page not found</h1>
            </div>
        </div>
    );
}