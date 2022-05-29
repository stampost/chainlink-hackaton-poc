import { useCallback, useEffect, useState } from 'react'
import { FetchHookReturn } from '../types/fetchHookReturn'

export const useFetchApiCall = ({ fetchFn }: { fetchFn: Function }): FetchHookReturn<any> => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [data, setData] = useState<object>()

  const fetchFnWrapper = useCallback(
    async ({ controller }: { controller: AbortController }) => {
      if (fetchFn === undefined) {
        return
      }
      try {
        setLoading(true)
        const data = await fetchFn()
        setData(data)
      } catch (e: any) {
        if (e.name === 'AbortError') {
          console.log('Request aborted')
        } else {
          setError(e)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    },
    [fetchFn],
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchFnWrapper({ controller })
    return () => controller.abort()
  }, [fetchFnWrapper])

  return {
    loading,
    error,
    data,
  }
}
