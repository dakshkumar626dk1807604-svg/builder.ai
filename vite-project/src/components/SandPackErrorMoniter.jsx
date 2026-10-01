import React, { useEffect } from 'react'
import { useSandpack } from '@codesandbox/sandpack-react'

const SandPackErrorMoniter = ({ onErrorChange }) => {
  const { sandpack } = useSandpack()
  const { error } = sandpack

  useEffect(() => {
    if (error) {
      const msg = error.message || ''
      const isNetworkError =
        msg.includes('Failed to fetch') ||
        msg.includes('col.csbops.io') ||
        msg.includes('ERR_CONNECTION_TIMED_OUT') ||
        msg.includes('net::ERR') ||
        msg.includes('net::Err')

      if (isNetworkError) {
        onErrorChange(false)
        return
      }
    }
  }, [error, onErrorChange])

  return null
}

export default SandPackErrorMoniter