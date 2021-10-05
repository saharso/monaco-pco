import {useState} from "react";

export default function useOnToolbarItemClick() {

    const [value, setValue] = useState();

    return {
        callback: (value)=>{
            setValue(value);
        },
        value,
    }
}
