import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Auth.css';
import LogoAuth from '../../assets/logo-auth.svg';
import IconError from '../../assets/ic_error.svg';
import IconLoading from '../../assets/ic_loading.svg';
import useAuth from "../../hooks/useAuth";

import axios from "../../api/axios";
const REGISTER_URL = "/register";
const DASHBOARD_URL = "/article";

export default function Register() {
    const { setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.form?.pathname || DASHBOARD_URL;

    // set focus on firstName when component loads
    const firstNameRef = useRef();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // authState: 0 = normal, 1 = loading, 2 = error
    const [authState, setAuthState] = useState(0);
    const [errMsg, setErrMsg] = useState('');

    // set focus on first input when component loads
    useEffect(() => {
        firstNameRef.current.focus();
    }, [])

    /* useEffect(() => {
        const result = password.length >= 6;
        setValidPwd(result);
    }, [password]); */

    // empty out error message when email or password input field changes
    useEffect(() => {
        setAuthState(0);
        setErrMsg('');
    }, [firstName, lastName, email, password])

    const handleSubmit = async (e) => {
        setAuthState(1);
        e.preventDefault();

        try {
            const response = await axios.post(
                REGISTER_URL,
                JSON.stringify({
                    firstName, lastName, email, password
                }),
                {
                    headers: { 'Content-Type': 'application/json'},
                    withCredentials: true
                }
            );

            const accessToken = response?.data?.accessToken;
            setAuth({ email, accessToken })

            console.log("Data: ", accessToken, response.data);
            setAuthState(0);
            
            localStorage.setItem("persist", true);
            navigate(from, { replace: true });
        } catch(err) {
            if(!err?.response) {
                setErrMsg('No Server Response');

            } else if (err.response?.status === 409) {
                setErrMsg('Email is already registered. Please use another email address.');

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
                        <div className="name-container">
                            <div className="single-input">
                                <label htmlFor="first_name">First name</label>
                                <input
                                    name="first_name"
                                    type="text"
                                    id="first_name"
                                    ref={firstNameRef}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    minLength={2}
                                    required
                                />
                            </div>
                            <div className="single-input">
                                <label htmlFor="last_name">Last name</label>
                                <input
                                    name="last_name"
                                    type="text"
                                    id="last_name"
                                    onChange={(e) => setLastName(e.target.value)}
                                    minLength={2}
                                    required
                                />
                            </div>
                        </div>

                        <div className="single-input">
                            <label htmlFor="email">Email</label>
                            <input
                                name="email"
                                type="email"
                                id="email"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="single-input">
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

                        {{
                            1:
                            <div className={"auth-info info-color"}>
                                <img className="rotate" src={IconLoading} alt="icon" />
                                <p className="auth-info-text">Registering...</p>
                            </div>,
                            2:
                            <div className={"auth-info error-color"}>
                                <img src={IconError} alt="icon" />
                                <p className="auth-info-text">{errMsg}</p>
                            </div>
                        }[authState]}

                        <button className="auth-form-submit" disabled={authState === 1} type="submit">Register</button>
                    </form>

                    <p className="alt-auth-info">Already a member? <Link className="auth-link" to="/login">Login</Link></p>
                </div>
            </section>
        </div>
    );
}