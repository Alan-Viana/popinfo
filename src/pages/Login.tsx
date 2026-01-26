import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LuLock, LuLogIn, LuMail } from 'react-icons/lu'
import FadeIn from '../components/FadeIn'
import { useAuth } from '../contexts/AuthContext'

const loginSchema = z.object({
  email: z.string().trim().email('Digite um e-mail válido'),
  password: z.string().trim().min(6, 'A senha deve ter pelo menos 6 caracteres')
})

type LoginFormData = z.infer<typeof loginSchema>

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    setError(null)
    // Trim whitespace to avoid copy-paste errors
    const result = await login(data.email.trim(), data.password.trim())

    if (result.success) {
      navigate('/admin')
    } else {
      setError(result.error || 'E-mail ou senha inválidos')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-24 pb-20 bg-slate-50 dark:bg-slate-900 flex-grow w-full">
      <Helmet>
        <title>Login - PopInfo</title>
        <meta name="description" content="Acesso restrito para administradores do PopInfo." />
      </Helmet>
      <div className="container mx-auto px-6 max-w-md w-full">
        <FadeIn>
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Área Restrita</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">Acesse com seu e-mail e senha</p>
          </div>
        </FadeIn>

        <FadeIn>
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-transparent p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-transparent space-y-4 backdrop-blur-sm">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-200">E-mail</label>
              <div className="relative">
                <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-transparent'} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-200 text-base md:text-lg`}
                  placeholder="seu@email.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && <p id="email-error" role="alert" className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Senha</label>
              <div className="relative">
                <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-transparent'} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-200 text-base md:text-lg`}
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
              </div>
              {errors.password && <p id="password-error" role="alert" className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>

            {error && <div role="alert" className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg text-center font-medium border border-red-100 dark:border-red-800">{error}</div>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 dark:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-600 dark:hover:bg-blue-500 hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <LuLogIn />
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </FadeIn>
      </div>
    </div>
  )
}

export default Login
