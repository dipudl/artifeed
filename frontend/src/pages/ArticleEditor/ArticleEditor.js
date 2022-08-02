import React, { useRef, useState, useEffect } from "react";
import NavbarDynamic from "../../components/Navbar/NavbarDynamic";
import "./ArticleEditor.css";
import Editor from "../../components/Editor/Editor";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useLocation, useNavigate } from "react-router-dom";
import IconError from '../../assets/ic_error.svg';
import IconLoading from '../../assets/ic_loading.svg';
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";

const CATEGORIES_URL = "/home/categories";
const IMAGE_UPLOAD_URL = "/image/upload";
const PERMALINK_VALIDATION_URL = "/write/validate-permalink";
const PUBLISH_URL = "/write";
const EDIT_URL = "/write/edit";
const ARTICLE_URL = "/write?article=";

export default function ArticleEditor() {
    const titleRef = useRef();
    const fileInputRef = useRef();
    const [title, setTitle] = useState('');
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [permalink, setPermalink] = useState('');
    const [description, setDescription] = useState('');
    const [defaultCategories, setDefaultCategories] = useState();
    const [category, setCategory] = useState(-1);
    const [featuredImage, setFeaturedImage] = useState();
    // for editing purpose
    const [originalPermalink, setOriginalPermalink] = useState('');
    // permalinkType: 0 = automatic, 1 = custom
    const [permalinkType, setPermalinkType] = useState(0);
    // authState: 0 = normal, 1 = loading, 2 = error
    const [featImgUploadState, setFeatImgUploadState] = useState(0);
    const [permalinkValidationState, setPermalinkValidationState] = useState(0);
    const [articlePublishState, setArticlePublishState] = useState(0);
    const [errMsg, setErrMsg] = useState('');
    const [featImgUploadErrMsg, setFeatImgUploadErrMsg] = useState('');
    const [permalinkValidationErr, setPermalinkValidationErr] = useState('');

    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const location = useLocation();
    const articleId = parseInt(new URLSearchParams(window.location.search).get("article"));

    useEffect(() => {
        // set focus on title input when component loads
        if(titleRef.current) titleRef.current.focus();
    }, [defaultCategories])

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const getArticle = async () => {
            try {
                const response = await axiosPrivate.get(`${ARTICLE_URL}${articleId}`, {
                    signal: controller.signal
                });

                const data = response.data;
                if(isMounted) {
                    setDefaultCategories(data.categories);
                    setTitle(data.title);
                    setFeaturedImage(data.featured_image);
                    setCategory(data.category_id);
                    setPermalink(data.permalink);
                    setOriginalPermalink(data.permalink);
                    setDescription(data.description);
                    setEditorState(EditorState.createWithContent(
                        convertFromRaw(JSON.parse(data.content))
                    ));
                    setErrMsg('');

                    // show confirm dialog before closing/reloading this page
                    window.addEventListener("beforeunload", alertUserBeforeClosing);
                }

            } catch (err) {
                console.log(err);

                if(!err?.response) {
                    setErrMsg('No Server Response');
    
                } else if (err.response?.status === 401) {
                    setErrMsg('Session expired. Redirecting to login...');
                    navigate('/login', { state: { from: location }, replace: true})
    
                } else if (err.response?.status === 404) {
                    setErrMsg(err.response?.data?.message
                        || "The requested article does not exist or you are not authorized.");
                    navigate('/article', { state: { from: location }, replace: true})
    
                } else if(err.response?.data?.message) {
                    setErrMsg(err.response?.data?.message);
    
                } else if(err.message) {
                    setErrMsg(err.message);
                    
                } else {
                    setErrMsg('An error occurred');
                }
            }
        }

        const getCategories = async () => {
            try {
                const response = await axiosPrivate.get(CATEGORIES_URL, {
                    signal: controller.signal
                });

                const data = response.data;
                if(isMounted) {
                    setDefaultCategories(data.categories);
                    setErrMsg('');
                }

                // show confirm dialog before closing/reloading this page
                window.addEventListener("beforeunload", alertUserBeforeClosing);

            } catch (err) {
                console.log(err);

                if(!err?.response) {
                    setErrMsg('No Server Response');
    
                } else if (err.response?.status === 401) {
                    setErrMsg('Session expired. Redirecting to login...');
                    navigate('/login', { state: { from: location }, replace: true})
    
                } else if(err.response?.data?.message) {
                    setErrMsg(err.response?.data?.message);
    
                } else if(err.message) {
                    setErrMsg(err.message);
                    
                } else {
                    setErrMsg('An error occurred');
                }
            }
        }

        if(articleId)
            getArticle();
        else
            getCategories();

        return () => {
            isMounted = false;
            controller.abort();
            window.removeEventListener('beforeunload', alertUserBeforeClosing);
        }
    }, [])

    const alertUserBeforeClosing = e => {
        e.preventDefault()
        e.returnValue = 'Are you sure you want to close?';
    }

    const onEditorStateChange = (e) => {
        setEditorState(e);
    }

    const publishHandler = async () => {
        if(!title || !title.trim()) return alert("Title must not be empty");
        if(category <= 0) return alert("Please select a category");
        if(!description) return alert("Description must not be empty");
        if(description.length > 200) return alert("Description can only contain 200 characters at max");
        if(permalinkType === 1 && (!permalink || permalinkValidationState === 2))
            return alert("Permalink can only contain a-z, A-Z, 0-9, underscore and hyphen and must have 5 to 180 characters");
        
        const content = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
        const isPermalinkChanged = originalPermalink && (permalink !== originalPermalink);

        try {
            setArticlePublishState(1);

            const response = await axiosPrivate.post(
                articleId? EDIT_URL : PUBLISH_URL,
                JSON.stringify({
                    articleId, title, content, category, featuredImage, 
                    permalinkType: isPermalinkChanged? 1: 0, 
                    permalink, description
                }),
                {
                    headers: { 'Content-Type': 'application/json'},
                    withCredentials: true
                }
            );

            alert(`Article ${articleId? 'updated' : 'published'} successfully`);
            setArticlePublishState(0);
            navigate('/article', { state: { from: location }, replace: true})

        } catch(err) {
            if(!err?.response) {
                alert('No Server Response');

            } else if (err.response?.status === 401) {
                alert('Session expired. Please login to continue.');

            } else if(err.response?.data?.message) {
                alert(err.response?.data?.message);

            } else if(err.message) {
                alert(err.message);
                
            } else {
                alert('Profile picture upload failed');
            }

            setArticlePublishState(2);
        }
    }

    const cancelHandler = () => {
        const dialogValue = window.confirm("The changes will be lost after you exit");
        if(dialogValue) {
            navigate('/article', { state: { from: location }, replace: true})
        }
    }

    const fileSelectedHandler = async (e) => {
        const image = e.target.files[0];
        if(image.size > 2097152) {
            alert('File is too large. Maximum size limit is 2MB.');
            fileInputRef.current.value = "";
            return;
        }

        const fileData = new FormData();
        fileData.append('uploaded_file', image);
        setFeatImgUploadState(1);

        try {
            const response = await axiosPrivate.post(
                IMAGE_UPLOAD_URL,
                fileData,
                {
                    headers: { 'Content-Type': 'application/json'},
                    withCredentials: true
                }
            );

            setFeaturedImage(response.data.image_url);
            setFeatImgUploadState(0);

        } catch(err) {
            if(!err?.response) {
                setFeatImgUploadErrMsg('No Server Response');

            } else if (err.response?.status === 401) {
                setFeatImgUploadErrMsg('Session expired. Redirecting to login...');
                navigate('/login', { state: { from: location }, replace: true})

            } else if(err.response?.data?.message) {
                setFeatImgUploadErrMsg(err.response?.data?.message);

            } else if(err.message) {
                setFeatImgUploadErrMsg(err.message);
                
            } else {
                setFeatImgUploadErrMsg('Profile picture upload failed');
            }

            setFeatImgUploadState(2);
        } finally {
            fileInputRef.current.value = "";
        }
    }

    const handlePermalinkTypeChange = (e) => {
        setPermalinkType(parseInt(e.target.value));
    }

    const handlePermalinkChange = (e) => {
        const value = e.target.value;
        if(!value || value.length < 5) {
            setPermalinkValidationErr('Permalink must contain 5 or more characters')
            setPermalinkValidationState(2);

        } else if(value.length > 180) {
            setPermalinkValidationErr('Permalink can only contain 180 characters at max')
            setPermalinkValidationState(2);

        } else if(!value.match(/^[A-Za-z0-9_-]{5,180}$/)) {
            setPermalinkValidationErr('Permalink can only contain a-z, A-Z, 0-9, underscore and hyphen and must have at least 5 characters')
            setPermalinkValidationState(2);
        } else {
            setPermalinkValidationState(permalinkValidationState === 1? 1: 0);
        }

        setPermalink(e.target.value);
    }

    const handlePermalinkApply = async () => {
        if(originalPermalink && (permalink === originalPermalink))
            return;

        if(!permalink || permalink.length < 5) {
            setPermalinkValidationErr('Permalink must contain 5 or more characters')
            setPermalinkValidationState(2);

        } else if(permalink.length > 180) {
            setPermalinkValidationErr('Permalink can only contain 180 characters at max')
            setPermalinkValidationState(2);

        } else if(!permalink.match(/^[A-Za-z0-9_\-]{5,180}$/)) {
            setPermalinkValidationErr('Permalink can only contain a-z, A-Z, 0-9, underscore and hyphen and must have at least 5 characters')
            setPermalinkValidationState(2);

        } else {
            setPermalinkValidationState(1);

            try {
                const response = await axiosPrivate.post(
                    PERMALINK_VALIDATION_URL,
                    JSON.stringify({ permalink }),
                    {
                        headers: { 'Content-Type': 'application/json'},
                        withCredentials: true
                    }
                );
    
                setPermalinkValidationState(0);
    
            } catch(err) {
                if(!err?.response) {
                    setPermalinkValidationErr('No Server Response');
    
                } else if (err.response?.status === 401) {
                    setPermalinkValidationErr('Session expired. Please login to continue.');
    
                } else if(err.response?.data?.message) {
                    setPermalinkValidationErr(err.response?.data?.message);
    
                } else if(err.message) {
                    setPermalinkValidationErr(err.message);
                    
                } else {
                    setPermalinkValidationErr('Profile update failed');
                }
    
                setPermalinkValidationState(2);
            }
        }
    }

    return (
        errMsg?
        <h3 style={{color: 'black'}}>{errMsg}</h3>
        :
        defaultCategories &&
        (<div>
            <NavbarDynamic data={{
                buttonUnfilled: {
                    label: 'Cancel',
                    disabled: articlePublishState === 1,
                    callback: cancelHandler
                },
                buttonFilled: {
                    label: articleId? 'Update' : 'Publish',
                    disabled: articlePublishState === 1,
                    callback: publishHandler
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
                        <Editor
                            styles={{marginTop: '0.4rem'}}
                            editorState={editorState}
                            onEditorStateChange={onEditorStateChange}
                        />
                    </div>
                </div>
                <hr/>
                <div className="article-details">
                    <select
                        name="categories"
                        id="categories"
                        value={category}
                        onChange={(e) => setCategory(parseInt(e.target.value))}
                    >
                        <option value={-1}>Select category</option>
                        {
                            defaultCategories.map(category => (
                                <option
                                    key={category.category_id}
                                    value={category.category_id}>
                                    {category.name}
                                </option>   
                            ))
                        }
                    </select>

                    <div className="featured-image-selection">
                        <p className="div-title">Featured image</p>

                        {featuredImage &&
                            <div className="feat-img-container">
                                <img src={featuredImage} alt="featured" />
                            </div>
                        }
                        <input
                            style={{display: 'none'}}
                            type="file"
                            accept="image/png, image/jpeg"
                            onChange={fileSelectedHandler}
                            ref={fileInputRef}
                        />
                        {{
                            1:
                            <div className={"auth-info info-color small-margin-top"}>
                                <img className="rotate" src={IconLoading} alt="icon" />
                                <p className="auth-info-text">Uploading...</p>
                            </div>,
                            2:
                            <div className={"auth-info error-color small-margin-top"}>
                                <img src={IconError} alt="icon" />
                                <p className="auth-info-text">{featImgUploadErrMsg}</p>
                            </div>
                        }[featImgUploadState]}

                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="positive-btn"
                            disabled={featImgUploadState === 1}>
                            {featuredImage? 'Change': 'Upload'}
                        </button>

                        {featuredImage &&
                        <button
                            className="negative-btn"
                            onClick={() => setFeaturedImage()}
                            disabled={featImgUploadState === 1}>
                            Remove
                        </button>
                        }
                    </div>

                    <div className="permalink-container">
                        <p className="div-title">Permalink</p>
                        <fieldset id="permalink-type">
                            <div className="single-radio-container">
                                <input
                                    type="radio"
                                    id="automatic"
                                    value={0}
                                    name="permalink-type"
                                    onChange={handlePermalinkTypeChange}
                                    checked={permalinkType === 0}
                                />
                                <label className="radio-label" htmlFor="automatic">Automatic</label>
                            </div>
                            <div className="single-radio-container">
                                <input
                                    type="radio"
                                    id="custom"
                                    value={1}
                                    name="permalink-type"
                                    onChange={handlePermalinkTypeChange}
                                    checked={permalinkType === 1}
                                />
                                <label className="radio-label" htmlFor="custom">Custom</label>
                            </div>
                        </fieldset>

                        { permalinkType === 1 &&
                        <div>
                            <input
                                className="default-input-style"
                                name="permalink"
                                type="text"
                                id="permalink"
                                value={permalink}
                                onChange={handlePermalinkChange}
                                required
                            />
                            {{
                                1:
                                <div className={"auth-info info-color small-margin-top"}>
                                    <img className="rotate" src={IconLoading} alt="icon" />
                                    <p className="auth-info-text">Validating...</p>
                                </div>,
                                2:
                                <div className={"auth-info error-color small-margin-top"}>
                                    <img src={IconError} alt="icon" />
                                    <p className="auth-info-text">{permalinkValidationErr}</p>
                                </div>
                            }[permalinkValidationState]}
                            <button onClick={handlePermalinkApply} className="positive-btn">Apply</button>
                        </div>
                        }
                    </div>

                    <div className="single-input">
                        <label htmlFor="description">Description</label>
                        <textarea
                            name="description"
                            type="text"
                            id="description"
                            value={description}
                            maxLength="200"
                            rows={4}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                </div>
            </div>
        </div>)
    );
}