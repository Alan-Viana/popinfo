import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { LuArrowLeft, LuClock, LuList, LuMapPin, LuPhone, LuMail } from 'react-icons/lu'
import FadeIn from '../components/FadeIn'
import { servicesData, type ServiceLocation } from '../data/services'
import { getStoredServices } from '../utils/storage'
import { supabase, isSupabaseEnabled } from '../lib/supabase'

const ServicoDetalhes = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [service, setService] = useState<ServiceLocation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchService = async () => {
      // 1. First try to find in Supabase if enabled
      if (isSupabaseEnabled() && supabase && id) {
        try {
          const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('id', id)
            .single()

          if (error) {
            // Only log error if it's not "Row not found" (code PGRST116)
            if (error.code !== 'PGRST116') {
              console.error('Error fetching service from Supabase:', error)
            }
          } else if (data) {
            setService({ ...data, id: String(data.id) } as ServiceLocation)
            setLoading(false)
            return
          }
        } catch (err) {
          console.error('Unexpected error fetching service from Supabase:', err)
        }
      }

      // 2. Fallback to static data
      const staticService = servicesData.find(s => s.id === id)
      
      if (staticService) {
        setService(staticService)
        setLoading(false)
        return
      }

      // 3. Fallback to local storage
      const userServices = getStoredServices()
      const userService = userServices.find(s => s.id === id)
      
      if (userService) {
        setService(userService)
        setLoading(false)
        return
      }

      setLoading(false)
    }

    fetchService()
  }, [id])

  if (loading) {
    return (
      <div className="flex-grow w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="flex-grow w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-center px-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Serviço não encontrado</h2>
        <button 
          onClick={() => navigate('/servicos')}
          className="text-blue-600 hover:underline font-medium"
        >
          Voltar para lista de serviços
        </button>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-40 bg-slate-50 dark:bg-slate-900 flex-grow w-full">
      <Helmet>
        <title>{service.name} - PopInfo</title>
        <meta name="description" content={`Detalhes sobre ${service.name}`} />
      </Helmet>
      
      <div className="container mx-auto px-6 max-w-5xl">
        <FadeIn>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8 font-medium"
          >
            <LuArrowLeft />
            Voltar
          </button>
        </FadeIn>

        <FadeIn>
          {/* Header Section */}
          <div className="mb-12 text-center max-w-4xl mx-auto">
            <span className="inline-block text-sm font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mb-4">
              {service.type}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">{service.name}</h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              {service.description}
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-6 md:gap-8 mb-8 max-w-3xl mx-auto">
            
            {/* Services Offered Card */}
            <div className="bg-white dark:bg-transparent rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-transparent hover:shadow-md transition-shadow h-full flex flex-col items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <LuList className="text-xl" />
                </div>
                Serviços oferecidos
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {service.services_offered.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-transparent">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                    <span className="text-slate-700 dark:text-slate-200 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hours Card */}
            <div className="bg-white dark:bg-transparent rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-transparent hover:shadow-md transition-shadow backdrop-blur-sm overflow-hidden h-full flex flex-col items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <LuClock className="text-xl" />
                </div>
                Horário
              </h3>
              
              <div className="bg-slate-50 dark:bg-transparent rounded-2xl p-6 border border-slate-100 dark:border-transparent flex-1 flex flex-col gap-2 w-full items-center text-center">
                {service.hours.toLowerCase().includes('24') ? (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">Aberto 24h</span>
                    </div>
                ) : (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Funcionamento</span>
                  </div>
                )}
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{service.hours}</p>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white dark:bg-transparent rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-transparent hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex flex-col items-center gap-3 shrink-0 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <LuMapPin className="text-xl" />
                </div>
                Localização
              </h3>
              
              <div className="bg-slate-50 dark:bg-transparent rounded-2xl p-6 border border-slate-100 dark:border-transparent flex-1 flex flex-col items-center text-center w-full">
                <p className="text-lg font-bold text-slate-900 dark:text-white leading-snug mb-2">
                  {service.address}{service.number ? `, ${service.number}` : ''}{service.complement ? ` - ${service.complement}` : ''}
                </p>
                <p className="text-slate-600 dark:text-slate-400 mb-6 flex-grow">{service.neighborhood}, {service.city} - CEP: {service.zip}</p>
                
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${service.address}, ${service.city}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transform hover:-translate-y-0.5 text-sm"
                >
                  <LuMapPin />
                  Abrir no Google Maps
                </a>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white dark:bg-transparent rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-transparent hover:shadow-md transition-shadow flex flex-col justify-center h-full items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <LuPhone className="text-xl" />
                  </div>
                  Contatos
                </h3>
                
                <div className="space-y-4 w-full">
                  <div className="flex flex-col items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-transparent border border-slate-100 dark:border-transparent text-center">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white shadow-sm shrink-0">
                      <LuPhone className="text-sm" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-0.5">Telefone</p>
                      <p className="text-lg text-slate-900 dark:text-white font-bold">{service.phone}</p>
                    </div>
                  </div>

                  <a href={`mailto:${service.email}`} className="flex flex-col items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-transparent border border-slate-100 dark:border-transparent hover:bg-blue-50 dark:hover:bg-white/5 hover:border-blue-200 dark:hover:border-white/10 transition-all group text-center">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white shadow-sm group-hover:scale-110 transition-transform shrink-0">
                      <LuMail className="text-sm" />
                    </div>
                    <div className="min-w-0 flex-1 w-full">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-0.5">E-mail</p>
                      <p className="text-lg text-slate-900 dark:text-white font-bold whitespace-nowrap overflow-x-auto pb-1 scrollbar-thin">{service.email}</p>
                    </div>
                  </a>
                </div>
              </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}

export default ServicoDetalhes
