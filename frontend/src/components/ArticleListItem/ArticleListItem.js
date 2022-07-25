import React from "react";

import './ArticleListItem.css'

export default function ArticleListItem() {
    return (
        <div className="list-container">
            <div className="details-container">
                <div className="author-details-container">
                    {/*eslint-disable-next-line */}
                    <img className="article-list-profile-picture" src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f" alt="profile picture" />
                    <p className="author-name">Mary Williams</p>
                </div>

                <h3 className="article-title">Lorem ipsum dolor sit amet, consectetur adipiscing elit</h3>
                <p className="article-description">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lobortis justo maecenas odio ultrices dictum pretium nibh quis. Mattis voli kddjei aaieow aidiueo idjaio ahjeiewa aoid</p>

                <div className="article-extra-details">
                    <p className="article-date">Jun 29, 2022</p>
                    <p className="article-category">apisoseil</p>
                </div>
            </div>
            <div className="featured-image-div">
                <img className="featured-image" src="https://images.unsplash.com/photo-1493612276216-ee3925520721" alt="featured"/>
            </div>
        </div>
    );
}