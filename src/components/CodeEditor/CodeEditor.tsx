import React, {ReactComponentElement, useEffect, useRef, useState} from 'react';
import './CodeEditor.scss';
import { loader } from "@monaco-editor/react";
import ToolbarControls from './components/ToolbarControls';
import monacoConfig from "./models/consts.monacoConfig";
import CodeEditorModel from "./models/model.codeEditor";


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

    const [command, setCommand] = useState(null);

    useEffect(()=>{
        if(!wrapperRef) return;

        const wrapper: HTMLElement = wrapperRef.current;

        loader.init().then(monaco => {
            setEditor(monaco.editor.create(wrapper,  monacoConfig));
        });
    }, [wrapperRef]);

    useEffect(()=>{
        if(!value || !editor) return;
        editor.getModel().setValue(value);
    }, [editor, value]);

    useEffect(()=>{
        if(!editor) return;

        const editorModel = new CodeEditorModel(editor, onSQLCommandHover);

        function onSQLCommandHover(e, lineNumber, SQLCommand){
            editorModel.addToolbarAboveLine(lineNumber,
                <ToolbarControls
                    commandKey={SQLCommand}
                    callback={(e)=>{console.log('From above line toolbar', e)}}
                />
            );
            setCommand(SQLCommand);
        }

    }, [editor]);

    return (
        <div className={'b-editor'}>
            <header className={'b-editor__header'}>
                <ToolbarControls
                    commandKey={command}
                    callback={(e)=>{console.log('From header', e)}}
                />
            </header>
            <div className={'b-editor__panel'} ref={wrapperRef} />
        </div>
    );
};

export default CodeEditor;
