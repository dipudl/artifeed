import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate, useLocation } from "react-router-dom";
import useLogout from "../../hooks/useLogout";
import Profile from "../../components/Profile/Profile";
import Article from "../../components/Article/Article";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./Dashboard.css";

export default function Dashboard() {
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const location = useLocation();
    const logout = useLogout();

    const signOut = async () => {
        try {
            await logout();
            navigate('/');
        } catch (err) {
            // Logout failed

            if(!err?.response) {
                // 'No Server Response'

            } else if(err.response?.data?.message) {
                // err.response?.data?.message

            } else if(err.message) {
                // err.message
                
            } else {
                // 'Logout failed. Please try again'
            }
        }
    }

    return (
        <div>
            <Sidebar />
            
        </div>
    );
}