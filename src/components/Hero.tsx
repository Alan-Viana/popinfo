import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LuSearch } from 'react-icons/lu'
import { motion } from 'framer-motion'
import FadeIn from './FadeIn'

const Hero = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate('/servicos') 
    } else {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement
      input?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <section className="min-h-[90vh] flex items-center justify-center bg-slate-50 dark:bg-slate-900 relative overflow-hidden pt-32 md:pt-20 transition-colors duration-500 perspective-[1000px]">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[20%] w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-900/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] bg-purple-400/10 dark:bg-purple-900/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
      </div>

      <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-b from-transparent to-white dark:to-slate-900 pointer-events-none transition-colors duration-500" />

      <div className="container mx-auto px-8 max-w-5xl text-center z-10 relative">
        <FadeIn>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-10 leading-tight text-slate-900 dark:text-white tracking-tight">
            Central de Informações <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Apoio ao Cidadão</span>
          </h1>
        </FadeIn>



        <FadeIn>
          <div className="max-w-3xl mx-auto w-full">
            <motion.div 
              whileHover={{ scale: 1.02, rotateX: 2, rotateY: 0, boxShadow: "0px 20px 40px rgba(0,0,0,0.1)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative flex flex-col md:flex-row gap-2 bg-white dark:bg-transparent p-2 rounded-2xl shadow-xl border border-slate-100 dark:border-transparent backdrop-blur-sm transform-style-3d"
            >
              <input
                type="text"
                className="w-full px-4 py-3 md:px-6 md:py-4 text-base md:text-lg rounded-xl focus:outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent"
                placeholder="Busque por serviço ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button 
                onClick={handleSearch} 
                className="bg-blue-600 dark:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all hover:bg-blue-700 dark:hover:bg-blue-600 hover:shadow-lg md:w-auto w-full shrink-0"
              >
                <LuSearch />
                Buscar
              </button>
            </motion.div>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-light mt-10 md:mt-16 lg:mt-24 mb-12">
              Conectamos você a serviços socioassistenciais essenciais na capital paulista. Informação, ajuda, apoio e recursos em um só lugar.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

export default Hero
