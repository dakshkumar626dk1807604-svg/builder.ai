import React, { useState, useMemo } from 'react'
import { detectDependencies } from '../utils/sandpackUtils'
import SandPackErrorMoniter from './SandPackErrorMoniter'
import { SandpackPreview, SandpackProvider, SandpackLayout } from '@codesandbox/sandpack-react'

const FullPagePreview = ({ files }) => {
  const [showErrorOverlay, setShowErrorOverlay] = useState(true)

  const sandpackFiles = useMemo(() => {
    if (!files) return {};
    const spFiles = {}
    for (const [path, content] of Object.entries(files)) {
      // Ensure path format is compatible with Sandpack
      const formattedPath = path.startsWith('/') ? path : `/${path}`;
      spFiles[formattedPath] = { code: content }
    }
    return spFiles
  }, [files])

  const dependencies = useMemo(() => {
    if (!files) return {};
    return detectDependencies(files)
  }, [files])

  return (
    <div className="h-screen w-screen bg-white overflow-hidden">
      <SandpackProvider
        template="react"
        files={sandpackFiles}
        customSetup={{ dependencies }}
        options={{
          externalResources: [
            'https://cdn.tailwindcss.com',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
          ],
          logLevel: 0
        }}
        style={{ height: '100vh', width: '100vw' }}
      >
        <SandPackErrorMoniter onErrorChange={setShowErrorOverlay} />
        <SandpackLayout style={{ height: '100%', width: '100%', border: 'none', background: 'transparent' }}>
          <SandpackPreview
            showNavigator={false}
            showRefreshButton={false}
            showOpenInCodeSandbox={false}
            showSandpackErrorOverlay={showErrorOverlay}
            style={{ height: '100%', width: '100%' }}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  )
}

export default FullPagePreview