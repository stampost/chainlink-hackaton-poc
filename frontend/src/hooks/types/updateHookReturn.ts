import { FetchHookReturn } from "./fetchHookReturn";

export type UpdateHookReturn<T> = [
    (data: object) => void,
    FetchHookReturn<T>
]
