import { Loader2 as Loader2Icon } from 'lucide-react';

/**
 * Loading component that displays a centered spinner on a full-screen background.
 * @returns {JSX.Element} A full-screen loading spinner
 */
export const Loading = () => {
  return (
    <div role="status" aria-label="Loading" className='h-screen flex items-center justify-center
    bg-white'>
        <Loader2Icon size={26} className="animate-spin
        text-zinc-950"/>
    </div>
  )
}
  export default Loading
