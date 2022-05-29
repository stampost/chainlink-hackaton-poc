export type FetchHookReturn<T> = {
  loading: boolean
  error?: Error
  data?: T
}
