import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { DonationProvider } from './contexts/DonationContext'
import Header from './components/Header'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import Loading from './components/Loading'

// Lazy loading pages
const Home = lazy(() => import('./pages/Home'))
const Servicos = lazy(() => import('./pages/Servicos'))
const Sobre = lazy(() => import('./pages/Sobre'))
const Contato = lazy(() => import('./pages/Contato'))
const Login = lazy(() => import('./pages/Login'))
const Admin = lazy(() => import('./pages/Admin'))
const Doacoes = lazy(() => import('./pages/Doacoes'))
const ServicoDetalhes = lazy(() => import('./pages/ServicoDetalhes'))
const DoacaoDetalhes = lazy(() => import('./pages/DoacaoDetalhes'))

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ThemeProvider>
          <DonationProvider>
            <Router>
              <ScrollToTop />
              <div className="min-h-screen flex flex-col">
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#333',
                    color: '#fff',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10B981',
                      secondary: 'white',
                    },
                  },
                }} 
              />
              <Header />
              <main id="main-content" className="flex-grow flex flex-col">
                <Suspense fallback={<Loading />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/servicos" element={<Servicos />} />
                    <Route path="/servicos/:id" element={<ServicoDetalhes />} />
                    <Route path="/sobre" element={<Sobre />} />
                    <Route path="/contato" element={<Contato />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin" element={
                      <ProtectedRoute>
                        <Admin />
                      </ProtectedRoute>
                    } />
                    <Route path="/doacoes" element={<Doacoes />} />
                    <Route path="/doacoes/:id" element={<DoacaoDetalhes />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
            </Router>
          </DonationProvider>
        </ThemeProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App
