import React from "react";
import './TopicArticles.css'
import ArticleListItem from "../ArticleListItem/ArticleListItem";

export default function TopicArticle(props) {
    return (
        <div className="topic-articles">
            <h2 className="list-title">{props.topic}</h2>
            <ArticleListItem />
            <ArticleListItem />
            <ArticleListItem />
            <ArticleListItem />
            <ArticleListItem />
        </div>
    );
}