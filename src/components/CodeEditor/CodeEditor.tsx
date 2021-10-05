import React, {useEffect, useRef, useState} from 'react';
import './CodeEditor.scss';
import { loader } from "@monaco-editor/react";

export type CodeEditorProps = {
    value: string;
};

const constants = {
    MONACO_COMMAND_CLASS_NAME: 'mtk6'
}

const codeEditorUtils = {
    isCommand: (element: HTMLElement)=>{
        const target = element;
        const targetClassName = target.className;
        const isCommand = targetClassName === constants.MONACO_COMMAND_CLASS_NAME;
        return isCommand;
    }
}
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
            const properties = {
                language:  "sql",
            }

            setEditor(monaco.editor.create(wrapper,  properties));
        });
    }, [wrapperRef]);

    useEffect(()=>{
        if(!value || !editor) return;
        editor.getModel().setValue(value);
    }, [editor, value]);

    useEffect(()=>{
        if(!editor) return;
        function showEvent(e){
            const targetElement = e.target.element;
            if(!targetElement) return;
            
            if(codeEditorUtils.isCommand(targetElement)) {
                console.log(e.target.element?.textContent);
                const targetText = targetElement.textContent;
                if(targetText.toUpperCase() === 'BY') {
                    console.log(targetElement.previousElementSibling)
                }
            }
        }
        editor.onMouseMove(function (e) {
            showEvent(e);
        });
        editor.onMouseUp(function (e) {
            showEvent(e);
        });
    }, [editor]);

    return (
        <div className={'b-editor'}>
            <header className={'b-editor__header'}>

            </header>
            <div className={'b-editor__panel'} ref={wrapperRef} />
        </div>
    );
};

export default CodeEditor;
