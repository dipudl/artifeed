import React, { useEffect, useRef, useState } from "react";
import './Auth.css';
import LogoAuth from '../../assets/logo-auth.svg';
import { Link } from 'react-router-dom';
import axios from "../../api/axios";

const REGISTER_URL = "/register";


export default function Register() {
    // set focus on firstName when component loads
    const firstNameRef = useRef();
    // set focus on error message especially for screen reader to read when error happens
    const errRef = useRef();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    const [password, setPassword] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    // set focus on first input when component loads
    useEffect(() => {
        firstNameRef.current.focus();
    }, [])

    useEffect(() => {
        const result = password.length >= 6;
        setValidPwd(result);
    }, [password]);

    // empty out error message when email or password input field changes
    useEffect(() => {
        setErrMsg('');
    }, [email, password])

    const handleSubmit = async (e) => {
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

            console.log(response.data);
            // console.log(response.accessToken);
            // console.log(JSON.stringify(response));
            setSuccess(true);
        } catch(err) {
            if(!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 409) {
                setErrMsg('Email already taken')
            } else {
                setErrMsg('Registration Failed');
            }

            // errRef.current.focus();
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

                        <button className="auth-form-submit" type="submit">Register</button>
                    </form>

                    <p className="alt-auth-info">Already a member? <Link className="auth-link" to="/login">Login</Link></p>
                </div>
            </section>
        </div>
    );
}