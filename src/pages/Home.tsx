import { Helmet } from 'react-helmet-async'
import Hero from '../components/Hero'
import Categories from '../components/Categories'

const Home = () => {
  return (
    <>
      <Helmet>
        <title>PopInfo - Informação e Serviços ao seu Alcance</title>
        <meta name="description" content="Encontre serviços essenciais, faça doações e acesse informações úteis para o seu dia a dia. Conectando pessoas e serviços." />
      </Helmet>
      <Hero />
      <Categories />
    </>
  )
}

export default Home



