import { JSX } from "react";

export function LoaderMini(): JSX.Element {
    return (
        <div className="flex items-center justify-center h-16 p-10">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500" />
        </div>
    );
}