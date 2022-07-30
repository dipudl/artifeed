import React, { useRef, useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Editor as DraftEditor } from "react-draft-wysiwyg";
import "./Editor.css";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";

export default function Editor({ styles, editorState, onEditorStateChange }) {
    const axiosPrivate = useAxiosPrivate();

    const IMAGE_UPLOAD_URL = "/image/upload";

    /* setEditorState(EditorState.createWithContent(
        convertFromRaw(...)
    )) */

    function uploadImageCallBack(file) {
        return new Promise(
            async (resolve, reject) => {
                if(file.size > 2097152) {
                    alert('Image is too large. Maximum size limit is 2MB.')
                    reject('Image is too large. Maximum size limit is 2MB.');
                    return;
                }

                const fileData = new FormData();
                fileData.append('uploaded_file', file);

                try {
                    const response = await axiosPrivate.post(
                        IMAGE_UPLOAD_URL,
                        fileData,
                        {
                            headers: { 'Content-Type': 'application/json'},
                            withCredentials: true
                        }
                    );

                    resolve({ data: { link: response.data.image_url } });

                } catch(err) {
                    console.log(err);
                    let message = 'Image upload failed';
                    if(!err?.response) {
                        message = 'No Server Response';
                    } else if (err.response?.status === 401) {
                        message = 'Session expired. Please login to continue.';
                    } else if(err.response?.data?.message) {
                        message = err.response?.data?.message;
                    } else if(err.message) {
                        message = err.message;
                    }

                    reject(message);
                    alert(message);
                }
          }
        );
    }

    return (
        <div style={styles} className="draft-editor-container">
            <DraftEditor
                toolbar={{
                    fontFamily: {
                        options: ['Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Inter', 'Poppins', 'Verdana']
                    },
                    image: { uploadCallback: uploadImageCallBack, alt: { present: true, mandatory: true } }
                }}
                placeholder="Write something..."
                editorState={editorState}
                onEditorStateChange={onEditorStateChange}
                toolbarClassName="toolbar-style"
                editorClassName="editor-style"
            />
        </div>
    );
}
