import React from "react";

const CodeEditorToolbarWrapper = ({onToolbarClose, ...props})=>{

    return <div className={'b-editor__toolbar'}>
        <button onClick={onToolbarClose} className={'b-editor__tolbar__btn-close'}>X</button>
        <div>
            {props.children}
        </div>
    </div>
}

export default CodeEditorToolbarWrapper;