import React from "react";
import IconLike from "../../assets/ic_like.svg";
import IconViews from "../../assets/ic_views.svg";
import IconEdit from "../../assets/ic_edit.svg";
import IconDelete from "../../assets/ic_delete.svg";
import "./MyArticle.css";

export default function MyArticle() {
    return (
        <div className="my-article">
            <img className="my-article-featured-img" src="https://images.unsplash.com/photo-1493612276216-ee3925520721" alt="featured"/>
            <div className="my-article-details">
                <h2>Lorem ipsum dolor sit amet, consectetur adipiscing elit consectetur adipiscing elit</h2>
                <div className="article-extra-details">
                    <p className="article-date">Jun 29, 2022</p>
                    <p className="article-category">apisoseil</p>
                </div>
            </div>
            <div className="stats-and-action-buttons">
                <div className="stats-container">
                    <img src={IconLike} alt="like" />
                    <p>23</p>
                    <img className="icon-views" src={IconViews} alt="views" />
                    <p>4.1k</p>
                </div>
                <div className="my-article-update-buttons-container">
                    <img src={IconEdit} alt="edit" />
                    <img className="delete-button" src={IconDelete} alt="delete" />
                </div>
            </div>
        </div>
    );
}