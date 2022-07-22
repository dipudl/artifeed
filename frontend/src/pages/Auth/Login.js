import React from "react";
import './Auth.css';
import LogoAuth from '../../assets/logo-auth.svg';
import { Link } from 'react-router-dom';

export default function Login() {
    return (
        <div className="auth-background">
            <section className="container">

                <Link className="brand-container" to="/">
                    <img src={LogoAuth} alt="logo" />
                    <h2>ARTIFEED</h2>
                </Link>

                <div className={"auth-body"}>
                    <form className="auth-form" action="/login">
                        <div className="single-input">
                            <label htmlFor="email">Email</label>
                            <input name="email" type="email" required />
                        </div>

                        <div className="single-input password-input">
                            <label htmlFor="password">Password</label>
                            <input name="password" type="password" minLength={6} required />
                        </div>

                        <p className="forgot-password">Forgot password?</p>

                        <button className="auth-form-submit" type="submit">Login</button>
                    </form>

                    <p className="alt-auth-info">Not a member? <Link className="auth-link" to="/register">Sign up now</Link></p>
                </div>    
            </section>
        </div>
    );
}