import React, {useEffect, useRef, useState} from 'react';

export type CodeEditorProps = {


};

const CodeEditor: React.FunctionComponent<CodeEditorProps> = (
    {
    }
) => {

    const prizeListRef = useRef(null);

    return <div ref={prizeListRef} className="b-code-editor">
        hello
    </div>;
};

export default CodeEditor;