import React, { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom'
import { FolderTree, MessageSquare } from 'lucide-react'
import BuilderHeader from '../components/BuilderHeader'
import PromptInput from '../components/Promptinput'
import Loading from '../components/Loading'
import ChatPanel from '../components/ChatPanel'
import FileExplorer from '../components/fileExplorer'
import api from '../api/api'
import toast from 'react-hot-toast'
import { exportProjectZip } from '../utils/exportProject'
import PreviewPanel from '../components/PreviewPanel'
import AgentProgressDashboard from '../components/AgentProgressDashboard'

const BuilderPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [leftTab, setLeftTab] = useState('chat')
  const [publishing, setPublishing] = useState(false)
  const [publishUrl, setPublishUrl] = useState(null)

  const {
    activeProject,
    loadingActiveProject,
    activeFile,
    setActiveFile,
    showCode,
    setShowCode,
    loadProject,
    logout,
    chatLoading,
    handleChat
  } = useAppContext()

  useEffect(() => {
    if (!id) return
    loadProject(id)
  }, [id])
useEffect(() => {
    if (!id) return
    loadProject(id)
  }, [id]) 
  const handleOpenPreview = () => {
    if (!id) return
    window.open(`/preview/${id}`, '_blank')
  }

  const handlePublish = async () => {
    if (!id) return
    setPublishing(true)
    try {
      await api.post(`/api/projects/${id}/publish`)
      const url = `${window.location.origin}/publish/${id}`
      setPublishUrl(url)
      toast.success('Website Published successfully')
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.error || 'Publish failed')
    } finally {
      setPublishing(false)
    }
  }

  const handleDownload = () => {
    if (!activeProject) return;
    exportProjectZip(activeProject);
  }

  if (loadingActiveProject || !activeProject) {
    return <Loading />
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden text-zinc-900 relative">
      {/* Top Bar Header */}
      <BuilderHeader
        projectName={activeProject.name}
        version={activeProject.version}
        showCode={showCode}
        publishing={publishing}
        onToggleShowCode={() => setShowCode(!showCode)}
        onOpenPreview={handleOpenPreview}
        onPublish={handlePublish}
        onDownload={handleDownload}
        onBack={() => navigate('/')}
        onLogout={logout}
      />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[320px] shrink-0 flex flex-col border-r border-zinc-200 bg-white">
          {/* Sidebar Tabs */}
          <div className="flex border-b border-zinc-100">
            <button
              onClick={() => setLeftTab('chat')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer ${
                leftTab === 'chat'
                  ? 'text-zinc-900 border-b-2 border-zinc-900'
                  : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >
              <MessageSquare size={13} /> Chat
            </button>
            <button
              onClick={() => setLeftTab('files')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer ${
                leftTab === 'files'
                  ? 'text-zinc-900 border-b-2 border-zinc-900'
                  : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >
              <FolderTree size={13} /> Files
            </button>
          </div>
          {/* sidebar content  */}
          <div className="flex-1 overflow-hidden">
            {leftTab === 'chat' ? (
              <ChatPanel messages={activeProject.messages} onSend={handleChat} loading={chatLoading} />
            ) : (
              <FileExplorer
                files={activeProject.files}
                activeFiles={activeFile}
                onFileSelect={(path) => {
                  setActiveFile(path)
                  setShowCode(true)
                }}
              />
            )}
          </div>
        </div>

        {/* preview / code area */}
        <div className="flex-1 overflow-hidden">
          {activeProject.status === 'pending' ||
          activeProject.status === 'generating' ||
          activeProject.status === 'failed' ? (
            <AgentProgressDashboard project={activeProject} />
          ) : (
            <PreviewPanel project={activeProject} activeFile={activeFile} showCode={showCode} />
          )}
        </div>
      </div>

      {/* Publish success modal */}
      {publishUrl && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold text-zinc-900">Your website is live!</h2>
              <button
                onClick={() => setPublishUrl(null)}
                className="text-zinc-400 hover:text-zinc-900 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-zinc-500 mb-4">
              Anyone with the link below can view your published site
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">
              Published Link
            </p>
            <input
              readOnly
              value={publishUrl}
              className="w-full text-sm text-zinc-700 border-b border-zinc-200 pb-2 mb-4 outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(publishUrl)
                  toast.success('Link copied!')
                }}
                className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-lg cursor-pointer"
              >
                Copy Link
              </button>
              <button
                onClick={() => window.open(publishUrl, '_blank')}
                className="flex-1 py-2.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-sm font-medium rounded-lg cursor-pointer"
              >
                Open Site
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BuilderPage