import React, { useRef, useState, useEffect } from "react";
import { Editor as DraftEditor } from "react-draft-wysiwyg";
import "./Editor.css";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";

export default function Editor({ styles }) {
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    const onEditorStateChange = (e) => {
        setEditorState(e);
        console.log(JSON.stringify(convertToRaw(editorState.getCurrentContent())));
    }

    /* setEditorState(EditorState.createWithContent(
        convertFromRaw(...)
    )) */

    return (
        <div style={styles} className="draft-editor-container">
            <DraftEditor
                toolbar={{
                    fontFamily: {
                        options: ['Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Inter', 'Poppins', 'Verdana']
                    }
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
