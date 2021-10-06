import React, {useEffect, useRef, useState} from 'react';
import ReactDOM from "react-dom";
import './CodeEditor.scss';
import { loader } from "@monaco-editor/react";
import CodeEditorToolbarWrapper from './components/ToolbarWrapper';
import useOnToolbarItemClick from './hooks/useOnToolbarItemClick';
import monacoClassNames from './models/consts.monacoClassNames';
import SQLCommandsEnum from './models/enum.SQLCommands';
import ToolbarControls from './components/ToolbarControls';
import monacoConfig from "./models/consts.monacoConfig";


const codeEditorUtils = {
    isCommand: function(target: any) {
        const elemnt = target instanceof Element ? target : target.element;
        const targetClassName = elemnt.className;
        const isCommand = targetClassName === monacoClassNames.SQL_COMMAND;
        return isCommand;
    },
    getClusterCommand: function(element: HTMLElement): SQLCommandsEnum {
        if(this.isCommand(element)) {
            return element.textContent.toUpperCase() as SQLCommandsEnum;
        }
    },
}

class CodeEditorModel {
    private editor;
    private viewZoneId: string;
    private existingCommand: string;
    private existingLineNumber: number;

    constructor(editor) {
        this.editor = editor;
    }

    public removeExistingToolbar() {
        if(!this.viewZoneId) return;
        this.editor.changeViewZones(function(changeAccessor) {
            changeAccessor.removeZone(this.viewZoneId);
        });
        this.existingCommand = this.existingLineNumber = null;
    }

    public addToolbar(lineNumber: number, currentCommand: SQLCommandsEnum) {

        this.removeExistingToolbar();

        this.editor.changeViewZones(function(changeAccessor) {

            const domNode = document.createElement('div');

            domNode.className = 'b-editor--toolbar__wrapper';

            ReactDOM.render(

                <CodeEditorToolbarWrapper onToolbarClose={()=>{this.removeExistingToolbar()}}>
                    <ToolbarControls
                        commandKey={currentCommand}
                        callback={(e)=>{console.log(e)}}
                    />
                </CodeEditorToolbarWrapper>,
                domNode
            );

            this.viewZoneId = changeAccessor.addZone({
                afterLineNumber: lineNumber - 1,
                heightInLines: 3,
                domNode: domNode
            });
        });

    }

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
            setEditor(monaco.editor.create(wrapper,  monacoConfig));
        });
    }, [wrapperRef]);

    useEffect(()=>{
        if(!value || !editor) return;
        editor.getModel().setValue(value);
    }, [editor, value]);

    useEffect(()=>{
        if(!editor) return;

        const editorModel = new CodeEditorModel(editor);
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

        function onCommandHover(e, currentLineNumber, currentCommand){
            addToolbar(currentLineNumber, currentCommand);

            setCommand(currentCommand);
        }

        function showEvent(e, callback: Function){

            const targetElement = e.target.element;
            if(!targetElement) return;

            if(codeEditorUtils.isCommand(e.target)) {
                const currentCommand = codeEditorUtils.getClusterCommand(targetElement);
                const currentLineNumber = e.target.position.lineNumber;
                // execute if not same command as previous, unless line number not as previous
                if(currentLineNumber !== existingLineNumber || existingCommand !== currentCommand) {
                    callback(e, currentLineNumber, currentCommand);
                }
                existingCommand = currentCommand;
                existingLineNumber = currentLineNumber;

            }
        }
        editor.onMouseMove(function (e) {
            showEvent(e, onCommandHover);
        });
        editor.onMouseUp(function (e) {
            showEvent(e, onCommandHover);
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
