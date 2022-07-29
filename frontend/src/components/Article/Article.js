import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate, useLocation, Link } from "react-router-dom";

import IconNewArticle from "../../assets/ic_new_article.svg";
import IconSearch from "../../assets/search.svg";
import IconFilter from "../../assets/ic_filter.svg";

import './Article.css';
import MyArticle from "../MyArticle/MyArticle";
const ARTICLE_URL = "/article/my-articles";

export default function Article() {
    const [articles, setArticles] = useState();
    const [showFilters, setShowFilters] = useState(false);
    const [errMsg, setErrMsg] = useState();
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const getMyArticles = async () => {
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

        getMyArticles();

        return () => {
            isMounted = false;
            controller.abort();
        }
    }, []);

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        setShowFilters(false);
    }

    return (
        <div className="my-articles-parent">
            {/* { errMsg
                ? <p style={{color:'black'}}>{errMsg}</p>
                : !articles
                    ? <p style={{color:'black'}}>Loading...</p>
                    :
                    (
                        
                    )
            }*/}

            <div className="my-articles-container">
                <h1 className="tab-title">My articles</h1>
                <div className="buttons-container">
                    <Link to="/write" className="article-action-button">
                        <img src={IconNewArticle} />
                        <p>New Article</p>
                    </Link>
                    <form className="search-layout">
                        <input
                            type="text"
                            name="search"
                            id="search"
                        />
                        <img src={IconSearch} alt="search" />
                    </form>
                    <img onClick={() => setShowFilters(!showFilters)} className="article-action-button" src={IconFilter} alt="filter" />
                </div>

                { showFilters && 
                    (<form className="filter-container" onSubmit={handleFilterSubmit}>
                        <h3>Filter articles:</h3>
                        <select name="categories" id="categories">
                            <option value="0">Select category</option>
                            <option value="alkdjflsakdjfs">Programming</option>
                            <option value="oiewurpoqwqwpo">Design</option>
                        </select>

                        <div className="filter-radio-buttons-containter">
                            <div>
                                <p className="dropdown-title">Sort by:</p>
                                <fieldset id="sortby">
                                    <div className="single-radio-container">
                                        <input id="date-added" type="radio" value="Date added" name="sortby" checked />
                                        <label for="date-added">Date added</label>
                                    </div>
                                    <div className="single-radio-container">
                                        <input id="view-count" type="radio" value="View count" name="sortby" />
                                        <label for="view-count">View count</label>
                                    </div>
                                </fieldset>
                            </div>

                            <hr/>
                            
                            <div>
                                <p className="dropdown-title">Order by:</p>
                                <fieldset id="order">
                                    <div className="single-radio-container">
                                        <input type="radio" id="ascending" value="Ascending" name="order" checked/>
                                        <label for="ascending">Ascending</label>
                                    </div>
                                    <div className="single-radio-container">
                                        <input type="radio" id="descending" value="Descending" name="order" />
                                        <label for="descending">Descending</label>
                                    </div>
                                </fieldset>
                            </div>
                        </div>
                        
                        <div className="filter-btn-container">
                            <button className="filter-apply-btn">Apply</button>
                            <button onClick={() => setShowFilters(false)} className="filter-cancel-btn">Cancel</button>
                        </div>
                    </form>)
                }

                <MyArticle />
                <MyArticle />
                <MyArticle />
                <MyArticle />
                <MyArticle />
                <MyArticle />
                <MyArticle />
                <MyArticle />
                <MyArticle />
                <MyArticle />
                <MyArticle />
            </div>
        </div>
    );
}