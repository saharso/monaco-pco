import React, {useEffect, useRef, useState} from 'react';
import Editor, { useMonaco, loader } from "@monaco-editor/react";

export type CodeEditorProps = {


};

const CodeEditor: React.FunctionComponent<CodeEditorProps> = (
    {
    }
) => {

    const wrapperRef = useRef(null);

    useEffect(()=>{
        if(!wrapperRef) return;

        const wrapper: HTMLElement = wrapperRef.current;

        loader.init().then(monaco => {
            console.log(monaco);
            wrapper.style.height = "100vh";
            const properties = {
                value: "function hello() {\n\talert(\"Hello world!\");\n}",
                language:  "javascript",
            }

            monaco.editor.create(wrapper,  properties);
        });
    }, [wrapperRef]);

    return (
        <>
            <div ref={wrapperRef} />
        </>
    );
};

export default CodeEditor;
