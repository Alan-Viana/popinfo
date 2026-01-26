import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { LuMapPin, LuPhone, LuClock, LuMail, LuList, LuSearch } from 'react-icons/lu'
import FadeIn from '../components/FadeIn'
import { servicesData, type ServiceLocation } from '../data/services'

import { supabase, isSupabaseEnabled } from '../lib/supabase'
import { getStoredServices } from '../utils/storage'

const Servicos = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const typeParam = searchParams.get('type')
  const [selectedType, setSelectedType] = useState<string>(typeParam || 'Todos')
  const [userServices, setUserServices] = useState<ServiceLocation[]>([])

  useEffect(() => {
    if (typeParam) {
      setSelectedType(typeParam)
    }
  }, [typeParam])

  useEffect(() => {
    const loadServices = async () => {
      if (isSupabaseEnabled() && supabase) {
        try {
          const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('created_at', { ascending: false })

          if (error) {
            console.error('Error fetching services from Supabase:', error)
            return
          }

          if (data) {
            setUserServices(data)
          }
        } catch (err) {
          console.error('Unexpected error loading services:', err)
        }
      } else {
        setUserServices(getStoredServices())
      }
    }

    loadServices()
  }, [])


  const handleTypeChange = (type: string) => {
    setSelectedType(type)
    if (type === 'Todos') {
      searchParams.delete('type')
      setSearchParams(searchParams)
    } else {
      setSearchParams({ type })
    }
  }

  const allServices = useMemo(() => [...servicesData, ...userServices], [userServices])
  const uniqueTypes = useMemo(() => ['Todos', ...Array.from(new Set(allServices.map(s => s.type)))], [allServices])

  const filteredServices = useMemo(() => allServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.services_offered.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = selectedType === 'Todos' || service.type === selectedType

    return matchesSearch && matchesType
  }), [allServices, searchTerm, selectedType])

  return (
    <div className="pt-32 pb-20 bg-slate-50 dark:bg-slate-900 flex-grow w-full">
      <Helmet>
        <title>Rede Socioassistencial - PopInfo</title>
        <meta name="description" content="Encontre serviços da rede socioassistencial, saúde, educação e moradia em São Paulo. Consulte endereços e contatos." />
      </Helmet>
      <div className="container mx-auto px-6 max-w-7xl">
        <FadeIn>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">Rede Socioassistencial</h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Encontre os serviços mais próximos de você. Consulte endereços, horários e contatos das unidades de atendimento.
            </p>
          </div>
        </FadeIn>

        {/* Offline Warning */}
        {(!isSupabaseEnabled() || !supabase) && (
          <FadeIn className="mb-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-center">
              <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
                ⚠️ Modo Offline: Exibindo apenas serviços padrão e salvos neste dispositivo. Serviços online não estão disponíveis.
              </p>
            </div>
          </FadeIn>
        )}

        {/* Filters */}
        <FadeIn className="mb-12">
          <div className="bg-white dark:bg-transparent p-4 md:p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-transparent backdrop-blur-sm overflow-hidden">
            <div className="flex flex-col gap-6">
              
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LuSearch className="text-slate-400 dark:text-slate-500 text-lg" />
                </div>
                <input
                  type="text"
                  aria-label="Buscar serviços"
                  placeholder="Busque por nome, bairro ou serviço..."
                  className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-3.5 border border-slate-200 dark:border-transparent rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 text-base md:text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2 md:gap-3 justify-center w-full">
                {uniqueTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    aria-pressed={selectedType === type}
                    className={`px-4 py-2 md:px-6 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all border ${
                      selectedType === type
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 border-blue-600 scale-105'
                        : 'bg-white dark:bg-transparent text-slate-600 dark:text-slate-300 border-slate-200 dark:border-transparent hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Results */}
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {filteredServices.map((service) => (
            <li key={service.id}>
              <FadeIn>
                <ServiceCard service={service} />
              </FadeIn>
            </li>
          ))}
        </ul>

        {filteredServices.length === 0 && (
          <div className="text-center py-20 text-slate-500 dark:text-slate-300">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              <LuSearch className="text-slate-300 dark:text-slate-500" />
            </div>
            <p className="text-xl font-medium">Nenhum serviço encontrado com os critérios selecionados.</p>
            <p className="mt-2 text-slate-400 dark:text-slate-500">Tente buscar por outros termos ou limpar os filtros.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const ServiceCard = ({ service }: { service: ServiceLocation }) => {
  return (
    <Link 
      to={`/servicos/${service.id}`}
      className="bg-white dark:bg-transparent rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 dark:border-transparent h-full flex flex-col hover:-translate-y-2 group relative block text-center"
      aria-label={`Ver detalhes de ${service.name}`}
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
      
      <div className="p-6 md:p-8 flex-1 flex flex-col">
        <div className="flex flex-col items-center mb-6">
          <div className="w-full">
            <div className="flex justify-center items-center gap-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg inline-block bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                {service.type}
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors mb-3">{service.name}</h3>
            <p className="text-slate-500 dark:text-slate-300 leading-relaxed text-sm">{service.description}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-8 flex-1">
          <div className="flex flex-col items-center justify-center text-slate-600 dark:text-slate-300 group/item">
            <LuMapPin className="mb-2 text-slate-400 dark:text-slate-500 group-hover/item:text-blue-500 transition-colors text-lg" />
            <div className="flex flex-col items-center">
              <span className="font-medium text-slate-900 dark:text-white block text-center px-4">
                {service.address}{service.number ? `, ${service.number}` : ''}{service.complement ? ` - ${service.complement}` : ''}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{service.neighborhood}, {service.city}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400 block">CEP: {service.zip}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center text-slate-600 dark:text-slate-300 group/item">
            <LuClock className="mr-2 text-slate-400 dark:text-slate-500 group-hover/item:text-blue-500 transition-colors flex-shrink-0" />
            <span className="font-medium text-sm">{service.hours}</span>
          </div>

          <div className="flex items-center justify-center text-slate-600 dark:text-slate-300 group/item">
            <LuPhone className="mr-2 text-slate-400 dark:text-slate-500 group-hover/item:text-blue-500 transition-colors flex-shrink-0" />
            <span className="font-medium text-sm">{service.phone}</span>
          </div>

          <div className="flex items-center justify-center text-slate-600 dark:text-slate-300 group/item min-w-0">
            <LuMail className="mr-2 text-slate-400 dark:text-slate-500 group-hover/item:text-blue-500 transition-colors flex-shrink-0" />
            <a href={`mailto:${service.email}`} className="text-blue-600 dark:text-blue-400 font-medium hover:underline truncate text-sm">
              {service.email}
            </a>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-transparent pt-6 mt-auto">
          <div className="flex items-center justify-center mb-4">
            <LuList className="mr-2 text-slate-400 dark:text-slate-500 text-sm" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">Serviços Oferecidos</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {service.services_offered.map((item, index) => (
              <span key={index} className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-100 dark:border-transparent hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default Servicos

