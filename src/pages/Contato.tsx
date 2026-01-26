import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LuMail, LuPhone, LuSend, LuUser, LuTag, LuMessageSquare, LuTriangle } from 'react-icons/lu'
import FadeIn from '../components/FadeIn'

const contactSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Digite um e-mail válido'),
  telefone: z.string().min(10, 'Digite um telefone válido').optional().or(z.literal('')),
  assunto: z.string().min(1, 'Por favor, selecione um assunto'),
  mensagem: z.string().min(10, 'A mensagem deve ter pelo menos 10 caracteres')
})

type ContactFormData = z.infer<typeof contactSchema>

const Contato = () => {
  const [searchParams] = useSearchParams()
  const enviado = searchParams.get('enviado') === '1'
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      assunto: '',
      mensagem: ''
    }
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (enviado) {
      toast.success('Mensagem enviada com sucesso! Em breve entraremos em contato.', {
        duration: 5000,
        icon: '✉️'
      })
    }
  }, [enviado])

  const onSubmit = async (data: ContactFormData) => {
    try {
      const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'alanviana0707@gmail.com'
      const response = await fetch(`https://formsubmit.co/ajax/${contactEmail}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          _subject: `Contato • ${data.assunto}`,
          _captcha: "false"
        })
      });

      if (response.ok) {
        toast.success('Mensagem enviada com sucesso! Em breve entraremos em contato.', {
          duration: 5000,
          icon: '✉️'
        })
        reset()
      } else {
        throw new Error('Erro no envio')
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao enviar sua mensagem. Tente novamente.')
    }
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 flex-grow w-full">
      <Helmet>
        <title>Contato - PopInfo</title>
        <meta name="description" content="Entre em contato com a equipe do PopInfo. Envie suas dúvidas, sugestões ou reclamações." />
      </Helmet>
      <div className="container mx-auto px-6">
        <div className="min-h-[calc(100vh-8rem)] pt-28 pb-24 flex items-center justify-center">
          <div className="w-full max-w-2xl">
          <FadeIn>
            <div className="bg-white dark:bg-transparent rounded-xl border border-slate-200 dark:border-transparent p-8 shadow-lg">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white text-center mb-12">Envie sua mensagem</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="nome" className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 block">Nome completo</label>
                    <div className="relative group">
                      <LuUser className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.nome ? 'text-red-500' : 'text-slate-400 dark:text-slate-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400'}`} />
                      <input 
                        {...register('nome')}
                        type="text" 
                        id="nome" 
                        autoComplete="name"
                        className={`w-full pl-12 pr-5 h-12 md:h-14 rounded-xl border-2 transition-all duration-300 ${
                          errors.nome 
                            ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                            : 'border-slate-200 dark:border-transparent focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-600/10'
                        } bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 outline-none text-base md:text-lg placeholder:text-slate-400 dark:placeholder:text-slate-600`} 
                        placeholder="Nome completo"
                        aria-invalid={!!errors.nome}
                        aria-describedby={errors.nome ? "nome-error" : undefined}
                      />
                    </div>
                    {errors.nome && (
                      <div id="nome-error" role="alert" className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400 text-sm font-medium animate-fadeIn">
                        <LuTriangle className="flex-shrink-0" />
                        <span>{errors.nome.message}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-sm font-bold text-slate-700 dark:text-slate-200">E-mail</label>
                    <div className="relative">
                      <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                      <input 
                        {...register('email')}
                        type="email" 
                        id="email" 
                        autoComplete="email"
                        className={`w-full pl-14 pr-5 h-12 md:h-14 rounded-lg border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : 'border-slate-200 dark:border-transparent focus:border-slate-900 focus:ring-slate-900/15'} bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200 outline-none focus:ring-2 text-base md:text-lg`} 
                        placeholder="seu@email.com"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                      />
                    </div>
                    {errors.email && <span id="email-error" role="alert" className="text-red-500 text-xs block">{errors.email.message}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="telefone" className="text-sm font-bold text-slate-700 dark:text-slate-200">Telefone</label>
                    <div className="relative">
                      <LuPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                      <input 
                        {...register('telefone')}
                        type="tel" 
                        id="telefone" 
                        autoComplete="tel"
                        className={`w-full pl-12 pr-5 h-12 md:h-14 rounded-lg border ${errors.telefone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : 'border-slate-200 dark:border-transparent focus:border-slate-900 focus:ring-slate-900/15'} bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200 outline-none focus:ring-2 text-base md:text-lg`} 
                        placeholder="(11) 0000-0000"
                        aria-invalid={!!errors.telefone}
                        aria-describedby={errors.telefone ? "telefone-error" : undefined}
                      />
                    </div>
                    {errors.telefone && <span id="telefone-error" role="alert" className="text-red-500 text-xs block">{errors.telefone.message}</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="assunto" className="text-sm font-bold text-slate-700 dark:text-slate-200">Assunto</label>
                    <div className="relative">
                      <LuTag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                      <select 
                        {...register('assunto')}
                        id="assunto" 
                        className={`w-full pl-14 pr-5 h-12 md:h-14 rounded-lg border ${errors.assunto ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : 'border-slate-200 dark:border-transparent focus:border-slate-900 focus:ring-slate-900/15'} bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200 outline-none focus:ring-2 text-base md:text-lg`}
                        aria-invalid={!!errors.assunto}
                        aria-describedby={errors.assunto ? "assunto-error" : undefined}
                      >
                        <option value="">Selecione um assunto</option>
                        <option value="duvida">Dúvidas sobre serviços</option>
                        <option value="sugestao">Sugestões</option>
                        <option value="reclamacao">Reclamações</option>
                        <option value="outros">Outros</option>
                      </select>
                    </div>
                    {errors.assunto && <span id="assunto-error" role="alert" className="text-red-500 text-xs block">{errors.assunto.message}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="mensagem" className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 block">Mensagem</label>
                  <div className="relative group">
                    <LuMessageSquare className={`absolute left-4 top-5 transition-colors duration-300 ${errors.mensagem ? 'text-red-500' : 'text-slate-400 dark:text-slate-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400'}`} />
                    <textarea 
                      {...register('mensagem')}
                      id="mensagem" 
                      rows={6} 
                      className={`w-full pl-12 pr-5 rounded-xl border-2 transition-all duration-300 py-4 ${
                        errors.mensagem 
                          ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                          : 'border-slate-200 dark:border-transparent focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-600/10'
                      } bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 outline-none text-base md:text-lg placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-y min-h-[150px]`}  
                      placeholder="Descreva detalhadamente sua dúvida, sugestão ou solicitação..."
                      aria-invalid={!!errors.mensagem}
                      aria-describedby={errors.mensagem ? "mensagem-error" : undefined}
                    ></textarea>
                  </div>
                  {errors.mensagem && (
                    <div id="mensagem-error" role="alert" className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400 text-sm font-medium animate-fadeIn">
                      <LuTriangle className="flex-shrink-0" />
                      <span>{errors.mensagem.message}</span>
                    </div>
                  )}
                </div>
                <div className="flex md:justify-center w-full">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 md:gap-3 px-4 md:px-12 h-12 md:h-14 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-base md:text-lg transition-all duration-300 shadow-lg hover:shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <LuSend className="text-lg shrink-0" />
                        <span>Enviar Mensagem</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </FadeIn>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contato
