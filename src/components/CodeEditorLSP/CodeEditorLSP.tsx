import React, {useEffect, useRef, useState} from "react";
import {loader} from "@monaco-editor/react";
import { getLanguageService, TextDocument } from "vscode-json-languageservice";
import { MonacoToProtocolConverter, ProtocolToMonacoConverter } from 'monaco-languageclient/lib/monaco-converter';

import '../CodeEditor/CodeEditor.scss';


// register the JSON language with Monaco
function registerJSON(monaco) {
    monaco.languages.register({
        id:  'json',
        extensions: ['.json', '.bowerrc', '.jshintrc', '.jscsrc', '.eslintrc', '.babelrc'],
        aliases: ['JSON', 'json'],
        mimetypes: ['application/json'],
    });
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

    useEffect(()=>{
        if(!wrapperRef) return;

        const wrapper: HTMLElement = wrapperRef.current;

        loader.init().then(monaco => {
            const LANGUAGE_ID = 'json';
            const MODEL_URI = 'inmemory://model.json'
            const MONACO_URI = monaco.Uri.parse(MODEL_URI);
            registerJSON(monaco);
            const m2p = new MonacoToProtocolConverter();
            const p2m = new ProtocolToMonacoConverter();
            console.log(m2p, p2m);
            const editor = monaco.editor.create(wrapper, {
                language:  "json",
            })

            function getModel() {
                return editor.getModel();
            }

            function createDocument(model) {
                return TextDocument.create(MODEL_URI, model.getModeId(), model.getVersionId(), model.getValue());
            }

            function resolveSchema(url: string): Promise<string> {
                const promise = new Promise<string>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = () => resolve(xhr.responseText);
                    xhr.onerror = () => reject(xhr.statusText);
                    xhr.open("GET", url, true);
                    xhr.send();
                });
                return promise;
            }

            const jsonService = getLanguageService({
                schemaRequestService: resolveSchema
            });
            const pendingValidationRequests = new Map<string, number>();


            monaco.languages.registerCompletionItemProvider(LANGUAGE_ID, {
                provideCompletionItems(model, position, context, token) {
                    const document = createDocument(model);
                    const wordUntil = model.getWordUntilPosition(position);
                    const defaultRange = new monaco.Range(position.lineNumber, wordUntil.startColumn, position.lineNumber, wordUntil.endColumn);
                    const jsonDocument = jsonService.parseJSONDocument(document);
                    return jsonService.doComplete(document, m2p.asPosition(position.lineNumber, position.column), jsonDocument).then((list) => {
                        // @ts-ignore
                        const res = p2m.asCompletionResult(list, defaultRange);
                        debugger;
                        return res;
                    });
                },
                // @ts-ignore
                resolveCompletionItem(item, token) {
                    // @ts-ignore
                    return jsonService.doResolve(m2p.asCompletionItem(item)).then(result => p2m.asCompletionItem(result, item.range));
                }
            });

            monaco.languages.registerDocumentRangeFormattingEditProvider(LANGUAGE_ID, {
                provideDocumentRangeFormattingEdits(model, range, options, token) {
                    const document = createDocument(model);
                    const edits = jsonService.format(document, m2p.asRange(range), m2p.asFormattingOptions(options));
                    return p2m.asTextEdits(edits);
                }
            });

            monaco.languages.registerDocumentSymbolProvider(LANGUAGE_ID, {
                provideDocumentSymbols(model, token) {
                    const document = createDocument(model);
                    const jsonDocument = jsonService.parseJSONDocument(document);
                    return p2m.asSymbolInformations(jsonService.findDocumentSymbols(document, jsonDocument));
                }
            });

            monaco.languages.registerHoverProvider(LANGUAGE_ID, {
                provideHover(model, position, token) {
                    const document = createDocument(model);
                    const jsonDocument = jsonService.parseJSONDocument(document);
                    return jsonService.doHover(document, m2p.asPosition(position.lineNumber, position.column), jsonDocument).then((hover) => {
                        return p2m.asHover(hover)!;
                    });
                }
            });

            getModel().onDidChangeContent((event) => {
                validate();
            });

            function validate(): void {
                const document = createDocument(getModel());
                cleanPendingValidation(document);
                pendingValidationRequests.set(document.uri, setTimeout(() => {
                    pendingValidationRequests.delete(document.uri);
                    doValidate(document);
                }));
            }

            function cleanPendingValidation(document: TextDocument): void {
                const request = pendingValidationRequests.get(document.uri);
                if (request !== undefined) {
                    clearTimeout(request);
                    pendingValidationRequests.delete(document.uri);
                }
            }

            function doValidate(document: TextDocument): void {
                if (document.getText().length === 0) {
                    cleanDiagnostics();
                    return;
                }
                const jsonDocument = jsonService.parseJSONDocument(document);
                jsonService.doValidation(document, jsonDocument).then((diagnostics) => {
                    const markers = p2m.asDiagnostics(diagnostics);
                    monaco.editor.setModelMarkers(getModel(), 'default', markers);
                });
            }

            function cleanDiagnostics(): void {
                monaco.editor.setModelMarkers(getModel(), 'default', []);
            }

            setEditor(editor);
        });
    }, [wrapperRef]);

    useEffect(()=>{
        if(!value || !editor) return;
        editor.getModel().setValue(value);
    }, [editor, value]);

    return (
        <div className={'b-editor'}>
            <header></header>
            <div className={'b-editor__panel'} ref={wrapperRef} />
        </div>
    );
};

export default CodeEditor;