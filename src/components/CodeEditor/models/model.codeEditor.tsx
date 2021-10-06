import React, {ReactComponentElement} from "react";
import ReactDOM from "react-dom";
import CodeEditorToolbarWrapper from "../components/ToolbarWrapper";
import monacoClassNames from "./consts.monacoClassNames";
import SQLCommandsEnum from "./enum.SQLCommands";

const complexCommands = [
    'ORDER_BY',
    'GROUP_BY'
]

export const complexCommandsUtils = {
    getCommandPart(index: number = 0){
        const set = new Set();
        complexCommands.forEach(e => set.add(e.split('_')[index]));
        return Array.from(set);
    },
}

export const codeEditorUtils = {
    getElement(target){
        return target instanceof Element ? target : target.element;
    },

    getElementText(element: HTMLElement): string {
        return element.textContent.replace(/\s/g,'');
    },

    isCommand: function(target: any): boolean {
        const element = this.getElement(target);
        const targetClassName = element.className;

        return targetClassName === monacoClassNames.SQL_COMMAND;
    },

    isComplexCommandEnding: function(target: any): boolean {
        const element = this.getElement(target);
        if(!this.isCommand(element)) return false;
        const elementText = this.getElementText(element);

        return complexCommandsUtils.getCommandPart(1).includes(elementText);
    },
    isComplexCommandStarting: function(target: any): boolean {
        const element = this.getElement(target);
        if(!this.isCommand(element)) return false;
        const elementText = this.getElementText(element);

        return complexCommandsUtils.getCommandPart(0).includes(elementText);
    },

    isDefaultBlock: function(target: any) {
        const element = this.getElement(target);
        const targetClassName = element.className;

        return targetClassName === monacoClassNames.DEFAULT;
    },

    isWhiteSpaceBlock: function(target: any) {
        const element = this.getElement(target);
        const isWhiteSpaceOnlyBlock = this.getElementText(element) === '';

        return isWhiteSpaceOnlyBlock;
    },

    buildComplexCommand: function(target: any) {
        const element = this.getElement(target);
        let cond = false;
        const rec = (element)=>{
            const sib = element.previousElementSibling;
            if(!sib) return;
            if(this.isComplexCommandStarting(sib)) {
                rec(sib);
                cond = true;
            } else {
                rec(sib);
            }
        }
        rec(element);
        console.log(cond);
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
    private domNode: HTMLElement = document.createElement('div');

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

        component && this.editor.changeViewZones((changeAccessor) => {
            this.setDomNodeAttributes();
            this.setViewZoneId(changeAccessor, lineNumber);
            this.renderToolbar(component);
        });

    }

    private setDomNodeAttributes() {
        this.domNode.className = 'b-editor--toolbar__wrapper';
    }

    private renderToolbar(component) {
        ReactDOM.render(
            <CodeEditorToolbarWrapper onToolbarClose={()=>{this.removeExistingToolbar()}}>
                {component}
            </CodeEditorToolbarWrapper>,
            this.domNode,
        );
    }

    private setViewZoneId(changeAccessor, lineNumber: number){
        this.viewZoneId = changeAccessor.addZone({
            afterLineNumber: lineNumber - 1,
            heightInLines: 3,
            domNode: this.domNode
        });
    }

    private handleEditorEvent(e){
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
            this.handleEditorEvent(e);
        });
    }

}