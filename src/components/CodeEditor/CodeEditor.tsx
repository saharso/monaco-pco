import React, {useEffect, useRef, useState} from 'react';
import ReactDOM from "react-dom";
import './CodeEditor.scss';
import { loader } from "@monaco-editor/react";

enum SQLCommandsEnum {
    SET = 'SET',
    FROM = 'FROM',
    APPEND = 'APPEND',
    AS = 'AS',
    SELECT = 'SELECT',
}

interface IToolbarConfig {
    label: string;
    callback: Function;
}
const ToolbarMap: Map<SQLCommandsEnum, Function> = new Map();

function useOnToolbarItemClick() {

    const [value, setValue] = useState();

    return {
        callback: (value)=>{
            setValue(value);
        },
        value,
    }
}

export type ToobarControlsProps = {
    callback: Function;
    commandKey: SQLCommandsEnum;
}
const ToolbarControls: React.FunctionComponent<ToobarControlsProps> = ({callback, commandKey})=> {
    const hook = useOnToolbarItemClick();

    useEffect(() => {
        callback(hook.value);
    }, [hook.value])

    const SetToolbar = () => {
        return <>
            <button onClick={() => hook.callback('some SET function')}>some SET function</button>
            <button onClick={() => hook.callback('another SET function')}>another SET function</button>
        </>
    }
    const FromToolbar = () => {
        return <>
            <button onClick={() => hook.callback('some FROM function')}>some FROM function</button>
            <button onClick={() => hook.callback('another FROM function')}>another FROM function</button>
        </>
    }
    const AppendToolbar = () => {
        return <>
            <button onClick={() => hook.callback('some APPEND function')}>some APPEND function</button>
            <button onClick={() => hook.callback('another APPEND function')}>another APPEND function</button>
        </>
    }
    const AsToolbar = () => {
        return <>
            <button onClick={() => hook.callback('some APPEND function')}>some APPEND function</button>
            <button onClick={() => hook.callback('another APPEND function')}>another APPEND function</button>
        </>
    }
    const SelectToolbar = () => {
        return <>
            <button onClick={() => hook.callback('some Select function')}>some Select function</button>
            <button onClick={() => hook.callback('another Select function')}>another Select function</button>
        </>
    }

    ToolbarMap.set(SQLCommandsEnum.SET, () => <SetToolbar/>);
    ToolbarMap.set(SQLCommandsEnum.FROM, () => <FromToolbar/>);
    ToolbarMap.set(SQLCommandsEnum.APPEND, () => <AppendToolbar/>);
    ToolbarMap.set(SQLCommandsEnum.AS, () => <AsToolbar/>);
    ToolbarMap.set(SQLCommandsEnum.SELECT, () => <SelectToolbar/>);

    return <>
        {ToolbarMap.has(commandKey) && ToolbarMap.get(commandKey)()}
    </>

}

const constants = {
    MONACO_COMMAND_CLASS_NAME: 'mtk6'
}

const CodeEditorToolbar = ({onToolbarClose, ...props})=>{

    return <div className={'b-editor__toolbar'}>
        <button onClick={onToolbarClose} className={'b-editor__tolbar__btn-close'}>X</button>
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
                    <CodeEditorToolbar onToolbarClose={()=>{removeExistingToolbar()}}>
                        <ToolbarControls
                            commandKey={currentCommand}
                            callback={(e)=>{console.log(e)}}
                        />
                    </CodeEditorToolbar>,
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
