import { LuHeartHandshake } from 'react-icons/lu'

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 pt-8 pb-6 mt-auto border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="container mx-auto px-8 max-w-7xl flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 dark:bg-slate-800 rounded-lg flex items-center justify-center text-white shadow-sm">
            <LuHeartHandshake />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">PopInfo</span>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-500 text-center flex flex-col sm:flex-row items-center gap-2">
          <span>por Alan Viana • Projeto de portfólio</span>
          <span className="hidden sm:inline">•</span>
          <span>© 2026 • v1.0</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
