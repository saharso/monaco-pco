import React, {useEffect, useRef, useState} from 'react';
import ReactDOM from "react-dom";
import './CodeEditor.scss';
import { loader } from "@monaco-editor/react";

export type CodeEditorProps = {
    value: string;
};

const constants = {
    MONACO_COMMAND_CLASS_NAME: 'mtk6'
}

const CodeEditorToolbar = ({...props})=>{

    return <div className={'b-editor__toolbar'}>
        <button className={'b-editor__tolbar__btn-close'}>X</button>
        <div>
            hello
            {props.children}
        </div>
    </div>
}

const codeEditorUtils = {
    isCommand: function(target: any) {
        const elemnt = target instanceof Element ? target : target.element;
        const targetClassName = elemnt.className;
        const isCommand = targetClassName === constants.MONACO_COMMAND_CLASS_NAME;
        return isCommand;
    },
    getClusterCommand: function(element: HTMLElement) {
        if(this.isCommand(element)) {
            return element.textContent.toUpperCase();
        }
    },
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

        let viewZoneId: string;

        let existingCommand: string;

        let existingLineNumber: number;

        function removeExistingToolbar(){
            viewZoneId && editor.changeViewZones(function(changeAccessor) {
                changeAccessor.removeZone(viewZoneId);
            });
        }

        function addToolbar(lineNumber: number) {
            removeExistingToolbar();
            editor.changeViewZones(function(changeAccessor) {
                const domNode = document.createElement('div');
                domNode.className = 'b-editor--toolbar__wrapper';
                ReactDOM.render(<CodeEditorToolbar/>, domNode);
                viewZoneId = changeAccessor.addZone({
                    afterLineNumber: lineNumber - 1,
                    heightInLines: 3,
                    domNode: domNode
                });
            });

        }

        function showEvent(e){

            const targetElement = e.target.element;
            if(!targetElement) return;

            if(codeEditorUtils.isCommand(e.target)) {
                const currentCommand = codeEditorUtils.getClusterCommand(targetElement);
                const currentLineNumber = e.target.position.lineNumber;
                // execute if not same command as previous, unless line number not as previous
                if(currentLineNumber !== existingLineNumber || existingCommand !== currentCommand) {

                    addToolbar(currentLineNumber);
                    console.log('should run once')
                }
                existingCommand = currentCommand;
                existingLineNumber = currentLineNumber;

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
