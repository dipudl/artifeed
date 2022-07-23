import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate, useLocation } from "react-router-dom";
import useLogout from "../../hooks/useLogout";

const PROFILE_URL = "/profile";

export default function Dashboard() {
    const [profileDetails, setProfileDetails] = useState();
    const [errMsg, setErrMsg] = useState();
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

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const getProfileDetails = async () => {
            try {
                const response = await axiosPrivate.get(PROFILE_URL, {
                    signal: controller.signal
                });
                isMounted && setProfileDetails(response.data);
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

    return (
        <div>
            { profileDetails &&
                <p style={{color:'black'}}>{JSON.stringify(profileDetails)}</p>
            }
            <Link to="/">
                <button className="hero-btn">Go to home</button>
            </Link>
            <br />
            <button onClick={signOut}>Logout</button>
        </div>
    );
}