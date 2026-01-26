import { LuLoader } from 'react-icons/lu'

const Loading = () => {
  return (
    <div className="flex-grow w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <LuLoader className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">Carregando...</p>
      </div>
    </div>
  )
}

export default Loading
