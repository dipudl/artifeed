import { convertFromRaw, EditorState } from "draft-js";
import React, { useState } from "react";
import jwt from 'jwt-decode';
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar/Navbar";
import './Read.css';

import IconSearch from "../../assets/search.svg";
import IconLikeUnfilled from '../../assets/ic_like_unfilled.svg';
import IconLikeFilled from '../../assets/ic_like_filled.svg';
import ArticleListItem from "../../components/ArticleListItem/ArticleListItem";
import IconError from '../../assets/ic_error.svg';
import IconLoading from '../../assets/ic_loading.svg';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import axios from "../../api/axios";
import ArticleListItemSmall from "../../components/ArticleListItemSmall/ArticleListItemSmall";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Editor } from "react-draft-wysiwyg";
import Search from "../../components/Search/Search";
import Error404 from "../Error404/Error404";

const ARTICLE_CONTENT_URL = "/read?article=";
const AUTHOR_ARTICLES_URL = "/read/author-articles";
const RECOMMENDED_ARTICLES_URL = "/read/recommended-articles";
const LIKE_URL = "/article/like";

export default function Read() {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [articleContent, setArticleContent] = useState();
    // articleContentLoadState: 0 = normal, 1 = loading, 2 = error, 4 = 404 not found
    const [articleContentLoadState, setArticleContentLoadState] = useState(1);
    const [recommendedArticles, setRecommendedArticles] = useState([]);
    const [authorArticles, setAuthorArticles] = useState([]);
    // current article is liked or not by current user
    const [liked, setLiked] = useState(false);
    const [errMsg, setErrMsg] = useState('');
    const [authorArticleErrMsg, setAuthorArticleErrMsg] = useState('');
    const [recommendedArticleErrMsg, setRecommendedArticleErrMsg] = useState('');
    // recommendedArticlesLoadState: 0 = normal, 1 = loading, 2 = error
    const [recommendedArticlesLoadState, setRecommendedArticlesLoadState] = useState(0);
    const [authorArticlesLoadState, setAuthorArticlesLoadState] = useState(0);

    const axiosPrivate = useAxiosPrivate();
    const params = useParams();

    let userId;
    try {
        userId = jwt(auth?.accessToken)?.user_id;
    } catch(err) {
        // console.log(err);
    }

    useEffect(() => {
        if(articleContent && articleContentLoadState == 0) {
            getAuthorArticles();
            getRecommendedArticles();
        }
    }, [articleContentLoadState]);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();
        let articleUrl;

        if(auth?.accessToken) {
            articleUrl = `${ARTICLE_CONTENT_URL}${params.permalink}&user-id=${userId}`;
        } else {
            articleUrl = `${ARTICLE_CONTENT_URL}${params.permalink}`;
        }

        const getArticleDetails = async () => {
            setArticleContentLoadState(1);

            try {
                const response = await axios.get(articleUrl, {
                    signal: controller.signal
                });

                const data = response.data;

                if(isMounted) {
                    setArticleContent(data);
                    setEditorState(EditorState.createWithContent(
                        convertFromRaw(JSON.parse(data.content))
                    ))

                    setLiked(data.liked);
                    setErrMsg('');
                    setArticleContentLoadState(0);
                }

            } catch (err) {
                console.log(err);
                setArticleContentLoadState(2);

                if(!err?.response) {
                    setErrMsg('No Server Response');
    
                } else if (err.response?.status === 404) {
                    setArticleContentLoadState(4);
                    setErrMsg('404 Page Not Found');
    
                } else if(err.response?.data?.message) {
                    setErrMsg(err.response?.data?.message);
    
                } else if(err.message) {
                    setErrMsg(err.message);
                    
                } else {
                    setErrMsg('An error occurred');
                }
            }
        }

        getArticleDetails();

        return () => {
            isMounted = false;
            controller.abort();
        }
    }, [params]);

    const getAuthorArticles = async () => {
        setAuthorArticlesLoadState(1);

        try {
            const response = await axios.get(
                `${AUTHOR_ARTICLES_URL}?author-id=${articleContent.author_id}&article-id=${articleContent.article_id}`
            );

            const data = response.data;
            setAuthorArticles(data.articles);
            setAuthorArticleErrMsg('');
            data.articles.length === 0
                ? setAuthorArticlesLoadState(3)
                : setAuthorArticlesLoadState(0);

        } catch (err) {
            console.log(err);

            if(!err?.response) {
                setAuthorArticleErrMsg('No Server Response');

            } else if(err.response?.data?.message) {
                setAuthorArticleErrMsg(err.response?.data?.message);

            } else if(err.message) {
                setAuthorArticleErrMsg(err.message);
                
            } else {
                setAuthorArticleErrMsg('An error occurred');
            }

            setAuthorArticlesLoadState(2);
        }
    }

    const getRecommendedArticles = async () => {
        setRecommendedArticlesLoadState(1);

        try {
            const response = await axios.get(
                `${RECOMMENDED_ARTICLES_URL}?author-id=${articleContent.author_id}&article-id=${articleContent.article_id}`
            );

            const data = response.data;
            setRecommendedArticles(data.articles);
            setRecommendedArticleErrMsg('');

            data.articles.length === 0
            ? setRecommendedArticlesLoadState(3)
            : setRecommendedArticlesLoadState(0);

        } catch (err) {
            console.log(err);

            if(!err?.response) {
                setRecommendedArticleErrMsg('No Server Response');

            } else if(err.response?.data?.message) {
                setRecommendedArticleErrMsg(err.response?.data?.message);

            } else if(err.message) {
                setRecommendedArticleErrMsg(err.message);
                
            } else {
                setRecommendedArticleErrMsg('An error occurred');
            }

            setRecommendedArticlesLoadState(2);
        }
    }

    const handleLikeClick = async () => {
        if(!userId) {
            const dialog = window.confirm("Please login to like this article");
            if(dialog) navigate('/login', { state: { from: location }, replace: true});
        } else {
            const newState = !liked;
            setLiked(newState);
            setArticleContent({ ...articleContent, like_count: articleContent.like_count + (newState? 1 : -1) });

            try {
                await axiosPrivate.post(
                    LIKE_URL,
                    JSON.stringify({
                        like: newState,
                        articleId: articleContent.article_id,
                        userId
                    }),
                    {
                        headers: { 'Content-Type': 'application/json'},
                        withCredentials: true
                    }
                );
            } catch(err) {
                console.log("Error", err);

                if(!err?.response) {
                    alert(`No Server Response while ${liked? 'liking': 'unliking'} this article`);
    
                } else if (err.response?.status === 401) {
                    alert('Session expired. Redirecting to login...');
                    navigate('/login', { state: { from: location }, replace: true})
    
                } else if(err.response?.data?.message) {
                    alert(err.response?.data?.message);
    
                } else if(err.message) {
                    alert(err.message);
                    
                } else {
                    alert(`Failed to ${liked? 'like': 'unlike'} this article. Please retry.`);
                }

                setArticleContent({ ...articleContent, like_count: articleContent.like_count + (liked? -1 : 1) });
                setLiked(!liked);
            }
        }
    }

    return (
        articleContentLoadState === 2?
        <p style={{color: 'black'}}>{errMsg}</p>
        : articleContentLoadState === 1?
        <p style={{color: 'black'}}>Loading...</p>
        : articleContentLoadState === 4?
        <Error404 />
        :
        (<div>
            <Navbar data={{
                buttonUnfilled: {
                    text: 'Login',
                    path: '/login'
                },
                buttonFilled: {
                    text: 'Start Writing',
                    path: '/register'
                }
            }}/>

            <div className="read-body">
                <div className="read-content">
                    <h1 className="read-h1">{articleContent.title}</h1>
                    
                    <Editor
                        editorState={editorState}
                        toolbarClassName="toolbar-style hidden"
                        editorClassName="editor-style-readonly"
                        readOnly={true}
                    />

                    <div onClick={handleLikeClick} className="read-like-container">
                        <img src={liked? IconLikeFilled : IconLikeUnfilled} />
                        <p>{articleContent.like_count}</p>
                    </div>

                    <hr className="read-horizontal-hr" />

                    <h2 className="recommended-h2">More from Artifeed</h2>

                    <div className="recommended-list">
                        {
                            recommendedArticleErrMsg
                            ? <p style={{color: 'black'}}>{recommendedArticleErrMsg}</p>
                            :
                            !recommendedArticles.length?
                            <p style={{color: 'black'}}>Loading...</p>
                            :
                            recommendedArticles.map(article => <ArticleListItem key={article.article_id} data={article} />)
                        }
                    </div>
                </div>
                <hr className="read-vertical-hr"/>
                <div className="read-details">
                    
                    <Search placeholder="Search more articles"/>

                    <div className="read-author-details-container">
                        <img className="author-profile-img" src={articleContent.author_image_url} alt="profilepic"/>
                        <p className="read-author-name">{articleContent.author_name}</p>
                        <p className="read-author-description">{articleContent.author_description}</p>
                    </div>

                    {authorArticlesLoadState !== 3 && 
                    (<div className="author-recommended-container">
                        <h2>More from the Author</h2>
                        <div className="author-recommended-list">
                            {{
                                0:
                                authorArticles.map(article =>
                                    <ArticleListItemSmall key={article.article_id} data={article} />
                                ),
                                1:
                                <p style={{color: 'black'}}>Loading...</p>,
                                2:
                                <p style={{color: 'black'}}>{authorArticleErrMsg}</p>,
                            }[authorArticlesLoadState]}
                        </div>
                    </div>)}
                </div>
            </div>
            
            <Footer />
        </div>)
    );
}