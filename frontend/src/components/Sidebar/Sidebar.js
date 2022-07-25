import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import LogoDashboard from '../../assets/logo-dashboard.svg';
import IconArticle from '../../assets/ic_article.svg';
import IconProfile from '../../assets/ic_profile.svg';
import IconLogout from '../../assets/ic_logout.svg';
import { useNavigate } from "react-router-dom";
import useLogout from "../../hooks/useLogout";
import { Outlet } from 'react-router-dom';

import './Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
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
        <p></p>
        <div className='sidebar-container'>
            <div className='sidebar'>
                <Link to='/' className='top-section'>
                    <img src={LogoDashboard} alt='logo' />
                    <h1 className='sidebar-brand-text'>ARTIFEED</h1>
                </Link>

                <NavLink to='/profile' className={(navData) => 'sidebar-link ' + (navData.isActive? 'sidebar-tab-active': '')}>
                    <img src={IconProfile} alt='icon' />
                    <p>Profile</p>
                </NavLink>

                <NavLink to='/article' className={(navData) => 'sidebar-link ' + (navData.isActive? 'sidebar-tab-active': '')}>
                    <img src={IconArticle} alt='icon' />
                    <p>Article</p>
                </NavLink>

                <hr className='sidebar-hr' />

                <div onClick={signOut} className="sidebar-link">
                    <img src={IconLogout} alt='icon' />
                    <p>Log out</p>
                </div>                
            </div>
            <div className='switched-content'>
                <Outlet />
            </div>
        </div>
        </div>
    );
}

export default Sidebar;