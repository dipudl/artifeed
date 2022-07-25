import React, { useEffect, useRef, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate, useLocation } from "react-router-dom";
import IconError from '../../assets/ic_error.svg';
import IconLoading from '../../assets/ic_loading.svg';
import './Profile.css';

const PROFILE_URL = "/profile";
const PROFILE_UPDATE_URL = "/profile/details";
const PROFILE_PIC_UPDATE_URL = "/profile/image";
const USERNAME_REGEX = /^[a-z0-9_]{2,30}$/;

export default function Profile() {
    const [profileDetails, setProfileDetails] = useState();
    const [profilePicUrl, setProfilePicUrl] = useState();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [description, setDescription] = useState('');
    const fileInputRef = useRef()
    const [picUploadProgress, setPicUploadProgress] = useState(0);

    // profileState: 0 = normal, 1 = updating, 2 = error
    const [profileState, setProfileState] = useState(0);
    const [picUploadState, setPicUploadState] = useState(0);

    const [errMsg, setErrMsg] = useState('');
    const [picUploadErrMsg, setPicUploadErrMsg] = useState('');
    const [updateErrMsg, setUpdateErrMsg] = useState('');

    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const getProfileDetails = async () => {
            try {
                const response = await axiosPrivate.get(PROFILE_URL, {
                    signal: controller.signal
                });

                const data = response.data;
                isMounted && setProfileDetails(data) && setErrMsg('');

                setProfilePicUrl(data.image_url);
                setFirstName(data.first_name);
                setLastName(data.last_name);
                setEmail(data.email);
                setUsername(data.username);
                setDescription(data.description || '');

            } catch (err) {
                console.log(err);

                if(!err?.response) {
                    setErrMsg('No Server Response');
    
                } else if (err.response?.status === 401) {
                    setErrMsg('Session expired. Redirecting to login...');
                    navigate('/login', { state: { from: location }, replace: true})
    
                } else if(err.response?.data?.message) {
                    setErrMsg(err.response?.data?.message);
    
                } else if(err.message) {
                    setErrMsg(err.message);
                    
                } else {
                    setErrMsg('An error occurred');
                }
            }
        }

        getProfileDetails();

        return () => {
            isMounted = false;
            controller.abort();
        }
    }, []);

    const updateDetails = async (e) => {
        setProfileState(1);
        e.preventDefault();

        try {
            const response = await axiosPrivate.patch(
                PROFILE_UPDATE_URL,
                JSON.stringify({
                    firstName, lastName, email, username, description
                }),
                {
                    headers: { 'Content-Type': 'application/json'},
                    withCredentials: true
                }
            );

            console.log(response);
            setProfileState(0);

        } catch(err) {
            if(!err?.response) {
                setUpdateErrMsg('No Server Response');

            } else if (err.response?.status === 401) {
                setUpdateErrMsg('Session expired. Redirecting to login...');
                navigate('/login', { state: { from: location }, replace: true})

            } else if(err.response?.data?.message) {
                setUpdateErrMsg(err.response?.data?.message);

            } else if(err.message) {
                setUpdateErrMsg(err.message);
                
            } else {
                setUpdateErrMsg('Profile update failed');
            }

            setProfileState(2);
        }
    }

    const fileSelectedHandler = async (e) => {
        const image = e.target.files[0];
        if(image.size > 2097152) {
            setPicUploadState(2);
            setPicUploadErrMsg('File is too large. Maximum size limit is 2MB.');
            return;
        }

        const fileData = new FormData();
        fileData.append('uploaded_file', image);
        setPicUploadState(1);

        try {
            const response = await axiosPrivate.patch(
                PROFILE_PIC_UPDATE_URL,
                fileData,
                {
                    headers: { 'Content-Type': 'application/json'},
                    withCredentials: true,
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round(progressEvent.loaded/progressEvent.total * 100);
                        setPicUploadProgress(progress);
                    }
                }
            );

            setProfilePicUrl(response.data.image_url);
            setPicUploadState(0);

        } catch(err) {
            if(!err?.response) {
                setPicUploadErrMsg('No Server Response');

            } else if (err.response?.status === 401) {
                setPicUploadErrMsg('Session expired. Redirecting to login...');
                navigate('/login', { state: { from: location }, replace: true})

            } else if(err.response?.data?.message) {
                setPicUploadErrMsg(err.response?.data?.message);

            } else if(err.message) {
                setPicUploadErrMsg(err.message);
                
            } else {
                setPicUploadErrMsg('Profile picture upload failed');
            }

            setPicUploadState(2);
        }
    }

    useEffect(() => {
        if(!username.match(USERNAME_REGEX)) {
            setUpdateErrMsg('Username can only contain a-z, 0-9 and underscore and must have 3 to 30 characters');
            setProfileState(2);
        } else {
            setProfileState(profileState !== 2? profileState: 0)
            setUpdateErrMsg('');
        }
    }, [email, username]);

    return (
        <div className="profile-parent">
            { errMsg
                ? <p style={{color:'black'}}>{errMsg}</p>
                : !profileDetails
                    ? <p style={{color:'black'}}>Loading...</p>
                    :
                    (
                        <div className="profile-body">
                            <h1 className="tab-title">My profile</h1>
                            <div className="profile-details">
                                <div className="profile-image-container">
                                    <img className="profile-picture-in-profile" src={profilePicUrl} alt="profile_image" />

                                    <input
                                        style={{display: 'none'}}
                                        type="file"
                                        accept="image/png, image/jpeg"
                                        onChange={fileSelectedHandler}
                                        ref={fileInputRef}
                                    />
                                    <button onClick={() => fileInputRef.current.click()} className={"change-profile-pic-btn"} disabled={picUploadState === 1}>
                                        {picUploadState === 1? picUploadProgress + '%': 'Change'}
                                    </button>
                                </div>

                                {{
                                    1:
                                    <div className={"auth-info info-color"}>
                                        <img className="rotate" src={IconLoading} alt="icon" />
                                        <p className="auth-info-text">Uploading profile picture...</p>
                                    </div>,
                                    2:
                                    <div className={"auth-info error-color"}>
                                        <img src={IconError} alt="icon" />
                                        <p className="auth-info-text">{picUploadErrMsg}</p>
                                    </div>
                                }[picUploadState]}
                            
                                <form className="profile-details-form" onSubmit={updateDetails}>
                                    <div className="name-container">
                                        <div className="single-input">
                                            <label htmlFor="first_name">First name</label>
                                            <input
                                                name="first_name"
                                                type="text"
                                                id="first_name"
                                                value={firstName}
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
                                                value={lastName}
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
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="single-input">
                                        <label htmlFor="username">Username</label>
                                        <input
                                            name="username"
                                            type="text"
                                            id="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            minLength={2}
                                            required
                                        />
                                    </div>

                                    <div className="single-input">
                                        <label htmlFor="description">Description</label>
                                        <textarea
                                            name="description"
                                            type="text"
                                            id="description"
                                            maxLength="200"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
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
                                            <p className="auth-info-text">{updateErrMsg}</p>
                                        </div>
                                    }[profileState]}

                                    <button className="profile-update-submit" disabled={profileState === 1 || !username.match(USERNAME_REGEX)} type="submit">Update</button>
                                </form>
                            </div>
                        </div>
                    )
            }
        </div>
    );
}