import React, { useState, useEffect } from "react";
import { STATUS } from '../../utils/constants';
import './TopicArticles.css';
import ArticleListItem from "../ArticleListItem/ArticleListItem";
import axios from "../../api/axios";

import IconError from '../../assets/ic_error.svg';
import IconLoading from '../../assets/ic_loading.svg';
import ProcessStatusBar from "../ProcessStatusBar/ProcessStatusBar";

const TOPIC_ARTICLES_LINK = "/home/topic?q=";

export default function TopicArticle(props) {
    const [articleList, setArticleList] = useState([]);
    // 0 = normal, 1 = loading, 2 = error, 3 = empty response
    const [articlesLoadingState, setArticlesLoadingState] = useState(STATUS.LOADING);
    const [statusMessage, setStatusMessage] = useState('Fetching...');

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const getArticles = async () => {
            setArticlesLoadingState(STATUS.LOADING);
            setStatusMessage('Fetching...');

            try {
                const response = await axios.get(`${TOPIC_ARTICLES_LINK}${props.topic}`,
                {
                    signal: controller.signal
                });

                const data = response.data;
                if(isMounted) {
                    setArticleList(data.articles);

                    if(data.articles.length === 0) {
                        setArticlesLoadingState(STATUS.EMPTY);
                        setStatusMessage('No articles found');
                    } else {
                        setArticlesLoadingState(STATUS.SUCCESS);
                        setStatusMessage('');
                    }
                }

            } catch (err) {
                console.log(err);

                if(!err?.response) {
                    setStatusMessage('No Server Response');
    
                } else if(err.response?.data?.message) {
                    setStatusMessage(err.response?.data?.message);
    
                } else if(err.message) {
                    setStatusMessage(err.message);
                    
                } else {
                    setStatusMessage('An error occurred');
                }

                setArticlesLoadingState(STATUS.ERROR);
            }
        }

        getArticles();

        return () => {
            isMounted = false;
            controller.abort();
        }
    }, []);

    return (
        <div className="topic-articles">
            <h2 className="list-title">{props.topic}</h2>
            {/* {{
                0:
                <>
                {articleList.map(article => <ArticleListItem key={article.article_id} data={article} />)}
                </>,
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
            }[articlesLoadingState]} */}

            {
                articlesLoadingState === STATUS.SUCCESS ?
                <>
                    {articleList.map(article => <ArticleListItem key={article.article_id} data={article} />)}
                </>
                :
                <ProcessStatusBar 
                    processState={articlesLoadingState}
                    message={statusMessage}
                />
            }
        </div>
    );
}