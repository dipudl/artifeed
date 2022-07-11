import React from "react";
import './Login.css';
import LogoAuth from '../../assets/logo-auth.svg';
import { Link } from 'react-router-dom';

export default function Login() {
    return (
        <div className="auth-background">
            <div className="container">

                <div className="brand-container">
                    <img src={LogoAuth} alt="logo" />
                    <h2>ARTIFEED</h2>
                </div>

                <div className="auth-form">
                    <div className="single-input">
                        <label for="email">Email</label>
                        <input name="email" type="email" required />
                    </div>

                    <div className="single-input password-input">
                        <label for="password">Password</label>
                        <input name="password" type="password" required />
                    </div>

                    <p className="forgot-password">Forgot password?</p>

                    <button type="submit">Login</button>

                    <p className="alt-auth-info">Not a member? <Link className="auth-link" to="/register">Sign up now</Link></p>
                </div>
            </div>
        </div>
    );
}