import React, {useEffect, useRef, useState} from 'react';
import { loader } from "@monaco-editor/react";

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
            console.log(monaco);
            wrapper.style.height = "100vh";
            const properties = {
                language:  "sql",
            }

            setEditor(monaco.editor.create(wrapper,  properties));
        });
    }, [wrapperRef]);

    useEffect(()=>{
        if(!value || !editor) return;
        editor.getModel().setValue(value);
    }, [editor, value])

    return (
        <>
            <div ref={wrapperRef} />
        </>
    );
};

export default CodeEditor;
