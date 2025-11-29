import { useNavigate } from 'react-router-dom'

function AboutUs() {
  const navigate = useNavigate()

  const roles = [
    {
      title: 'Samuel e Pedro — Back-end (Rust):',
      description:
        'Responsáveis por toda a arquitetura e lógica do sistema. Eles construíram a base sólida da FireBudget usando Rust, garantindo alta performance, segurança e estabilidade. Toda a comunicação com o banco de dados, APIs, processamento e regras de negócio passam pelas mãos deles.',
    },
    {
      title: 'Erik — Front-end:',
      description:
        'Transformou cada funcionalidade em uma interface rápida e responsiva. Ele deu vida ao que o usuário vê e utiliza todos os dias, garantindo fluidez, transições bem feitas e uma navegação simples, moderna e intuitiva.',
    },
    {
      title: 'Matheus Vieira — Design (Figma):',
      description:
        'Responsável pela identidade visual, protótipos, estilo e experiência do usuário. Cada tela, cor, ícone e fluxo foi pensado no Figma para criar uma plataforma bonita, coerente e fácil de usar. O design é a alma visual da FireBudget — e nasce aqui.',
    },
  ]

  const team = [
    {
      name: 'Erik',
      role: 'Front-end',
      description:
        'Transformou cada funcionalidade em uma interface rápida e responsiva. Ele deu vida ao que o usuário vê e utiliza todos os dias, garantindo fluidez, transições bem feitas e uma navegação simples, moderna e intuitiva.',
      image: '/images/team/erik.jpg',
      linkedin: 'https://www.linkedin.com/in/erik-wpn/',
    },
    {
      name: 'Matheus Vieira',
      role: 'Design (Figma)',
      description:
        'Responsável pela identidade visual, protótipos, estilo e experiência do usuário. Cada tela, cor, ícone e fluxo foi pensado no Figma para criar uma plataforma bonita, coerente e fácil de usar. O design é a alma visual da FireBudget — e nasce aqui.',
      image: '/images/team/matheus.jpg',
      linkedin: 'https://www.linkedin.com/in/matheus-vieira-0b96182ab/',
    },
    {
      name: 'Pedro',
      role: 'Back-end (Rust)',
      description:
        'Responsável, junto com Samuel, por toda a arquitetura e lógica do sistema. Construiu a base sólida da FireBudget usando Rust, garantindo alta performance, segurança e estabilidade.',
      image: '/images/team/pedro.jpg',
      linkedin: 'https://www.linkedin.com/in/britto-pedro/',
    },
    {
      name: 'Samuel',
      role: 'Back-end (Rust)',
      description:
        'Responsável, junto com Pedro, por toda a arquitetura e lógica do sistema. Toda a comunicação com o banco de dados, APIs, processamento e regras de negócio passam pelas mãos deles.',
      image: '/images/team/samuel.jpg',
      linkedin: 'https://www.linkedin.com/in/samuelneres/',
    },
  ]

  return (
    <div className="min-h-screen bg-[#140A23] flex relative text-white">
      {/* Sidebar */}
      <div className="w-20 bg-[#7802D6] fixed left-0 top-0 h-screen flex flex-col items-center py-6 rounded-r-2xl animate-slide-in-left z-10">
        {/* Logo */}
        <div className="w-12 h-12 rounded-lg overflow-hidden mb-8 bg-[#7802D6]">
          <img
            src="/images/logo/logofirebudget.png"
            alt="FireBudget"
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Menu Icons */}
        <div className="flex flex-col gap-6 flex-1">
          <button 
            onClick={() => navigate('/home')}
            className="text-white hover:opacity-80 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          
          <button 
            onClick={() => navigate('/calendar')}
            className="text-white hover:opacity-80 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          
          <button 
            onClick={() => navigate('/transactions')}
            className="text-white hover:opacity-80 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
          
          <button className="text-white hover:text-purple-300 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
          
          <button 
            onClick={() => navigate('/about')}
            className="text-[#00FFB2] transition-smooth"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V4H2v16h5m10 0V10a3 3 0 00-3-3H10a3 3 0 00-3 3v10m10 0H7" />
            </svg>
          </button>
          
          <button 
            onClick={() => navigate('/rewards')}
            className="text-white hover:opacity-80 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </button>
        </div>
        
        {/* Settings Icon */}
        <button 
          onClick={() => navigate('/settings')}
          className="text-white hover:text-purple-300 transition mb-0"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col ml-20">
        <header className="px-6 md:px-10 pt-10 pb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#00FFB2] mb-4">
            Sobre nós
          </h1>
          <p className="max-w-3xl mx-auto text-gray-200 leading-relaxed text-sm md:text-base">
            A <span className="font-semibold text-[#00FFB2]">FireBudget</span>{' '}
            nasceu com a missão de transformar a maneira como as pessoas
            organizam, visualizam e entendem suas finanças. Criamos uma
            plataforma moderna, intuitiva e extremamente rápida, construída com
            tecnologias robustas e pensada para entregar clareza financeira de
            forma simples e inteligente.
          </p>
          <p className="max-w-3xl mx-auto text-gray-200 leading-relaxed text-sm md:text-base mt-3">
            Nosso objetivo é permitir que qualquer pessoa acompanhe seus
            gastos, metas e ganhos de um jeito visual, dinâmico e acessível.
            Seja por meio de gráficos detalhados, calendário financeiro,
            cartões individuais ou ferramentas de análise. Tudo isso dentro de
            uma experiência fluida, segura e eficiente.
          </p>
        </header>

        <main className="flex-1 px-6 md:px-10 pb-16 space-y-12 overflow-y-auto">
          {/* Quem somos */}
          <section className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-[#00FFB2] mb-3 text-center">
              Quem somos?
            </h2>
            <p className="max-w-3xl mx-auto text-gray-200 text-sm md:text-base leading-relaxed mb-6 text-center">
              Por trás da FireBudget existe um time pequeno, mas muito
              dedicado, unindo conhecimento técnico, criatividade e foco em
              experiência do usuário.
            </p>

            <div className="mt-6 space-y-4 text-sm md:text-base text-gray-200">
              {roles.map((role) => (
                <div key={role.title} className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[#00FFB2]" />
                  <div>
                    <p className="font-semibold text-[#00FFB2]">{role.title}</p>
                    <p className="mt-1 leading-relaxed text-gray-200">
                      {role.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Conecte-se */}
          <section className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-[#00FFB2] mb-4 text-center">
              Conecte-se conosco
            </h2>
            <p className="text-gray-200 text-sm md:text-base mb-6 max-w-2xl mx-auto text-center">
              A FireBudget não é apenas uma ferramenta, é um projeto criado com
              cuidado, tecnologia de ponta e muita dedicação. Trabalhamos para
              que controlar dinheiro deixe de ser complicado e se torne algo
              claro, direto e até prazeroso.
            </p>
            <p className="text-[#00FFB2] font-semibold mb-8 text-center">
              Bem-vindo ao jeito moderno de cuidar das suas finanças. Bem-vindo
              ao FireBudget.
            </p>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
              {team.map((member) => (
                <div
                  key={member.name + '-card'}
                  className="bg-[#1F102F] border border-[#2B1742] rounded-2xl p-4 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#00FFB2] mb-3 bg-[#140A23]">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-[#00FFB2] text-xs mt-1">{member.role}</p>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 text-[11px] text-[#00FFB2] underline hover:opacity-80"
                  >
                    LinkedIn de {member.name}
                  </a>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default AboutUs


