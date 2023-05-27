import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate, useLocation, Link } from "react-router-dom";

import IconNewArticle from "../../assets/ic_new_article.svg";
import IconSearch from "../../assets/search.svg";
import IconFilter from "../../assets/ic_filter.svg";
import IconError from '../../assets/ic_error.svg';
import IconLoading from '../../assets/ic_loading.svg';
import IconEmpty from '../../assets/ic_empty.svg';
import IconNoArticlePublished from '../../assets/ic_no_article_published.svg';

import './Article.css';
import MyArticle from "../MyArticle/MyArticle";
import { STATUS } from "../../utils/constants";
const ARTICLE_URL = "/my-articles";
const FILTER_ARTICLE_URL = "/my-articles/filter";
const CATEGORIES_URL = "/home/categories";

export default function Article() {
    const [articles, setArticles] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    // articleState: 0 = normal, 1 = loading, 2 = error, 3 = empty
    const [articlesState, setArticlesState] = useState(STATUS.LOADING);
    const [showFilters, setShowFilters] = useState(false);
    const [filterApplied, setFilterApplied] = useState(false);
    const [sortByType, setSortByType] = useState(0);
    const [orderByType, setOrderByType] = useState(1);
    const [filterCategory, setFilterCategory] = useState(-1);
    const [categoryList, setCategoryList] = useState([]);
    const [articlesStateMessage, setArticlesStateMessage] = useState();
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const getMyArticles = async () => {
            setArticlesState(STATUS.LOADING);
            try {
                const response = await axiosPrivate.get(ARTICLE_URL, {
                    signal: controller.signal
                });

                if(isMounted) {
                    if(response.data.data.length === 0) {
                        setArticlesState(STATUS.EMPTY);
                        setArticlesStateMessage(`Click on 'New Article' button to write your first article`);
                    } else {
                        setArticlesState(STATUS.SUCCESS);
                        setArticlesStateMessage('');
                    }

                    setArticles(response.data.data);
                }
            } catch (err) {
                console.log(err);

                if(!err?.response) {
                    setArticlesStateMessage('No Server Response');
    
                } else if (err.response?.status === 401) {
                    setArticlesStateMessage('Session expired. Redirecting to login...');
                    navigate('/login', { state: { from: location }, replace: true})
    
                } else if(err.response?.data?.message) {
                    setArticlesStateMessage(err.response?.data?.message);
    
                } else if(err.message) {
                    setArticlesStateMessage(err.message);
                    
                } else {
                    setArticlesStateMessage('An error occurred');
                }

                setArticlesState(STATUS.ERROR);
            }
        }

        getMyArticles();
        getCategories();

        return () => {
            isMounted = false;
            controller.abort();
        }
    }, []);

    const getCategories = async () => {
        try {
            const response = await axiosPrivate.get(CATEGORIES_URL);
            const data = response.data;
            setCategoryList(data.categories);
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        // if category list fails to load at first
        if(showFilters && categoryList.length === 0)
            getCategories();
    }, [showFilters]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilterRequest();
    }

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        applyFilterRequest();
    }

    const applyFilterRequest = async () => {
        setShowFilters(false);
        setFilterApplied(true);
        setArticlesState(STATUS.LOADING);

        try {
            const response = await axiosPrivate.post(FILTER_ARTICLE_URL,
                JSON.stringify({
                    search: searchInput,
                    category: filterCategory,
                    sortByType,
                    orderByType
                }),{
                    headers: { 'Content-Type': 'application/json'},
                    withCredentials: true
                });

            if(response.data.data.length === 0) {
                setArticlesStateMessage('No article found');
                setArticlesState(STATUS.EMPTY);
            } else {
                setArticlesStateMessage('');
                setArticlesState(STATUS.SUCCESS);
            }

            setArticles(response.data.data);

        } catch (err) {
            console.log(err);

            if(!err?.response) {
                setArticlesStateMessage('No Server Response');

            } else if (err.response?.status === 401) {
                setArticlesStateMessage('Session expired. Redirecting to login...');
                navigate('/login', { state: { from: location }, replace: true})

            } else if(err.response?.data?.message) {
                setArticlesStateMessage(err.response?.data?.message);

            } else if(err.message) {
                setArticlesStateMessage(err.message);
                
            } else {
                setArticlesStateMessage('An error occurred');
            }

            setArticlesState(STATUS.ERROR);
        }
    }

    const articleDeleteCallback = (articleId) => {
        const filteredArticles = articles.filter(
            (article) => article.article_id !== articleId
        );
        setArticles(filteredArticles);
    }

    const handleSortByChange = (e) => {
        setSortByType(parseInt(e.target.value));
    }

    const handleOrderByChange = (e) => {
        setOrderByType(parseInt(e.target.value));
    }

    return (
        <div className="my-articles-parent">
            <div className="my-articles-container">
                <h1 className="tab-title">My articles</h1>
                <div className="buttons-container">
                    <Link to="/write" className="article-action-button">
                        <img src={IconNewArticle} />
                        <p>New Article</p>
                    </Link>
                    <form className="search-layout" onSubmit={handleSearchSubmit}>
                        <input
                            placeholder="Search articles"
                            type="text"
                            name="search"
                            id="search"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <input type="image" src={IconSearch} alt="search" />
                    </form>
                    <img onClick={() => setShowFilters(!showFilters)} className="article-action-button" src={IconFilter} alt="filter" />
                </div>

                { showFilters && 
                    (<form className="filter-container" onSubmit={handleFilterSubmit}>
                        <h3>Filter articles:</h3>
                        <div className="filter-category-select-border">
                            <select
                                name="categories"
                                id="categories"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(parseInt(e.target.value))}
                            >
                                <option value={-1}>All categories</option>
                                {
                                    categoryList.map(category => (
                                        <option
                                            key={category.category_id}
                                            value={category.category_id}>
                                            {category.name}
                                        </option>   
                                    ))
                                }
                            </select>
                        </div>

                        <div className="filter-radio-buttons-containter">
                            <div>
                                <p className="dropdown-title">Sort by:</p>
                                <fieldset id="sortby">
                                    <div className="single-radio-container">
                                        <input
                                            id="date-added"
                                            type="radio"
                                            value={0}
                                            name="sortby"
                                            onChange={handleSortByChange}
                                            checked={sortByType === 0}
                                        />
                                        <label htmlFor="date-added">Date added</label>
                                    </div>
                                    <div className="single-radio-container">
                                        <input
                                            id="view-count"
                                            type="radio"
                                            value={1}
                                            onChange={handleSortByChange}
                                            name="sortby"
                                            checked={sortByType === 1}
                                        />
                                        <label htmlFor="view-count">View count</label>
                                    </div>
                                </fieldset>
                            </div>

                            <hr/>
                            
                            <div>
                                <p className="dropdown-title">Order by:</p>
                                <fieldset id="order">
                                    <div className="single-radio-container">
                                        <input
                                            type="radio"
                                            id="ascending"
                                            value={0}
                                            name="order"
                                            onChange={handleOrderByChange}
                                            checked={orderByType === 0}
                                        />
                                        <label htmlFor="ascending">Ascending</label>
                                    </div>
                                    <div className="single-radio-container">
                                        <input
                                            type="radio"
                                            id="descending"
                                            onChange={handleOrderByChange}
                                            value={1}
                                            name="order"
                                            checked={orderByType === 1}
                                        />
                                        <label htmlFor="descending">Descending</label>
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

                {{
                    [STATUS.SUCCESS]:
                        articles.map(article => (
                            <MyArticle
                                key={article.article_id}
                                data={article}
                                articleDeleteCallback={articleDeleteCallback}
                            />
                        )),
                    [STATUS.LOADING]:
                        <div className={"auth-info info-color"}>
                            <img className="rotate" src={IconLoading} alt="icon" />
                            <p className="auth-info-text">Loading...</p>
                        </div>,
                    [STATUS.ERROR]:
                        <div className={"auth-info error-color"}>
                            <img src={IconError} alt="icon" />
                            <p className="auth-info-text">{articlesStateMessage}</p>
                        </div>,
                    [STATUS.EMPTY]:
                        (
                            filterApplied ?
                            <div className={"auth-info info-color"}>
                                <img src={IconEmpty} alt="icon" />
                                <p className="auth-info-text">{articlesStateMessage}</p>
                            </div>
                            :
                            <div className={"no-article-published info-color"}>
                                <img src={IconNoArticlePublished} alt="icon" />
                                <p className="auth-info-text">{articlesStateMessage}</p>
                            </div>
                        )
                }[articlesState]}
            </div>
        </div>
    );
}