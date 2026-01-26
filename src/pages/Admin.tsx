import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { LuPencil, LuGift, LuLogOut, LuMail, LuMapPin, LuPhone, LuPlus, LuTrash2, LuBriefcase } from 'react-icons/lu'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Helmet } from 'react-helmet-async'
import FadeIn from '../components/FadeIn'
import { useAuth } from '../contexts/AuthContext'
import { useDonations } from '../contexts/DonationContext'
import type { ServiceLocation } from '../data/services'
import { getStoredServices, addStoredService, updateStoredService, deleteStoredService } from '../utils/storage'
import { supabase, isSupabaseEnabled } from '../lib/supabase'

const donationSchema = z.object({
  titulo: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  descricao: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres'),
  categoria: z.string().min(1, 'Informe a categoria'),
  quantidade: z.string().min(1, 'Informe a quantidade'),
  zip: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido'),
  address: z.string().min(3, 'Endereço obrigatório'),
  number: z.string().min(1, 'Número obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro obrigatório'),
  city: z.string().min(1, 'Cidade obrigatória'),
  hours: z.string().min(1, 'Horário obrigatório'),
  contatoEmail: z.string().email('Informe um e-mail válido'),
  contatoTelefone: z.string().min(10, 'Informe um telefone válido')
})

type DonationFormData = z.infer<typeof donationSchema>

const Admin = () => {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const { addDonation, donations, deleteDonation } = useDonations()
  const [activeTab, setActiveTab] = useState<'services' | 'donations'>('services')
  
  const [userServices, setUserServices] = useState<ServiceLocation[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [donationAddressSuggestions, setDonationAddressSuggestions] = useState<any[]>([])
  const [showDonationSuggestions, setShowDonationSuggestions] = useState(false)
  
  const [schedule, setSchedule] = useState({ start: '', end: '' })
  const [is24Hours, setIs24Hours] = useState(false)
  const [donationSchedule, setDonationSchedule] = useState({ start: '', end: '' })
  
  const formatPhone = (value: string) => {
    const d = value.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 2) return `(${d}`
    if (d.length <= 10) {
      if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
      return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
    }
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  }

  const formatZip = (value: string) => {
    const d = value.replace(/\D/g, '').slice(0, 8)
    if (d.length <= 5) return d
    return `${d.slice(0, 5)}-${d.slice(5)}`
  }
  
  const [serviceForm, setServiceForm] = useState({
    name: '',
    type: 'Outro' as ServiceLocation['type'],
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: 'São Paulo',
    zip: '',
    phone: '',
    email: '',
    hours: '',
    description: '',
    services_offered_text: ''
  })

  const { register, handleSubmit: handleDonationSubmit, formState: { errors: donationErrors }, reset: resetDonation, setValue, watch } = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema)
  })

  const donationAddress = watch('address')
  const donationCity = watch('city')

  const handleDonationPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = formatPhone(e.target.value)
    setValue('contatoTelefone', v)
  }

  const handleDonationZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = formatZip(e.target.value)
    setValue('zip', v)

    const cleanZip = v.replace(/\D/g, '')
    if (cleanZip.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`)
        const data = await response.json()
        if (!data.erro) {
          setValue('address', data.logradouro)
          setValue('neighborhood', data.bairro)
          setValue('city', data.localidade)
          // Clear address suggestions to avoid confusion
          setDonationAddressSuggestions([])
          setShowDonationSuggestions(false)
        }
      } catch (error) {
        console.error('Erro ao buscar CEP', error)
        toast.error('Erro ao buscar endereço. Verifique o CEP.')
      }
    }
  }

  const ignoreDonationAddressSearch = useRef(false)

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (ignoreDonationAddressSearch.current) {
        ignoreDonationAddressSearch.current = false
        return
      }

      if (donationAddress && donationAddress.length > 3) {
        try {
          const city = donationCity || 'São Paulo'
          const uf = 'SP'
          const cleanAddress = donationAddress.trim()
          
          if (cleanAddress) {
             const response = await fetch(`https://viacep.com.br/ws/${uf}/${city}/${cleanAddress}/json/`)
             const data = await response.json()
             if (Array.isArray(data)) {
               setDonationAddressSuggestions(data)
               setShowDonationSuggestions(true)
             } else {
               setDonationAddressSuggestions([])
               setShowDonationSuggestions(false)
             }
          }
        } catch (error) {
          console.error('Erro ao buscar endereço', error)
        }
      } else {
        setDonationAddressSuggestions([])
        setShowDonationSuggestions(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [donationAddress, donationCity])

  const handleSelectDonationAddress = (suggestion: any) => {
    ignoreDonationAddressSearch.current = true
    setValue('address', suggestion.logradouro)
    setValue('neighborhood', suggestion.bairro)
    setValue('city', suggestion.localidade)
    setValue('zip', suggestion.cep)
    setDonationAddressSuggestions([])
    setShowDonationSuggestions(false)
  }

  const handleDonationScheduleChange = (type: 'start' | 'end', value: string) => {
    setDonationSchedule(prev => {
      const newSchedule = { ...prev, [type]: value }
      if (newSchedule.start && newSchedule.end) {
        setValue('hours', `${newSchedule.start} às ${newSchedule.end}`)
      }
      return newSchedule
    })
  }

  const handleDeleteDonation = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta doação?')) {
      try {
        await deleteDonation(id)
        toast.success('Doação excluída com sucesso!')
      } catch (error: any) {
        console.error('Erro ao excluir doação:', error)
        toast.error(`Erro ao excluir: ${error.message || 'Tente novamente'}`)
      }
    }
  }

  const onDonationSubmit = async (data: DonationFormData) => {
    try {
      await addDonation(data)
      toast.success('Doação cadastrada com sucesso!', {
        icon: '🎁'
      })
      resetDonation()
      setDonationSchedule({ start: '', end: '' })
    } catch (error) {
      toast.error('Erro ao cadastrar doação. Tente novamente.')
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    if (isSupabaseEnabled() && supabase) {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching services from Supabase:', error)
          toast.error('Erro ao carregar serviços')
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

  if (!isAuthenticated) {
    return null
  }

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setServiceForm(prev => ({ ...prev, [name]: value }))
  }

  const saveService = async (service: ServiceLocation) => {
    if (isSupabaseEnabled() && supabase) {
      try {
        const { id, ...serviceData } = service // Let Supabase generate ID
        const { error } = await supabase
          .from('services')
          .insert([serviceData])

        if (error) {
          console.error('Error saving service to Supabase:', error)
          toast.error('Erro ao salvar serviço')
        } else {
          toast.success('Serviço salvo com sucesso!')
          loadServices()
        }
      } catch (err) {
        console.error('Unexpected error saving service:', err)
        toast.error('Erro inesperado ao salvar serviço')
      }
    } else {
      const updated = addStoredService(service)
      setUserServices(updated)
      toast.success('Serviço salvo localmente (modo offline)')
    }
  }

  const updateService = async (service: ServiceLocation) => {
    if (isSupabaseEnabled() && supabase) {
      try {
        const { id, ...serviceData } = service
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', id)

        if (error) {
          console.error('Error updating service in Supabase:', error)
          toast.error('Erro ao atualizar serviço')
        } else {
          toast.success('Serviço atualizado com sucesso!')
          loadServices()
        }
      } catch (err) {
        console.error('Unexpected error updating service:', err)
        toast.error('Erro inesperado ao atualizar serviço')
      }
    } else {
      const updated = updateStoredService(service)
      setUserServices(updated)
      toast.success('Serviço atualizado localmente')
    }
  }

  const deleteService = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      if (isSupabaseEnabled() && supabase) {
        try {
          const { error, count } = await supabase
            .from('services')
            .delete({ count: 'exact' })
            .eq('id', id)

          if (error) {
            console.error('Error deleting service from Supabase:', error)
            toast.error(`Erro ao excluir: ${error.message}`)
          } else if (count === 0) {
            console.warn('Delete count is 0')
            toast.error('Não foi possível excluir (permissão negada ou item não encontrado)')
          } else {
            toast.success('Serviço excluído com sucesso!')
            loadServices()
          }
        } catch (err) {
          console.error('Unexpected error deleting service:', err)
          toast.error('Erro inesperado ao excluir serviço')
        }
      } else {
        const updated = deleteStoredService(id)
        setUserServices(updated)
        toast.success('Serviço excluído localmente')
      }
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = formatPhone(e.target.value)
    setServiceForm(prev => ({ ...prev, phone: v }))
  }

  const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = formatZip(e.target.value)
    setServiceForm(prev => ({ ...prev, zip: v }))

    const cleanZip = v.replace(/\D/g, '')
    if (cleanZip.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`)
        const data = await response.json()
        if (!data.erro) {
          setServiceForm(prev => ({
            ...prev,
            address: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade
          }))
        }
      } catch (error) {
        console.error('Erro ao buscar CEP', error)
      }
    }
  }

  const ignoreAddressSearch = useRef(false)

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (ignoreAddressSearch.current) {
        ignoreAddressSearch.current = false
        return
      }

      if (serviceForm.address.length > 3) {
        try {
          const city = serviceForm.city || 'São Paulo'
          const uf = 'SP'
          const cleanAddress = serviceForm.address.trim()
          
          if (cleanAddress) {
             const response = await fetch(`https://viacep.com.br/ws/${uf}/${city}/${cleanAddress}/json/`)
             const data = await response.json()
             if (Array.isArray(data)) {
               setAddressSuggestions(data)
               setShowSuggestions(true)
             } else {
               setAddressSuggestions([])
               setShowSuggestions(false)
             }
          }
        } catch (error) {
          console.error('Erro ao buscar endereço', error)
        }
      } else {
        setAddressSuggestions([])
        setShowSuggestions(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [serviceForm.address, serviceForm.city])

  const handleSelectAddress = (suggestion: any) => {
    ignoreAddressSearch.current = true
    setServiceForm(prev => ({
      ...prev,
      address: suggestion.logradouro,
      neighborhood: suggestion.bairro,
      city: suggestion.localidade,
      zip: suggestion.cep
    }))
    setShowSuggestions(false)
  }

  const handleScheduleChange = (type: 'start' | 'end', value: string) => {
    setIs24Hours(false)
    setSchedule(prev => {
      const newSchedule = { ...prev, [type]: value }
      if (newSchedule.start && newSchedule.end) {
        setServiceForm(form => ({
          ...form,
          hours: `${newSchedule.start} às ${newSchedule.end}`
        }))
      }
      return newSchedule
    })
  }

  const handle24HoursToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setIs24Hours(checked)
    if (checked) {
      setSchedule({ start: '', end: '' })
      setServiceForm(prev => ({ ...prev, hours: '24 horas' }))
    } else {
      setServiceForm(prev => ({ ...prev, hours: '' }))
    }
  }

  const handleEditClick = (s: ServiceLocation) => {
    setEditingId(s.id)
    
    if (s.hours === '24 horas' || s.hours.toLowerCase().includes('24h')) {
      setIs24Hours(true)
      setSchedule({ start: '', end: '' })
    } else {
      setIs24Hours(false)
      const timeRegex = /^(\d{2}:\d{2})\s*às\s*(\d{2}:\d{2})$/
      const match = s.hours.match(timeRegex)
      if (match) {
        setSchedule({ start: match[1], end: match[2] })
      } else {
        setSchedule({ start: '', end: '' })
      }
    }

    setServiceForm({
      name: s.name,
      type: s.type,
      address: s.address,
      number: s.number || '',
      complement: s.complement || '',
      neighborhood: s.neighborhood,
      city: s.city,
      zip: s.zip,
      phone: s.phone,
      email: s.email,
      hours: s.hours,
      description: s.description,
      services_offered_text: s.services_offered.join(', ')
    })
  }

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const phoneOk = /^\(\d{2}\) \d{4,5}-\d{4}$/.test(serviceForm.phone)
    const zipOk = serviceForm.zip === '' || /^\d{5}-\d{3}$/.test(serviceForm.zip)
    if (!phoneOk) {
      setError('Telefone deve ser no formato (xx) xxxxx-xxxx ou (xx) xxxx-xxxx')
      return
    }
    if (!zipOk) {
      setError('CEP deve ser no formato xxxxx-xxx')
      return
    }
    if (!is24Hours && ((schedule.start && !schedule.end) || (!schedule.start && schedule.end))) {
      setError('Por favor, informe tanto o horário de abertura quanto o de fechamento')
      return
    }
    const services_offered = serviceForm.services_offered_text
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    const base: ServiceLocation = {
      id: editingId || String(Date.now()),
      name: serviceForm.name,
      type: serviceForm.type,
      address: serviceForm.address,
      number: serviceForm.number,
      complement: serviceForm.complement,
      neighborhood: serviceForm.neighborhood,
      city: serviceForm.city,
      zip: serviceForm.zip,
      phone: serviceForm.phone,
      email: serviceForm.email,
      hours: serviceForm.hours,
      description: serviceForm.description,
      services_offered
    }

    if (editingId) {
      updateService(base)
      setEditingId(null)
    } else {
      saveService(base)
    }

    setServiceForm({
      name: '',
      type: 'Outro',
      address: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: 'São Paulo',
      zip: '',
      phone: '',
      email: '',
      hours: '',
      description: '',
      services_offered_text: ''
    })
    setSchedule({ start: '', end: '' })
    setIs24Hours(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="pt-32 pb-20 bg-slate-50 dark:bg-slate-900 flex-grow w-full">
      <Helmet>
        <title>Área Administrativa - PopInfo</title>
        <meta name="description" content="Gerencie serviços e doações do PopInfo." />
      </Helmet>
      <div className="container mx-auto px-6 max-w-7xl">
        <FadeIn>
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Painel Administrativo</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">Gerencie serviços e doações da plataforma</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
                isSupabaseEnabled() && supabase 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isSupabaseEnabled() && supabase ? 'bg-green-500' : 'bg-amber-500'}`} />
                {isSupabaseEnabled() && supabase ? 'Online' : 'Offline'}
              </div>

              <button onClick={handleLogout} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-red-600 font-semibold transition-colors" title="Sair do sistema">
                <LuLogOut />
                Sair
              </button>
            </div>
          </div>

        </FadeIn>

          {/* Abas de Navegação */}

        <FadeIn>
          <div className="flex justify-center space-x-4 mb-6 border-b border-slate-200 dark:border-transparent">
            <button
              className={`pb-2 px-4 font-semibold transition-colors ${
                activeTab === 'services'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              onClick={() => setActiveTab('services')}
            >
              Serviços
            </button>
            <button
              className={`pb-2 px-4 font-semibold transition-colors ${
                activeTab === 'donations'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              onClick={() => setActiveTab('donations')}
            >
              Doações
            </button>
          </div>
        </FadeIn>

        {activeTab === 'services' ? (
          <FadeIn>
            <form onSubmit={handleServiceSubmit} className="bg-white dark:bg-transparent p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-transparent space-y-5 backdrop-blur-sm max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <LuBriefcase className="text-blue-600 dark:text-blue-400 text-xl" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cadastro de Serviço</h2>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Nome</label>
                  <input name="name" value={serviceForm.name} onChange={handleServiceChange} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" placeholder="Ex: CRAS Centro" required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tipo</label>
                  <select name="type" value={serviceForm.type} onChange={handleServiceChange} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" required>
                    <option value="CAPS">CAPS</option>
                    <option value="CRAS">CRAS</option>
                    <option value="CREAS">CREAS</option>
                    <option value="C.A / CTA">C.A / CTA / Hotel Social</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Alimentação">Alimentação</option>
                    <option value="Trabalho">Trabalho</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="relative">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Endereço</label>
                  <input name="address" value={serviceForm.address} onChange={handleServiceChange} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" required autoComplete="off" placeholder="Rua, Avenida..." />
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <ul className="absolute z-50 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl mt-1 shadow-lg max-h-60 overflow-y-auto">
                      {addressSuggestions.map((suggestion, index) => (
                        <li 
                          key={index}
                          onClick={() => handleSelectAddress(suggestion)}
                          className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-200 text-sm"
                        >
                          {suggestion.logradouro}, {suggestion.bairro} - {suggestion.localidade}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Número</label>
                  <input name="number" value={serviceForm.number} onChange={handleServiceChange} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" required placeholder="Nº" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Complemento</label>
                  <input name="complement" value={serviceForm.complement} onChange={handleServiceChange} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" placeholder="Apto, Bloco..." />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Bairro</label>
                  <input name="neighborhood" value={serviceForm.neighborhood} onChange={handleServiceChange} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" required placeholder="Bairro" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Cidade</label>
                  <input name="city" value={serviceForm.city} onChange={handleServiceChange} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" required placeholder="Cidade" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">CEP</label>
                  <input name="zip" value={serviceForm.zip} onChange={handleZipChange} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" placeholder="00000-000" required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Telefone</label>
                  <input name="phone" value={serviceForm.phone} onChange={handlePhoneChange} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" placeholder="(00) 00000-0000" required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">E-mail</label>
                  <input type="email" name="email" value={serviceForm.email} onChange={handleServiceChange} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" placeholder="seu@email.com" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Horário de Funcionamento</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={is24Hours}
                        onChange={handle24HoursToggle}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Atendimento 24 horas</span>
                    </label>
                  </div>
                  <div className={`flex flex-col gap-3 mt-1 ${is24Hours ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="w-fit">
                      <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Abertura</span>
                      <input 
                        type="time" 
                        value={schedule.start} 
                        onChange={(e) => handleScheduleChange('start', e.target.value)}
                        className="w-auto px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" 
                        required={!serviceForm.hours}
                      />
                    </div>
                    <div className="w-fit">
                      <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Fechamento</span>
                      <input 
                        type="time" 
                        value={schedule.end} 
                        onChange={(e) => handleScheduleChange('end', e.target.value)}
                        className="w-auto px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" 
                        required={!serviceForm.hours}
                      />
                    </div>
                  </div>
                  <input type="hidden" name="hours" value={serviceForm.hours} />
                  {!schedule.start && !schedule.end && serviceForm.hours && (
                     <p className="text-xs text-amber-600 mt-1">
                       Horário atual: {serviceForm.hours} (Atualize usando os relógios acima)
                     </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Descrição</label>
                  <textarea name="description" value={serviceForm.description} onChange={handleServiceChange} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" rows={4} required placeholder="Descreva os serviços prestados, público alvo..." />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Serviços Oferecidos (separe por vírgula)</label>
                  <input name="services_offered_text" value={serviceForm.services_offered_text} onChange={handleServiceChange} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" placeholder="Cadastro Único, Orientação Social, ..." />
                </div>
              </div>

              {error && <div className="text-red-600 text-sm font-medium">{error}</div>}

              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-600 hover:shadow-xl transition-all flex items-center justify-center gap-3">
                <LuPlus />
                {editingId ? 'Salvar Alterações' : 'Criar Serviço'}
              </button>
            </form>

            <div className="bg-white dark:bg-transparent mt-8 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-transparent space-y-4 backdrop-blur-sm">
              <div className="flex items-center justify-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Meus Serviços</h2>
              </div>
              <div className="space-y-3">
                {userServices.length === 0 && <div className="text-slate-500 dark:text-slate-300 text-sm">Nenhum serviço cadastrado.</div>}
                {userServices.map(s => (
                  <div key={s.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 rounded-xl border border-slate-200 dark:border-transparent">
                    <div className="min-w-0 w-full sm:w-auto">
                      <div className="font-semibold text-slate-900 dark:text-white text-lg sm:text-base">{s.name}</div>
                      <div className="text-sm sm:text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-0">{s.type} • {s.neighborhood} • {s.phone}</div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleEditClick(s)}
                        className="flex-1 sm:flex-none justify-center px-4 py-2.5 sm:py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-2 text-sm font-semibold transition-colors"
                      >
                        <LuPencil />
                        Editar
                      </button>
                      <button
                        onClick={() => deleteService(s.id)}
                        className="flex-1 sm:flex-none justify-center px-4 py-2.5 sm:py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 flex items-center gap-2 text-sm font-semibold transition-colors"
                      >
                        <LuTrash2 />
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        ) : (
          <FadeIn>
            <div className="bg-white dark:bg-transparent p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-transparent backdrop-blur-sm max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <LuGift className="text-blue-600 dark:text-blue-400 text-xl" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cadastrar Doação</h2>
              </div>
              <form onSubmit={handleDonationSubmit(onDonationSubmit)} className="space-y-5">
                <div className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="titulo" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Título</label>
                    <div className="relative">
                      <LuGift className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                      <input 
                        id="titulo"
                        {...register('titulo')}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${donationErrors.titulo ? 'border-red-500' : 'border-slate-200 dark:border-transparent'} bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200`} 
                        placeholder="Ex: Cadeira de Rodas"
                      />
                    </div>
                    {donationErrors.titulo && <p className="text-red-500 text-xs mt-1">{donationErrors.titulo.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="descricao" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Descrição</label>
                    <textarea 
                      id="descricao"
                      {...register('descricao')}
                      className={`w-full mt-1 px-3 py-3 rounded-xl border ${donationErrors.descricao ? 'border-red-500' : 'border-slate-200 dark:border-transparent'} bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200`} 
                      rows={4} 
                      placeholder="Detalhes do item, estado de conservação, condições de entrega..." 
                    />
                    {donationErrors.descricao && <p className="text-red-500 text-xs mt-1">{donationErrors.descricao.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="categoria" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Categoria</label>
                    <input 
                      id="categoria"
                      {...register('categoria')}
                      className={`w-full mt-1 px-3 py-3 rounded-xl border ${donationErrors.categoria ? 'border-red-500' : 'border-slate-200 dark:border-transparent'} bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200`} 
                      placeholder="Cadeira de rodas, muletas, fraldas..." 
                    />
                    {donationErrors.categoria && <p className="text-red-500 text-xs mt-1">{donationErrors.categoria.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="quantidade" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Quantidade</label>
                    <input 
                      id="quantidade"
                      {...register('quantidade')}
                      className={`w-full mt-1 px-3 py-3 rounded-xl border ${donationErrors.quantidade ? 'border-red-500' : 'border-slate-200 dark:border-transparent'} bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200`} 
                      placeholder="Ex.: 2 unidades" 
                    />
                    {donationErrors.quantidade && <p className="text-red-500 text-xs mt-1">{donationErrors.quantidade.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="zip" className="text-sm font-semibold text-slate-700 dark:text-slate-200">CEP</label>
                    <input 
                      id="zip"
                      {...register('zip', {
                        onChange: (e) => handleDonationZipChange(e)
                      })}
                      className={`w-full mt-1 px-3 py-2 rounded-xl border ${donationErrors.zip ? 'border-red-500' : 'border-slate-200 dark:border-transparent'} bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200`} 
                      placeholder="00000-000"
                    />
                    {donationErrors.zip && <p className="text-red-500 text-xs mt-1">{donationErrors.zip.message}</p>}
                  </div>

                  <div className="relative">
                    <label htmlFor="address" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Endereço</label>
                    <div className="relative">
                      <LuMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                      <input 
                        id="address"
                        {...register('address')}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${donationErrors.address ? 'border-red-500' : 'border-slate-200 dark:border-transparent'} bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200`} 
                        placeholder="Rua, Avenida..."
                        autoComplete="off"
                      />
                    </div>
                    {donationErrors.address && <p className="text-red-500 text-xs mt-1">{donationErrors.address.message}</p>}

                    {showDonationSuggestions && donationAddressSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto">
                        {donationAddressSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 last:border-0"
                            onClick={() => handleSelectDonationAddress(suggestion)}
                          >
                            <div className="font-medium">{suggestion.logradouro}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {suggestion.bairro} - {suggestion.localidade}/{suggestion.uf}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="number" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Número</label>
                    <input 
                      id="number"
                      {...register('number')}
                      className={`w-full mt-1 px-3 py-3 rounded-xl border ${donationErrors.number ? 'border-red-500' : 'border-slate-200 dark:border-transparent'} bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200`} 
                      placeholder="Nº"
                    />
                    {donationErrors.number && <p className="text-red-500 text-xs mt-1">{donationErrors.number.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="complement" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Complemento</label>
                    <input 
                      id="complement"
                      {...register('complement')}
                      className={`w-full mt-1 px-3 py-3 rounded-xl border ${donationErrors.complement ? 'border-red-500' : 'border-slate-200 dark:border-transparent'} bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200`} 
                      placeholder="Apto, Bloco..."
                    />
                  </div>

                  <div>
                    <label htmlFor="neighborhood" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Bairro</label>
                    <input 
                      id="neighborhood"
                      {...register('neighborhood')}
                      className={`w-full mt-1 px-3 py-3 rounded-xl border ${donationErrors.neighborhood ? 'border-red-500' : 'border-slate-200 dark:border-transparent'} bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200`} 
                      placeholder="Bairro"
                    />
                    {donationErrors.neighborhood && <p className="text-red-500 text-xs mt-1">{donationErrors.neighborhood.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="city" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Cidade</label>
                    <input 
                      id="city"
                      {...register('city')}
                      className={`w-full mt-1 px-3 py-3 rounded-xl border ${donationErrors.city ? 'border-red-500' : 'border-slate-200 dark:border-transparent'} bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200`} 
                      placeholder="Cidade"
                    />
                    {donationErrors.city && <p className="text-red-500 text-xs mt-1">{donationErrors.city.message}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Horário de Funcionamento</label>
                    <div className="flex flex-col gap-2 mt-1">
                      <div className="w-fit">
                        <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Abertura</span>
                        <input 
                          type="time" 
                          value={donationSchedule.start} 
                          onChange={(e) => handleDonationScheduleChange('start', e.target.value)}
                          className="w-auto px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" 
                        />
                      </div>
                      <div className="w-fit">
                        <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Fechamento</span>
                        <input 
                          type="time" 
                          value={donationSchedule.end} 
                          onChange={(e) => handleDonationScheduleChange('end', e.target.value)}
                          className="w-auto px-3 py-2 rounded-xl border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200" 
                        />
                      </div>
                    </div>
                    <input type="hidden" {...register('hours')} />
                    {donationErrors.hours && <p className="text-red-500 text-xs mt-1">{donationErrors.hours.message}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="contatoEmail" className="text-sm font-semibold text-slate-700 dark:text-slate-200">E-mail de Contato</label>
                    <div className="relative">
                      <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                      <input 
                        id="contatoEmail"
                        type="email" 
                        {...register('contatoEmail')}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${donationErrors.contatoEmail ? 'border-red-500' : 'border-slate-200 dark:border-transparent'} bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200`} 
                        placeholder="seu@email.com"
                      />
                    </div>
                    {donationErrors.contatoEmail && <p className="text-red-500 text-xs mt-1">{donationErrors.contatoEmail.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="contatoTelefone" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Telefone de Contato</label>
                    <div className="relative">
                      <LuPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                      <input 
                        id="contatoTelefone"
                        {...register('contatoTelefone', {
                          onChange: (e) => handleDonationPhoneChange(e)
                        })}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${donationErrors.contatoTelefone ? 'border-red-500' : 'border-slate-200 dark:border-transparent'} bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-200`} 
                        placeholder="(00) 00000-0000" 
                      />
                    </div>
                    {donationErrors.contatoTelefone && <p className="text-red-500 text-xs mt-1">{donationErrors.contatoTelefone.message}</p>}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-600 hover:shadow-xl transition-all flex items-center justify-center gap-3"
                >
                  <LuPlus />
                  Cadastrar Doação
                </button>
              </form>
            </div>

            <div className="bg-white dark:bg-transparent mt-8 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-transparent space-y-4 backdrop-blur-sm">
              <div className="flex items-center justify-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Minhas Doações</h2>
              </div>
              <div className="space-y-3">
                {donations.length === 0 && <div className="text-slate-500 dark:text-slate-300 text-sm">Nenhuma doação cadastrada.</div>}
                {donations.map(d => (
                  <div key={d.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 rounded-xl border border-slate-200 dark:border-transparent">
                    <div className="min-w-0 w-full sm:w-auto">
                      <div className="font-semibold text-slate-900 dark:text-white text-lg sm:text-base">{d.titulo}</div>
                      <div className="text-sm sm:text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-0">{d.categoria} • {d.city}</div>
                    </div>
                    <button
                      onClick={() => d.id && handleDeleteDonation(d.id)}
                      className="w-full sm:w-auto justify-center px-4 py-2.5 sm:py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 flex items-center gap-2 text-sm font-semibold transition-colors"
                    >
                      <LuTrash2 />
                      Excluir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  )
}

export default Admin
