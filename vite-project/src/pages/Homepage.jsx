import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import PromptInput from '../components/Promptinput'
import { ArrowRightIcon, ClockIcon, TrashIcon } from 'lucide-react'
import moment from "moment";

const homeTags = [
  'Resume Website',
  'Personal Website',
  'Business Website',
  'Marketing Website',
  'Educational Website',
  'Portfolio Website',
]

// Fallback sample data matching the video exactly
const dummyProjects = [
  {
    _id: '1',
    name: 'SaaSify Landing Page',
    createdAt: '2026-07-24T10:07:43.586Z',
    version: 1,
  },
  {
    _id: '2',
    name: 'Personal Portfolio',
    createdAt: '2026-07-23T13:07:43.586Z',
    version: 1,
  },
]

const HomePage = () => {
  const navigate = useNavigate()
  const {
    user,
    projects,
    loadingProjects,
    genratingProject,
    loadProjects,
    handleGenerate,
    handleDelete,
    logout,
  } = useAppContext()

  useEffect(() => {
    if (loadProjects) loadProjects()
  }, [])

  // Use projects from context if available, otherwise use dummyProjects to preview
  const displayProjects = projects && projects.length > 0 ? projects : dummyProjects

  return (
    <div className="h-screen overflow-y-scroll text-white font-sans bg-[url('/bg-img.png')] bg-cover bg-center bg-no-repeat">
      {/* Nav */}
      <nav className="sticky top-0 z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="logo" className="size-6" />
          <span className="text-xl font-semibold tracking-tight">BuilderAI</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-zinc-300">
          <span>{user?.name || 'john done'}</span>
          <button
            onClick={logout}
            className="py-1.5 px-3 border border-white/20 text-white hover:bg-white/10 text-xs rounded-md cursor-pointer bg-transparent"
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-6 pb-20 min-h-[70vh]">
        <div className="w-full max-w-2xl flex flex-col items-center">
          {/* Promo badge */}
          <div className="mx-auto w-fit flex items-center gap-2 p-1.5 pr-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[13px] text-white">
            <span className="px-3 py-1 text-[11px] bg-red-700 rounded-full font-medium tracking-wider">
              PROMO
            </span>
            <span>Create your first project for free buddy .</span>
          </div>

          {/* Title */}
          <h1 className="text-center text-4xl md:text-6xl font-medium mt-4 max-w-2xl text-white">
            Let's build your app together😏
          </h1>
          <p className="text-center text-sm md:text-base max-w-xl mt-4 text-white/65 leading-relaxed">
            Describe your idea and watch AI design, structure and launch your website instantly. No coding required.
          </p>

          {/* Prompt input */}
          <div className="w-full mt-6">
            <PromptInput
              onSubmit={handleGenerate}
              loading={genratingProject}
              placeholder="Create a portfolio website..."
              variant="glass"
              autoFocus
            />
          </div>

          {/* Scrolling marquee */}
          <div className="masked-marquee w-full mt-4 max-w-2xl overflow-hidden py-1">
            <div
              className="flex items-center animate-marquee gap-3 w-max"
              style={{ animationDuration: '13s' }}
            >
              {[...homeTags, ...homeTags].map((tag, i) => (
                <button
                  key={i}
                  onClick={() => handleGenerate(tag)}
                  disabled={genratingProject}
                  className="px-4 py-1.5 border border-white/25 rounded-full text-sm text-white bg-white/10 hover:bg-white/20 cursor-pointer shrink-0 transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* All projects section */}
          <div className="mt-12 w-full">
            {/* Header row */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <p className="text-xs font-medium uppercase text-zinc-300 tracking-widest">
                ALL PROJECTS
              </p>
              <span className="text-xs text-zinc-400">
                {displayProjects.length} {displayProjects.length === 1 ? 'project' : 'projects'}
              </span>
            </div>

            {/* Projects list */}
            <div className="space-y-3 max-h-[80vh] overflow-y-auto pr-1">
              {displayProjects.map((p) => (
                <div
                  key={p._id}
                  onClick={() => navigate(`/builder/${p._id}`)}
                  className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex items-center 
                  justify-between group hover:border-white/25 hover:bg-white/10 cursor-pointer backdrop-blur-md 
                  transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <ClockIcon size={12} className="text-zinc-400" />
                        {moment(p.updatedAt || p.createdAt).fromNow() }
                      </span>
                      <span className="text-zinc-400">
                        v{p.version || 1}
                      </span>
                    </div>
                    
                  </div>
                  <div onClick={(e)=>{
                    e.stopPropagation();
                    handleDelete(p._id)
                  }}
                   className='flex items-center gap-2'> 
                    <button className='p-1.5 rounded-md text-zinc-200 hover:text-red-400 hover:bg-white/10
                    opacity-0 group-hover:opacity-100 transition-opacity'>
                      <TrashIcon size={14} />
                    </button>
                    <ArrowRightIcon size={14} className='text-zinc-200 group-hover:text-white' />
                  </div>
              
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage