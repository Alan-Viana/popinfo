import { Helmet } from 'react-helmet-async'
import { LuHeartHandshake, LuMapPin, LuTarget } from 'react-icons/lu'
import FadeIn from '../components/FadeIn'

const Sobre = () => {
  return (
    <div className="pt-32 pb-20 bg-slate-50 dark:bg-slate-900 flex-grow w-full">
      <Helmet>
        <title>Sobre o Projeto - PopInfo</title>
        <meta name="description" content="Saiba mais sobre o PopInfo, a missão de conectar pessoas a serviços essenciais e os valores de transparência e inclusão." />
      </Helmet>
      <div className="text-center max-w-4xl mx-auto px-6 mb-20">
        <FadeIn>
          <h1 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">Sobre o PopInfo</h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Uma plataforma dedicada a conectar pessoas aos serviços essenciais de São Paulo
          </p>
        </FadeIn>
      </div>

      <div className="container mx-auto px-6 max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-12">
        <FadeIn>
          <div className="bg-white dark:bg-transparent p-10 rounded-3xl shadow-lg border border-slate-100 dark:border-transparent h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center relative overflow-hidden group backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-3xl text-blue-600 dark:text-blue-400 mb-8 mx-auto">
              <LuHeartHandshake />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Missão</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-loose text-lg">
              Facilitar o acesso da população de São Paulo aos serviços públicos essenciais, 
              promovendo a inclusão social e ampliando o alcance das informações para pessoas em situação de vulnerabilidade.
            </p>
          </div>
        </FadeIn>



        <FadeIn>
          <div className="bg-white dark:bg-transparent p-10 rounded-3xl shadow-lg border border-slate-100 dark:border-transparent h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center relative overflow-hidden group backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-3xl text-blue-600 dark:text-blue-400 mb-8 mx-auto">
              <LuMapPin />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Abrangência</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-loose text-lg">
              Cobrimos todos os distritos da cidade de São Paulo, oferecendo informações 
              atualizadas sobre serviços disponíveis em cada região. Seja no centro da 
              cidade ou nas periferias, o objetivo é garantir que ninguém fique sem 
              acesso às informações necessárias.
            </p>
          </div>
        </FadeIn>

        <FadeIn className="md:col-span-2">
          <div className="bg-white dark:bg-transparent p-10 rounded-3xl shadow-lg border border-slate-100 dark:border-transparent h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center relative overflow-hidden group backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-3xl text-blue-600 dark:text-blue-400 mb-8 mx-auto">
              <LuTarget />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Valores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {[
                'Transparência e confiabilidade nas informações',
                'Compromisso com a inclusão social',
                'Facilidade de acesso e uso',
                'Atualização constante dos dados'
              ].map((value, index) => (
                <div key={index} className="flex items-center justify-center text-center gap-4 text-slate-700 dark:text-slate-200 font-medium bg-slate-50 dark:bg-white/5 p-4 rounded-xl">
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}

export default Sobre
