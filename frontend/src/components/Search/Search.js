import React, { useState } from "react";
import './Search.css';
import SearchIcon from "../../assets/search.svg";
import { useNavigate } from "react-router-dom";

export default function Search({ placeholder }) {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if(search) {
            navigate(`/search?q=${search}`);
        }
    }

    return (
        <form className="search-layout" onSubmit={handleSearch}>
            <input
                placeholder={placeholder || "Search articles"}
                type="text"
                name="search"
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <input type="image" src={SearchIcon} alt="search" />
        </form>
    );
}