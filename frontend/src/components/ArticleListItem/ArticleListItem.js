import React from "react";
import './ArticleListItem.css'
import DefaultProfileImage from '../../assets/DefaultProfileImage.svg';
import DefaultFeatureImage from '../../assets/DefaultFeatureImage.svg';
import { formatDate } from "../../utils/functions";
import { Link } from "react-router-dom";

export default function ArticleListItem({ data }) {
    return (
        <Link to={`/read/${data.permalink}`} className="list-container">
            <div className="details-container">
                <div className="author-details-container">
                    {/*eslint-disable-next-line */}
                    <img className="article-list-profile-picture" src={data.author_image_url || DefaultProfileImage} alt="profile picture" />
                    <p className="author-name">{data.author_name}</p>
                </div>

                <h3 className="article-title">{data.title}</h3>
                <p className="article-description">{data.article_description}</p>

                <div className="article-extra-details">
                    <p className="article-date">{formatDate(data.publish_date)}</p>
                    <p className="article-category">{data.category_name}</p>
                </div>
            </div>
            <div className="featured-image-div">
                <img className="featured-image" src={data.featuredImage || DefaultFeatureImage} alt="featured"/>
            </div>
        </Link>
    );
}