import React, {ReactComponentElement} from "react";
import ReactDOM from "react-dom";
import CodeEditorToolbarWrapper from "../components/ToolbarWrapper";
import monacoClassNames from "./consts.monacoClassNames";
import SQLCommandsEnum from "./enum.SQLCommands";

export const codeEditorUtils = {
    isCommand: function(target: any) {
        const element = target instanceof Element ? target : target.element;
        const targetClassName = element.className;

        return targetClassName === monacoClassNames.SQL_COMMAND;

    },
    getClusterCommand: function(element: HTMLElement): SQLCommandsEnum {
        if(this.isCommand(element)) {
            return element.textContent.toUpperCase() as SQLCommandsEnum;
        }
    },
}

export default class CodeEditorModel {
    private editor;
    private viewZoneId: string;
    private existingCommand: string;
    private existingLineNumber: number;
    private callback: Function;

    constructor(editor, callback) {
        this.editor = editor;
        this.callback = callback;
        this.handleEditorEvents();
    }

    public removeExistingToolbar() {
        if(!this.viewZoneId) return;
        this.editor.changeViewZones((changeAccessor) =>{
            changeAccessor.removeZone(this.viewZoneId);
        });
        this.existingCommand = this.existingLineNumber = null;
    }

    public addToolbarAboveLine(lineNumber: number, component: ReactComponentElement<any>) {

        this.removeExistingToolbar();

        this.editor.changeViewZones((changeAccessor) => {

            const domNode = document.createElement('div');

            domNode.className = 'b-editor--toolbar__wrapper';

            ReactDOM.render(
                <CodeEditorToolbarWrapper onToolbarClose={()=>{this.removeExistingToolbar()}}>
                    {component}
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

    public showEvent(e){

        const targetElement = e.target.element;
        if(!targetElement) return;

        if(codeEditorUtils.isCommand(e.target)) {
            const currentCommand = codeEditorUtils.getClusterCommand(targetElement);
            const currentLineNumber = e.target.position.lineNumber;
            // execute if not same command as previous, unless line number not as previous
            if(currentLineNumber !== this.existingLineNumber || this.existingCommand !== currentCommand) {
                this.callback(e, currentLineNumber, currentCommand);
            }
            this.existingCommand = currentCommand;
            this.existingLineNumber = currentLineNumber;

        }
    }

    private handleEditorEvents(){
        this.editor.onMouseMove((e) => {
            this.showEvent(e);
        });
    }

}