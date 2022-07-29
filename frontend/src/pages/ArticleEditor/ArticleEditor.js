import React, { useRef, useState, useEffect } from "react";
import NavbarDynamic from "../../components/Navbar/NavbarDynamic";
import "./ArticleEditor.css";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
import Editor from "../../components/Editor/Editor";

export default function ArticleEditor() {
    const titleRef = useRef();
    const fileInputRef = useRef();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [permalink, setPermalink] = useState('');
    const [description, setDescription] = useState('');
    // authState: 0 = normal, 1 = loading, 2 = error
    const [featImgUploadState, setFeatImgUploadState] = useState(0);

    // set focus on title input when component loads
    useEffect(() => {
        titleRef.current.focus();
    }, [])

    const fileSelectedHandler = (e) => {

    }

    return (
        <div>
            <NavbarDynamic data={{
                buttonUnfilled: {
                    label: 'Cancel',
                    callback: () => {
                        console.log("Unfilled");
                    }
                },
                buttonFilled: {
                    label: 'Publish',
                    callback: () => {
                        console.log("Filled");
                    }
                }
            }} />

            <div className="editor-body">
                <div className="article-content">
                    <h1>Article editor</h1>
                    <div className="single-input">
                        <label htmlFor="title">Title</label>
                        <input
                            className="light-input-background"
                            name="title"
                            type="text"
                            id="title"
                            value={title}
                            ref={titleRef}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="content-editor">
                        <p className="div-title">Content</p>
                        <Editor styles={{marginTop: '0.4rem'}} />
                    </div>
                </div>
                <hr/>
                <div className="article-details">
                    <select name="categories" id="categories">
                        <option value="0">Select category</option>
                        <option value="alkdjflsakdjfs">Programming</option>
                        <option value="oiewurpoqwqwpo">Design</option>
                    </select>

                    <div className="featured-image-selection">
                        <p className="div-title">Featured image</p>
                        <div className="feat-img-container">
                            <img src="https://images.unsplash.com/photo-1493612276216-ee3925520721" alt="featured" />
                        </div>
                        <input
                            style={{display: 'none'}}
                            type="file"
                            accept="image/png, image/jpeg"
                            onChange={fileSelectedHandler}
                            ref={fileInputRef}
                        />
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="positive-btn"
                            disabled={featImgUploadState === 1}>
                            {/* {picUploadState === 1? picUploadProgress + '%': 'Change'} */}
                            Change
                        </button>
                        <button
                            className="negative-btn">
                            Remove
                        </button>
                    </div>

                    <div className="permalink-container">
                        <p className="div-title">Permalink</p>
                        <fieldset id="permalink-type">
                            <div className="single-radio-container">
                                <input type="radio" id="automatic" value="Automatic" name="permalink-type" checked/>
                                <label className="radio-label" htmlFor="automatic">Automatic</label>
                            </div>
                            <div className="single-radio-container">
                                <input type="radio" id="custom" value="Custom" name="permalink-type" />
                                <label className="radio-label" htmlFor="custom">Custom</label>
                            </div>
                        </fieldset>
                        <input
                            className="default-input-style"
                            name="content"
                            type="text"
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        />
                        <button className="positive-btn">Apply</button>
                    </div>

                    <div className="single-input">
                        <label htmlFor="description">Description</label>
                        <input
                            name="description"
                            type="text"
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}