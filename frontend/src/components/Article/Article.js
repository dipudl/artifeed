import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate, useLocation } from "react-router-dom";

const ARTICLE_URL = "/article";

export default function Article() {
    const [articles, setArticles] = useState();
    const [errMsg, setErrMsg] = useState();
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const getProfileDetails = async () => {
            try {
                const response = await axiosPrivate.get(ARTICLE_URL, {
                    signal: controller.signal
                });
                isMounted && setArticles(response.data) && setErrMsg('');
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
            <h1>My articles</h1>
            { errMsg
                ? <p style={{color:'black'}}>{errMsg}</p>
                : (articles
                    ? <p style={{color:'black'}}>{articles}</p>
                    : <p style={{color:'black'}}>Loading...</p>)
            }
        </div>
    );
}