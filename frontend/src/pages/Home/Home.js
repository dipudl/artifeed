import React from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer";
import TopicArticle from "../../components/TopicArticles/TopicArticles";
import ChipLayout from "../../components/ChipLayout/ChipLayout";
import Search from "../../components/Search/Search";
import './Home.css'

export default function Home() {
    return (
        <div>
            <Navbar />
            
            <div className="herodiv">
                <h1>A Feed for<br/>Awesome Articles</h1>
                <h2>Write and discover your favourite articles on<br/>countless topics.</h2>
                <Link to="/article">
                    <button className="hero-btn">Start writing</button>
                </Link>
            </div>

            <div className="home-content">
                <div className="div-4">
                    <TopicArticle topic="Trending"/>
                    <TopicArticle topic="Popular"/>
                </div>
                <div className="div-2">
                    <Search />
                    <h2>Category</h2>
                    <ChipLayout />
                </div>
            </div>

            <Footer />
        </div>
    );
}