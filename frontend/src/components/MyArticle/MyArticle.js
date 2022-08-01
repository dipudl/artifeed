import React from "react";
import IconLike from "../../assets/ic_like.svg";
import IconViews from "../../assets/ic_views.svg";
import IconEdit from "../../assets/ic_edit.svg";
import IconDelete from "../../assets/ic_delete.svg";
import "./MyArticle.css";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import DefaultFeatureImage from '../../assets/DefaultFeatureImage.svg';
import { formatDate } from "../../utils/functions";
import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";

const ARTICLE_DELETE_LINK = "/my-articles";

export default function MyArticle({ data, articleDeleteCallback }) {
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const location = useLocation();

    const handleDelete = async (e) => {
        e.preventDefault();

        const dialogResult = window.confirm("Are you sure? The selected article will be deleted permanently.");

        if(dialogResult) {
            try {
                const response = await axiosPrivate.delete(
                    `${ARTICLE_DELETE_LINK}/${data.article_id}`,
                    JSON.stringify({
                        articleId: data.article_id
                    }),
                    {
                        headers: { 'Content-Type': 'application/json'},
                        withCredentials: true
                    }
                );

                // Article deleted successfully. Remove article from list.
                articleDeleteCallback(data.article_id);

            } catch (err) {
                console.log(err);

                if(!err?.response) {
                    alert('No Server Response');

                } else if (err.response?.status === 401) {
                    alert('Session expired. Please login to continue.');
                    navigate('/login', { state: { from: location }, replace: true})

                } else if(err.response?.data?.message) {
                    alert(err.response?.data?.message);

                } else if(err.message) {
                    alert(err.message);
                    
                } else {
                    alert('An error occurred');
                }
            }
        }
    }

    return (
        <Link className="my-article" to={`/read/${data.permalink}`}>
            <img className="my-article-featured-img" src={data.featured_image || DefaultFeatureImage} alt="featured"/>
            <div className="my-article-details">
                <h2>{data.title}</h2>
                <div className="article-extra-details">
                    <p className="article-date">{ formatDate(data.publish_date)}</p>
                    <p className="article-category">{data.category_name}</p>
                </div>
            </div>
            <div className="stats-and-action-buttons">
                <div className="stats-container">
                    <img src={IconLike} alt="like" />
                    <p>{data.like_count}</p>
                    <img className="icon-views" src={IconViews} alt="views" />
                    <p>{data.view_count || 0}</p>
                </div>
                <div className="my-article-update-buttons-container">
                    <Link to={`/write?article=${data.article_id}`}><img src={IconEdit} alt="edit" /></Link>
                    <img onClick={handleDelete} className="delete-button" src={IconDelete} alt="delete" />
                </div>
            </div>
        </Link>
    );
}