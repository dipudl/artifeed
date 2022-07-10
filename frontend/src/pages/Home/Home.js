import React from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import './Home.css'


export default function Home() {
    return (
        <div>
            <Navbar />

            <div className={"herodiv"}>
                <h1>A Feed for<br/>Awesome Articles</h1>
                <h2>Write and discover your favourite articles on<br/>countless topics.</h2>
                <Link to="/register">
                    <button className={"hero-btn"}>Start writing</button>
                </Link>
            </div>

            <div className="home-content">
                <div>
                    <div>
                        <h2 className="list-title">Trending</h2>

                    </div>
                    <div>
                        <h2 className="list-title">Popular</h2>
                        
                    </div>
                </div>
                <div>
                    {/* search box and categories */}

                </div>
            </div>  

        <Footer />

        </div>
    );
}