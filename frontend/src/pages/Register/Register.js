import React from "react";
import './Register.css';
import LogoAuth from '../../assets/logo-auth.svg';
import { Link } from 'react-router-dom';

export default function Register() {
    return (
        <div className="auth-background">
            <div className="container">

                <div className="brand-container">
                    <img src={LogoAuth} alt="logo" />
                    <h2>ARTIFEED</h2>
                </div>

                <div className="auth-form">
                    <div className="name-container">
                        <div className="single-input">
                            <label for="first_name">First name</label>
                            <input name="first_name" type="text" required />
                        </div>
                        <div className="single-input">
                            <label for="last_name">Last name</label>
                            <input name="last_name" type="text" required />
                        </div>
                    </div>

                    <div className="single-input">
                        <label for="email">Email</label>
                        <input name="email" type="email" required />
                    </div>

                    <div className="single-input">
                        <label for="password">Password</label>
                        <input name="password" type="password" required />
                    </div>

                    <button type="submit">Register</button>

                    <p className="alt-auth-info">Already a member? <Link className="auth-link" to="/login">Login</Link></p>
                </div>
            </div>
        </div>
    );
}