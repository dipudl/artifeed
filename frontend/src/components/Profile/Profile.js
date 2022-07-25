import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate, useLocation } from "react-router-dom";

const PROFILE_URL = "/profile";

export default function Profile() {
    const [profileDetails, setProfileDetails] = useState();
    const [errMsg, setErrMsg] = useState();
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
                isMounted && setProfileDetails(response.data) && setErrMsg('');

                console.log(response.data);
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
            <h1>My profile</h1>
            { errMsg
                ? <p style={{color:'black'}}>{errMsg}</p>
                : profileDetails
                    ? <p style={{color:'black'}}>{`${profileDetails.first_name} ${profileDetails.last_name}`}</p>
                    : <p style={{color:'black'}}>Loading...</p>
            }
        </div>
    );
}