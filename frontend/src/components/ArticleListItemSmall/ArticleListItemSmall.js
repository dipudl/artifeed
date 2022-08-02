import React from "react";
import './ArticleListItemSmall.css';
import DefaultFeatureImage from '../../assets/DefaultFeatureImage.svg';
import { Link } from "react-router-dom";

export default function ArticleListItemSmall({ data }) {
    
    return (
        <Link to={`/read/${data.permalink}`} className="author-recommended">
            <p>{data.title}</p>
            <img src={data.featured_image || DefaultFeatureImage} alt="featured"/>
        </Link>
    );
}