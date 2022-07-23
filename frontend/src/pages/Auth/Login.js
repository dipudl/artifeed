import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Auth.css';
import LogoAuth from '../../assets/logo-auth.svg';
import IconError from '../../assets/ic_error.svg';
import IconLoading from '../../assets/ic_loading.svg';
import useAuth from "../../hooks/useAuth";

import axios from "../../api/axios";
const LOGIN_URL = "/login";
const DASHBOARD_URL = "/dashboard";

export default function Login() {
    const { setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.form?.pathname || DASHBOARD_URL;

    // set focus on email input field when component loads
    const emailRef = useRef();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // authState: 0 = normal, 1 = loading, 2 = error
    const [authState, setAuthState] = useState(0);
    const [errMsg, setErrMsg] = useState('');

    // set focus on first input when component loads
    useEffect(() => {
        emailRef.current.focus();
    }, [])

    // empty out error message when email or password input field changes
    useEffect(() => {
        setAuthState(0);
        setErrMsg('');
    }, [email, password])

    const handleSubmit = async (e) => {
        setAuthState(1);
        e.preventDefault();

        try {
            const response = await axios.post(
                LOGIN_URL,
                JSON.stringify({ email, password }),
                {
                    headers: { 'Content-Type': 'application/json'},
                    withCredentials: true
                }
            );

            const accessToken = response?.data?.accessToken;
            setAuth({ email, password, accessToken })

            console.log("Data: ", accessToken, response.data);
            setAuthState(0);
            
            navigate(from, { replace: true });
        } catch(err) {
            if(!err?.response) {
                setErrMsg('No Server Response');

            } else if(err.response?.data?.message) {
                setErrMsg(err.response?.data?.message);

            } else if(err.message) {
                setErrMsg(err.message);
                
            } else {
                setErrMsg('Registration Failed');
            }

            setAuthState(2);
        }
    }

    return (
        <div className="auth-background">
            <section className="container">

                <Link className="brand-container" to="/">
                    <img src={LogoAuth} alt="logo" />
                    <h2>ARTIFEED</h2>
                </Link>

                <div className={"auth-body"}>
                    <form onSubmit={handleSubmit}>
                        <div className="single-input">
                            <label htmlFor="email">Email</label>
                            <input
                                name="email"
                                type="email"
                                id="email"
                                ref={ emailRef }
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="single-input password-input">
                            <label htmlFor="password">Password</label>
                            <input
                                name="password"
                                type="password"
                                id="password"
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={6}
                                required
                            />
                        </div>

                        <p className="forgot-password">Forgot password?</p>

                        {{
                            1:
                            <div className={"auth-info info-color"}>
                                <img className="rotate" src={IconLoading} alt="icon" />
                                <p className="auth-info-text">Authenticating...</p>
                            </div>,
                            2:
                            <div className={"auth-info error-color"}>
                                <img src={IconError} alt="icon" />
                                <p className="auth-info-text">{errMsg}</p>
                            </div>
                        }[authState]}

                        <button className="auth-form-submit" disabled={authState === 1} type="submit">Login</button>
                    </form>

                    <p className="alt-auth-info">Not a member? <Link className="auth-link" to="/register">Sign up now</Link></p>
                </div>    
            </section>
        </div>
    );
}