import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import ArticleListItem from "../../components/ArticleListItem/ArticleListItem";
import Navbar from "../../components/Navbar/Navbar";
import IconSearch from "../../assets/search.svg";
import IconError from '../../assets/ic_error.svg';
import IconLoading from '../../assets/ic_loading.svg';
import './Search.css';
import { useSearchParams } from "react-router-dom";

const SEARCH_ARTICLE_URL = "/search";
const CATEGORIES_URL = "/home/categories";

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [articles, setArticles] = useState([]);
    const [articlesState, setArticlesState] = useState();
    const [sortByType, setSortByType] = useState(0);
    const [orderByType, setOrderByType] = useState(1);
    const [filterCategory, setFilterCategory] = useState(-1);
    const [categoryList, setCategoryList] = useState([]);
    const [errMsg, setErrMsg] = useState();

    useEffect(() => {
        applyFilterRequest();
        getCategories();
    }, []);

    const getCategories = async () => {
        try {
            const response = await axios.get(CATEGORIES_URL);
            const data = response.data;
            setCategoryList(data.categories);

        } catch (err) {
            console.log(err);

            if(!err?.response) {
                alert('No Server Response');

            } else if(err.response?.data?.message) {
                alert(err.response?.data?.message);

            } else if(err.message) {
                alert(err.message);
                
            } else {
                alert('An error occurred');
            }
        }
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilterRequest();
    }

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        applyFilterRequest();
    }

    const applyFilterRequest = async () => {
        setArticlesState(1);

        try {
            const response = await axios.post(SEARCH_ARTICLE_URL,
                JSON.stringify({
                    search,
                    category: filterCategory,
                    sortByType,
                    orderByType
                }),{
                    headers: { 'Content-Type': 'application/json'},
                    withCredentials: false
                });

            response.data.data.length === 0 ? setArticlesState(3): setArticlesState(0);
            setArticles(response.data.data);
            setErrMsg('');
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

            setArticlesState(2);
        }
    }

    const handleSortByChange = (e) => {
        setSortByType(parseInt(e.target.value));
    }

    const handleOrderByChange = (e) => {
        setOrderByType(parseInt(e.target.value));
    }

    return (
        <>
            <Navbar />
            <div className="search-page-container">
                <h1 className="search-page-h1">Search articles</h1>

                <div className="search-body">
                    <div className="search-article-container">
                        <form className="search-layout" onSubmit={handleSearchSubmit}>
                            <input
                                placeholder="Search articles"
                                type="text"
                                name="search"
                                id="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <input type="image" src={IconSearch} alt="search" />
                        </form>
                        <div className="articles-list">
                            {{
                                0:
                                <>{articles.map(article => <ArticleListItem key={article.article_id} data={article}/>)}</>,
                                1:
                                <div className={"auth-info info-color"}>
                                    <img className="rotate" src={IconLoading} alt="icon" />
                                    <p className="auth-info-text">Loading articles...</p>
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
                            }[articlesState]}
                        </div>
                    </div>

                    <div className="search-filter-container">
                        <form className="filter-container" onSubmit={handleFilterSubmit}>
                            <h3>Filter articles:</h3>
                            <select
                                name="categories"
                                id="categories"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(parseInt(e.target.value))}
                            >
                                <option value={-1}>Select category</option>
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
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}