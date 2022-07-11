import React from "react";
import './Search.css';
import SearchIcon from "../../assets/search.svg";

export default function Search() {
    return (
        <div className="search-layout">
            <input type="text"/>
            <img src={SearchIcon} alt="search" />
        </div>
    );
}