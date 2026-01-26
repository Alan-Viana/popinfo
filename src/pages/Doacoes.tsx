import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { LuGift, LuTag, LuMapPin, LuPhone, LuMail, LuLogIn, LuSearch, LuUserCog } from 'react-icons/lu'
import FadeIn from '../components/FadeIn'
import { useDonations, type Donation } from '../contexts/DonationContext'
import { useAuth } from '../contexts/AuthContext'

const Doacoes = () => {
  const navigate = useNavigate()
  const { isAuthenticated: authorized } = useAuth()
  const { searchDonations, isLoading } = useDonations()
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = useMemo(() => searchDonations(searchTerm), [searchTerm, searchDonations])

  return (
    <div className="pt-32 pb-20 bg-slate-50 dark:bg-slate-900 flex-grow w-full">
      <Helmet>
        <title>Doações - PopInfo</title>
        <meta name="description" content="Contribua ou encontre doações de itens essenciais. Conectando quem quer ajudar com quem precisa." />
      </Helmet>
      <div className="container mx-auto px-8 max-w-6xl">
        <FadeIn>
          <div className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">Doações</h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Sua doação faz a diferença. <br className="hidden md:inline" />
              Contribua com itens essenciais como cadeiras de rodas, fraldas, alimentos e outros recursos.
            </p>
          </div>
        </FadeIn>

        <FadeIn className="mb-10">
          <div className="bg-white dark:bg-transparent p-6 md:p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-transparent flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto text-center md:text-left">
              <div className="w-12 h-12 shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl">
                <LuGift />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight">Quer fazer uma doação?</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">Cadastre itens para doação no nosso painel administrativo.</p>
              </div>
            </div>
            {authorized ? (
              <button
                onClick={() => navigate('/admin')}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 dark:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all hover:bg-blue-600 dark:hover:bg-blue-500 shadow-lg hover:shadow-xl"
              >
                <LuUserCog />
                Gerenciar Doações
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 dark:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all hover:bg-blue-600 dark:hover:bg-blue-500 shadow-lg hover:shadow-xl"
              >
                <LuLogIn />
                Fazer Login para Doar
              </button>
            )}
          </div>
        </FadeIn>

        {/* Filters */}
        <FadeIn className="mb-12">
          <div className="bg-white dark:bg-transparent p-4 md:p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-transparent backdrop-blur-sm overflow-hidden">
            <div className="flex flex-col gap-6">
              <div className="px-1 text-center">
                <label htmlFor="search-donations" className="text-2xl font-bold text-slate-700 dark:text-slate-200">Buscar por doações</label>
              </div>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LuSearch className="text-slate-400 dark:text-slate-500 text-lg" />
                </div>
                <input
                  id="search-donations"
                  type="text"
                  aria-label="Buscar doações"
                  placeholder="Busque por título, categoria ou local..."
                  className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-3.5 border border-slate-200 dark:border-transparent rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 text-base md:text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </FadeIn>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {isLoading ? (
             <li className="col-span-full flex justify-center py-20">
               <div role="status" aria-label="Carregando doações..." className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
             </li>
          ) : (
            <>
              {filtered.map((d, idx) => (
                <li key={`${d.titulo}-${idx}`}>
                  <FadeIn>
                    <DonationCard d={d} />
                  </FadeIn>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="text-center py-20 text-slate-500 dark:text-slate-300 md:col-span-2">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                    <LuGift className="text-slate-300 dark:text-slate-500" />
                  </div>
                  <p className="text-xl font-medium">Nenhuma doação encontrada.</p>
                  <p className="mt-2 text-slate-400 dark:text-slate-500">Tente buscar por outros termos ou limpe a busca.</p>
                </li>
              )}
            </>
          )}
        </ul>

        
      </div>
    </div>
  )
}

const DonationCard = ({ d }: { d: Donation }) => {
  const content = (
    <>
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
      
      <div className="p-6 md:p-8 flex-1 flex flex-col">
        <div className="flex flex-col items-center mb-5">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg inline-block bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
            Doação
          </span>
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">{d.titulo}</h3>
        <p className="text-slate-500 dark:text-slate-300 leading-relaxed text-sm">{d.descricao}</p>

        <div className="flex flex-col gap-4 mb-6 mt-6">
          {d.local && (
            <div className="flex items-center justify-center group/item">
              <LuMapPin className="mr-3 text-slate-400 dark:text-slate-500 group-hover/item:text-blue-500 transition-colors flex-shrink-0" />
              <span className="text-slate-700 dark:text-slate-200 text-sm">{d.local}</span>
            </div>
          )}
          {d.contatoTelefone && (
            <div className="flex items-center justify-center group/item">
              <LuPhone className="mr-3 text-slate-400 dark:text-slate-500 group-hover/item:text-blue-500 transition-colors flex-shrink-0" />
              <span className="text-slate-700 dark:text-slate-200 text-sm">{d.contatoTelefone}</span>
            </div>
          )}
          {d.contatoEmail && (
            <div className="flex items-center justify-center group/item min-w-0">
              <LuMail className="mr-3 text-slate-400 dark:text-slate-500 group-hover/item:text-blue-500 transition-colors flex-shrink-0" />
              <a href={`mailto:${d.contatoEmail}`} className="text-blue-600 dark:text-blue-400 font-medium hover:underline truncate text-sm">
                {d.contatoEmail}
              </a>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 dark:border-transparent pt-4 mt-auto">
          <div className="flex items-center justify-center mb-3">
            <LuTag className="mr-2 text-slate-400 dark:text-slate-500 text-sm" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">Detalhes</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {d.categoria && <span className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-100 dark:border-transparent">{d.categoria}</span>}
            {d.quantidade && <span className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-100 dark:border-transparent">{d.quantidade}</span>}
          </div>
        </div>
      </div>
    </>
  )

  const className = `bg-white dark:bg-transparent rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 dark:border-transparent h-full flex flex-col hover:-translate-y-2 group relative text-center`

  if (d.id) {
    return (
      <Link 
        to={`/doacoes/${d.id}`}
        className={`${className} cursor-pointer`}
        aria-label={`Ver detalhes de ${d.titulo}`}
      >
        {content}
      </Link>
    )
  }

  return (
    <div className={className}>
      {content}
    </div>
  )
}

export default Doacoes