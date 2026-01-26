import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { LuArrowLeft, LuGift, LuMail, LuMapPin, LuPhone } from 'react-icons/lu'
import FadeIn from '../components/FadeIn'
import { useDonations, type Donation } from '../contexts/DonationContext'

const DoacaoDetalhes = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { donations } = useDonations()
  const [donation, setDonation] = useState<Donation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (donations.length >= 0) {
      const found = donations.find(d => String(d.id) === id || (d as any).tempId === id)
      
      if (found) {
        setDonation(found)
      } 
      setLoading(false)
    }
  }, [id, donations])

  if (loading) {
    return (
      <div className="flex-grow w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!donation) {
    return (
      <div className="flex-grow w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-center px-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Doação não encontrada</h2>
        <button 
          onClick={() => navigate('/doacoes')}
          className="text-blue-600 hover:underline font-medium"
        >
          Voltar para lista de doações
        </button>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-40 bg-slate-50 dark:bg-slate-900 flex-grow w-full">
      <Helmet>
        <title>{donation.titulo} - PopInfo</title>
        <meta name="description" content={`Detalhes sobre doação: ${donation.titulo}`} />
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">{donation.titulo}</h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto mb-6">
              {donation.descricao}
            </p>
            <div className="flex justify-center items-center gap-3">
              <span className="text-sm font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                Doação
              </span>
              {donation.categoria && (
                <span className="text-sm font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg inline-block bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {donation.categoria}
                </span>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
            
            {/* Details Card */}
            <div className="bg-white dark:bg-transparent rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-transparent hover:shadow-md transition-shadow h-full flex flex-col items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <LuGift className="text-xl" />
                </div>
                Detalhes do Item
              </h3>
              
              <div className="space-y-4 w-full flex-grow flex flex-col justify-center">
                <div className="bg-slate-50 dark:bg-transparent p-6 rounded-2xl border border-slate-100 dark:border-transparent flex flex-col gap-6 items-center text-center">
                  <span className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Quantidade Disponível</span>
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {!isNaN(parseInt(donation.quantidade)) ? parseInt(donation.quantidade) : donation.quantidade}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-transparent p-6 rounded-2xl border border-slate-100 dark:border-transparent flex flex-col gap-2 items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white shadow-sm shrink-0 mb-1">
                    <LuMapPin className="text-sm text-blue-500" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Local de Retirada</span>
                  <p className="text-xl font-bold text-slate-900 dark:text-white leading-relaxed">{donation.local}</p>
                </div>
              </div>
            </div>

            {/* Interest Card (Contacts) */}
            <div className="bg-white dark:bg-transparent rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-transparent hover:shadow-md transition-shadow flex flex-col justify-center relative overflow-hidden h-full items-center">
                {/* Decorative Icon */}
                <div className="absolute -top-6 -right-6 opacity-5 pointer-events-none">
                <LuGift className="text-9xl text-blue-600" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex flex-col items-center gap-3 text-center relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <LuMail className="text-xl" />
                </div>
                Contatos
              </h3>

              <div className="space-y-4 w-full relative z-10 flex-grow flex flex-col justify-center">
                {donation.contatoTelefone && (
                  <div className="flex flex-col items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-transparent border border-slate-100 dark:border-transparent text-center">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white shadow-sm shrink-0">
                      <LuPhone className="text-lg text-blue-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-0.5">WhatsApp / Telefone</p>
                      <p className="text-lg text-slate-900 dark:text-white font-bold">{donation.contatoTelefone}</p>
                    </div>
                  </div>
                )}

                {donation.contatoEmail && (
                  <a 
                    href={`mailto:${donation.contatoEmail}?subject=Interesse na doação: ${donation.titulo}`}
                    className="flex flex-col items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-transparent border border-slate-100 dark:border-transparent hover:bg-blue-50 dark:hover:bg-white/5 hover:border-blue-200 dark:hover:border-white/10 transition-all group text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white shadow-sm group-hover:scale-110 transition-transform shrink-0">
                      <LuMail className="text-sm text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1 w-full">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-0.5">Enviar E-mail</p>
                      <p className="text-lg text-slate-900 dark:text-white font-bold whitespace-nowrap overflow-x-auto pb-1 scrollbar-thin">{donation.contatoEmail}</p>
                    </div>
                  </a>
                )}

                {!donation.contatoTelefone && !donation.contatoEmail && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl text-center border border-yellow-100 dark:border-yellow-900/20">
                    <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                      Informações de contato não disponíveis.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Security Tip - Bottom Center */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-3xl p-8 border border-blue-100 dark:border-transparent flex flex-col justify-center h-fit items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex flex-col items-center gap-3 text-center">
                <LuGift className="text-blue-600 dark:text-blue-400" />
                Dica de Segurança
              </h3>
              <p className="text-blue-800 dark:text-blue-200 font-medium leading-relaxed text-lg text-center">
                Combine a entrega em locais públicos e movimentados. Nunca faça pagamentos antecipados para frete ou reserva.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}

export default DoacaoDetalhes
