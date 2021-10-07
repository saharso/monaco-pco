import React, {useEffect, useRef, useState} from "react";
import {loader} from "@monaco-editor/react";
import '../CodeEditor/CodeEditor.scss';
export type CodeEditorProps = {
    value: string;
};
const CodeEditor: React.FunctionComponent<CodeEditorProps> = (
    {
        value,
    }
) => {

    const wrapperRef = useRef(null);

    const [editor, setEditor] = useState(null);

    useEffect(()=>{
        if(!wrapperRef) return;

        const wrapper: HTMLElement = wrapperRef.current;

        loader.init().then(monaco => {
            setEditor(monaco.editor.create(wrapper, {
                language:  "json",
            }));
        });
    }, [wrapperRef]);

    useEffect(()=>{
        if(!value || !editor) return;
        editor.getModel().setValue(value);
    }, [editor, value]);

    return (
        <div className={'b-editor'}>
            <header></header>
            <div className={'b-editor__panel'} ref={wrapperRef} />
        </div>
    );
};

export default CodeEditor;