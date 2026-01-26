import { useNavigate } from 'react-router-dom'
import { LuBrain, LuHouse, LuHeartPulse, LuUtensils, LuHeartHandshake, LuBriefcase } from 'react-icons/lu'
import { motion } from 'framer-motion'
import FadeIn from './FadeIn'

interface Category {
  icon: React.ReactNode
  title: string
  description: string
  filterType: string
}

const categories: Category[] = [
  {
    icon: <LuBrain />,
    title: 'CAPS',
    description: 'Centros de Atenção Psicossocial para saúde mental e dependência química',
    filterType: 'CAPS'
  },
  {
    icon: <LuHouse />,
    title: 'Acolhimento',
    description: 'Serviços de acolhimento e moradia temporária',
    filterType: 'C.A / CTA'
  },
  {
    icon: <LuHeartPulse />,
    title: 'Saúde',
    description: 'Atendimento médico, consultas e serviços de saúde pública',
    filterType: 'Saúde'
  },
  {
    icon: <LuUtensils />,
    title: 'Alimentação',
    description: 'Restaurantes populares, cestas básicas e bancos de alimentos',
    filterType: 'Alimentação'
  },
  {
    icon: <LuHeartHandshake />,
    title: 'Rede Socioassistencial',
    description: 'CRAS, CREAS e outros serviços de proteção social básica',
    filterType: 'CRAS'
  },
  {
    icon: <LuBriefcase />,
    title: 'Emprego',
    description: 'Capacitação profissional e oportunidades de trabalho',
    filterType: 'Trabalho'
  },
]

const Categories = () => {
  const navigate = useNavigate()

  const handleCategoryClick = (type: string) => {
    navigate(`/servicos?type=${type}`)
  }

  return (
    <section className="pb-32 pt-28 bg-slate-50 dark:bg-slate-900 transition-colors duration-500 relative">
      <FadeIn>
        <div className="text-center max-w-3xl mx-auto mb-28 px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Como podemos ajudar</h2>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 container mx-auto px-8 max-w-7xl">
        {categories.map((category, index) => (
          <FadeIn key={index}>
            <motion.div
              onClick={() => handleCategoryClick(category.filterType)}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group bg-white dark:bg-transparent p-8 rounded-2xl shadow-lg hover:shadow-2xl cursor-pointer border border-slate-100 dark:border-transparent relative overflow-hidden backdrop-blur-sm text-center"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              <div className="flex justify-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  {category.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{category.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm font-medium">{category.description}</p>
            </motion.div>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}

export default Categories
