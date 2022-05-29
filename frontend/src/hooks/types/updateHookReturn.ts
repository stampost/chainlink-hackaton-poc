import { FetchHookReturn } from './fetchHookReturn'

export type UpdateHookReturn<U, T> = [(data: U) => void, FetchHookReturn<T>]
