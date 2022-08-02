import React, { useEffect, useState } from "react";
import './ChipLayout.css';
import IconError from '../../assets/ic_error.svg';
import IconLoading from '../../assets/ic_loading.svg';
import axios from "../../api/axios";
const CATEGORIES_URL = "/home/categories";

export default function ChipLayout() {
    const [categoryList, setCategoryList] = useState([]);
    // 0 = normal, 1 = loading, 2 = error, 3 = empty response
    const [categoryListLoadingState, setCategoryListLoadingState] = useState(0);
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const getCategories = async () => {
            setCategoryListLoadingState(1);

            try {
                const response = await axios.get(CATEGORIES_URL, {
                    signal: controller.signal
                });

                const data = response.data;
                if(isMounted) {
                    setCategoryList(data.categories);
                    setErrMsg('');

                    data.categories.length === 0
                    ? setCategoryListLoadingState(3)
                    : setCategoryListLoadingState(0);
                }

            } catch (err) {
                console.log(err);

                if(!err?.response) {
                    setErrMsg('No Server Response');
    
                } else if(err.response?.data?.message) {
                    setErrMsg(err.response?.data?.message);
    
                } else if(err.message) {
                    setErrMsg(err.message);
                    
                } else {
                    setErrMsg('An error occurred');
                }

                setCategoryListLoadingState(2);
            }
        }

        getCategories();

        return () => {
            isMounted = false;
            controller.abort();
        }
    }, []);

    return (
        {
            0:
                <div className="chip-layout">
                    <p className="chip active">All</p>
                    {categoryList.map(category => <p key={category.category_id} className="chip">{category.name}</p>)}
                </div>,
            1:
                <div className={"auth-info info-color"}>
                    <img className="rotate" src={IconLoading} alt="icon" />
                    <p className="auth-info-text">Fetching...</p>
                </div>,
            2:
                <div className={"auth-info error-color"}>
                    <img src={IconError} alt="icon" />
                    <p className="auth-info-text">{errMsg}</p>
                </div>,
            3:
                <div className={"auth-info info-color"}>
                    <img src={IconLoading} alt="icon" />
                    <p className="auth-info-text">No articles found</p>
                </div>
        }[categoryListLoadingState]
    );
}