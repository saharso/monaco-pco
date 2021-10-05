import React, {useEffect, useRef, useState} from 'react';
import ReactDOM from "react-dom";
import './CodeEditor.scss';
import { loader } from "@monaco-editor/react";
import CodeEditorToolbarWrapper from './components/ToolbarWrapper';
import useOnToolbarItemClick from './hooks/useOnToolbarItemClick';
import constants from './models/consts';
import SQLCommandsEnum from './models/enum.SQLCommands';
import ToolbarControls from './components/ToolbarControls';


const codeEditorUtils = {
    isCommand: function(target: any) {
        const elemnt = target instanceof Element ? target : target.element;
        const targetClassName = elemnt.className;
        const isCommand = targetClassName === constants.MONACO_COMMAND_CLASS_NAME;
        return isCommand;
    },
    getClusterCommand: function(element: HTMLElement): SQLCommandsEnum {
        if(this.isCommand(element)) {
            return element.textContent.toUpperCase() as SQLCommandsEnum;
        }
    },
}

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

    const onToolbarClick = useOnToolbarItemClick();

    useEffect(()=>{
        if(!wrapperRef) return;

        const wrapper: HTMLElement = wrapperRef.current;

        loader.init().then(monaco => {
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
            if(!viewZoneId) return;
            editor.changeViewZones(function(changeAccessor) {
                changeAccessor.removeZone(viewZoneId);
            });
            existingCommand = existingLineNumber = null;
        }

        function addToolbar(lineNumber: number, currentCommand: SQLCommandsEnum) {

            removeExistingToolbar();

            editor.changeViewZones(function(changeAccessor) {

                const domNode = document.createElement('div');

                domNode.className = 'b-editor--toolbar__wrapper';

                ReactDOM.render(

                    <CodeEditorToolbarWrapper onToolbarClose={()=>{removeExistingToolbar()}}>
                        <ToolbarControls
                            commandKey={currentCommand}
                            callback={(e)=>{console.log(e)}}
                        />
                    </CodeEditorToolbarWrapper>,
                    domNode
                );

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

                    addToolbar(currentLineNumber, currentCommand);

                    setCommand(currentCommand);

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

    useEffect(()=>{
        console.log(onToolbarClick.value);
    }, [onToolbarClick.value])

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
