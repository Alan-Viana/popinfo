import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LuLogIn, LuMenu, LuX, LuMoon, LuSun, LuHouse, LuHeartHandshake, LuGift, LuInfo, LuMail } from 'react-icons/lu'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  const mobileTriggerRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const shouldLock = isMenuOpen
    const html = document.documentElement
    const body = document.body
    if (shouldLock) {
      html.style.overflow = 'hidden'
      body.style.overflow = 'hidden'
    } else {
      html.style.overflow = ''
      body.style.overflow = ''
    }
    return () => {
      html.style.overflow = ''
      body.style.overflow = ''
    }
  }, [isMenuOpen])

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location])

  useEffect(() => {
    if (isMenuOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement
      // Small delay to ensure AnimatePresence has mounted the element
      setTimeout(() => {
        if (menuRef.current) {
          const focusables = Array.from(
            menuRef.current.querySelectorAll<HTMLElement>(
              'a[href], button, [tabindex]:not([tabindex="-1"])'
            )
          ).filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1)
          if (focusables[0]) focusables[0].focus()
        }
      }, 100)
      
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsMenuOpen(false)
        } else if (e.key === 'Tab' && menuRef.current) {
          const container = menuRef.current
          const focusables = Array.from(
            container.querySelectorAll<HTMLElement>(
              'a[href], button, [tabindex]:not([tabindex="-1"])'
            )
          ).filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1)
          if (focusables.length === 0) return
          const first = focusables[0]
          const last = focusables[focusables.length - 1]
          const active = document.activeElement as HTMLElement
          if (!e.shiftKey && active === last) {
            e.preventDefault()
            first.focus()
          } else if (e.shiftKey && active === first) {
            e.preventDefault()
            last.focus()
          }
        }
      }
      document.addEventListener('keydown', onKey)
      return () => {
        document.removeEventListener('keydown', onKey)
      }
    } else {
      if (previouslyFocusedRef.current) previouslyFocusedRef.current.focus()
    }
  }, [isMenuOpen])

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  const navLinks = [
    { path: '/',
    label: 'Início',
    icon: LuHouse
  },
  {
    path: '/servicos', label: 'Serviços', icon: LuHeartHandshake },
    { path: '/doacoes', label: 'Doações', icon: LuGift },
    { path: '/sobre', label: 'Sobre', icon: LuInfo },
    { path: '/contato', label: 'Contato', icon: LuMail }
  ]

  const menuVariants: Variants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: 'easeInOut'
      }
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
        staggerChildren: 0.07,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    closed: { opacity: 0, y: 10 },
    open: { opacity: 1, y: 0 }
  }

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isMenuOpen
          ? 'bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-transparent py-3'
          : scrolled
            ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50 dark:border-slate-800/50 py-3'
            : 'bg-transparent py-5'
      }`}
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg transition-all">
        Pular para o conteúdo
      </a>
      <div className="container mx-auto px-8 max-w-7xl">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="Logo PopInfo" 
              className="w-12 h-12 md:w-14 md:h-14 rounded-xl shadow-lg group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 object-cover dark:brightness-0 dark:invert dark:shadow-none"
            />
            <div className={`text-3xl font-extrabold tracking-tight bg-gradient-to-br from-slate-800 to-blue-600 bg-clip-text text-transparent transition-opacity duration-300 dark:text-white dark:bg-none group-hover:opacity-80`}>
              PopInfo
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex flex-1 justify-center gap-10 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-base font-semibold transition-all duration-300 relative py-1 hover:text-blue-600 dark:hover:text-blue-400 ${
                  isActive(link.path) 
                    ? 'text-blue-600 dark:text-blue-400 after:w-full' 
                    : 'text-slate-600 dark:text-slate-300 after:w-0 hover:after:w-full'
                } after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 after:transition-all after:duration-300`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="text-slate-700 dark:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xl"
              aria-label="Alternar tema"
              title="Alternar tema"
            >
              {theme === 'dark' ? <LuSun /> : <LuMoon />}
            </button>

            {isAuthenticated ? (
              <button 
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 bg-blue-600 dark:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 hover:bg-slate-900 dark:hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                <LuLogIn />
                Admin
              </button>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 bg-slate-900 dark:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 hover:bg-blue-600 dark:hover:bg-slate-900 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                <LuLogIn />
                Área Restrita
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2 z-50">
            <button
              onClick={toggleTheme}
              className="text-slate-700 dark:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xl"
              aria-label="Alternar tema"
              title="Alternar tema"
            >
              {theme === 'dark' ? <LuSun /> : <LuMoon />}
            </button>
            <button 
              className="text-slate-900 dark:text-white text-2xl p-2"
              ref={mobileTriggerRef}
              onClick={(e) => {
                mobileTriggerRef.current = e.currentTarget
                setIsMenuOpen(!isMenuOpen)
              }}
              aria-label="Abrir menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu-overlay"
            >
              {isMenuOpen ? <LuX /> : <LuMenu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu-overlay"
            ref={menuRef}
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 bg-white dark:bg-slate-900 z-40 lg:hidden flex flex-col h-full"
          >
            <div className="flex flex-col h-full pt-28 px-6 pb-8 overflow-y-auto">
              <nav className="flex flex-col gap-4 items-center w-full">
                {navLinks.map((link) => (
                  <motion.div
                    key={link.path}
                    variants={itemVariants}
                    className="w-full"
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`group flex items-center gap-4 w-full px-6 py-4 rounded-2xl transition-all duration-300 ${
                        isActive(link.path)
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md'
                      }`}
                    >
                      <span className={`text-xl p-2 rounded-xl transition-colors ${
                        isActive(link.path)
                          ? 'bg-white/20 text-white'
                          : 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 group-hover:scale-110'
                      }`}>
                        <link.icon />
                      </span>
                      <span className="font-bold text-lg tracking-wide">{link.label}</span>
                      {isActive(link.path) && (
                        <motion.div 
                          layoutId="active-pill"
                          className="ml-auto w-2 h-2 rounded-full bg-white" 
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}
                
                <div className="w-full pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                  {isAuthenticated ? (
                    <motion.div variants={itemVariants} className="w-full">
                      <button 
                        onClick={() => {
                          setIsMenuOpen(false)
                          navigate('/admin')
                        }}
                        className="flex items-center justify-center gap-3 bg-slate-900 dark:bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg w-full shadow-xl hover:bg-slate-800 dark:hover:bg-blue-500 transition-all active:scale-95"
                      >
                        <LuLogIn />
                        Área Administrativa
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div variants={itemVariants} className="w-full">
                      <button 
                        onClick={() => {
                          setIsMenuOpen(false)
                          navigate('/login')
                        }}
                        className="flex items-center justify-center gap-3 bg-slate-900 dark:bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg w-full shadow-xl hover:bg-slate-800 dark:hover:bg-blue-500 transition-all active:scale-95"
                      >
                        <LuLogIn />
                        Área Restrita
                      </button>
                    </motion.div>
                  )}
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Header
