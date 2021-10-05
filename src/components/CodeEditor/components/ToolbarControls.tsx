import React, {useEffect} from "react";
import SQLCommandsEnum from '../models/enum.SQLCommands';
import useOnToolbarItemClick from "../hooks/useOnToolbarItemClick";

const ToolbarMap: Map<SQLCommandsEnum, Function> = new Map();
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

export default ToolbarControls;