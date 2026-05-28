export interface Article {
  slug: string;
  tag: string;
  tagColor: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  content: string; // HTML
}

export const articles: Record<string, Article> = {
  'o-que-e-trust-score-digital': {
    slug: 'o-que-e-trust-score-digital',
    tag: 'Conceito', tagColor: '#38bdf8',
    title: 'O que é um Trust Score Digital e por que você precisa conhecer',
    excerpt: 'Em um mundo onde relações pessoais e comerciais migram para o digital, saber avaliar a confiabilidade de uma pessoa online virou habilidade essencial.',
    date: '15 Jan 2025', readTime: '5 min',
    content: `
      <p>Imagine que você está prestes a se encontrar com alguém que conheceu no Tinder. Você viu as fotos, conversou por semanas, ele parece incrível. Mas você sabe, de verdade, quem é essa pessoa?</p>
      <p>Essa é a pergunta que o conceito de <strong>Trust Score Digital</strong> busca responder.</p>

      <h2>O que é um Trust Score Digital?</h2>
      <p>Um Trust Score Digital é uma pontuação de 0 a 100 que representa o nível de confiabilidade de uma presença digital, baseada em sinais públicos verificáveis. Não é uma nota de caráter — é uma análise de consistência, autenticidade e histórico digital.</p>
      <p>O score é calculado cruzando múltiplas fontes:</p>
      <ul>
        <li><strong>Redes sociais:</strong> perfil real ou fake? Conta antiga ou recente? Seguidores autênticos?</li>
        <li><strong>Registros públicos:</strong> processos judiciais, protestos, inadimplências públicas</li>
        <li><strong>Consistência de dados:</strong> os dados fornecidos batem entre si?</li>
        <li><strong>Padrões comportamentais:</strong> sinais de bot, contas compradas, comportamento suspeito</li>
      </ul>

      <h2>Por que isso importa?</h2>
      <p>Vivemos em uma era de relacionamentos digitais. Negócios fechados por WhatsApp. Parcerias iniciadas no LinkedIn. Encontros marcados pelo Tinder. O problema: qualquer pessoa pode construir uma identidade digital convincente em questão de horas.</p>
      <blockquote>Em 2023, o Brasil registrou mais de R$ 2,1 bilhões em prejuízos com golpes digitais. A maioria começou com alguém que "parecia confiável".</blockquote>
      <p>O Trust Score não elimina o risco — mas te dá informação antes de tomar uma decisão. E informação é poder.</p>

      <h2>Como o Vetra calcula o score?</h2>
      <p>O Vetra usa um sistema de sinais ponderados em 4 dimensões:</p>
      <ul>
        <li><strong>Identidade (35%):</strong> email, telefone, CPF (formato), data de nascimento</li>
        <li><strong>Social (25%):</strong> verificação real do Instagram via API oficial</li>
        <li><strong>Comportamental (20%):</strong> padrões suspeitos, completude dos dados</li>
        <li><strong>Consistência (20%):</strong> cruzamento entre fontes, consulta jurídica</li>
      </ul>
      <p>O Gemini AI então interpreta todos os sinais e gera uma análise em linguagem humana — explicando exatamente por que o score é aquele número.</p>

      <h2>O que o score NÃO é</h2>
      <p>É importante ser claro: um Trust Score alto não garante que a pessoa é boa. E um score baixo não significa que ela é má. O score mede <em>consistência e presença digital</em>, não caráter.</p>
      <p>Use como uma ferramenta de due diligence — não como julgamento final.</p>

      <h2>Conclusão</h2>
      <p>Em um mundo onde a identidade digital pode ser facilmente fabricada, ter uma ferramenta que cruza dados públicos e gera um score de confiança em segundos é uma vantagem estratégica real. O Vetra existe exatamente para isso.</p>
    `,
  },

  'como-identificar-perfil-fake-instagram': {
    slug: 'como-identificar-perfil-fake-instagram',
    tag: 'Guia', tagColor: '#34d399',
    title: 'Como identificar um perfil fake no Instagram em menos de 2 minutos',
    excerpt: 'Aprenda os 8 sinais mais confiáveis para detectar contas falsas, bots e perfis comprados antes de qualquer encontro ou negócio.',
    date: '10 Jan 2025', readTime: '7 min',
    content: `
      <p>Perfis falsos no Instagram estão por toda parte. Alguns são bots automatizados. Outros são pessoas reais usando identidades roubadas. E alguns são cuidadosamente construídos para enganar.</p>
      <p>A boa notícia: existem sinais que quase sempre revelam uma conta falsa — se você souber onde olhar.</p>

      <h2>1. Ratio seguidores/seguindo distorcido</h2>
      <p>Uma conta com 5.000 seguindo e apenas 80 seguidores é um sinal claro de bot ou conta comprada. Perfis orgânicos e reais tendem a ter um ratio equilibrado ou favorável (mais seguidores do que seguindo).</p>
      <p><strong>Regra prática:</strong> se está seguindo mais de 2x do que tem seguidores, desconfie.</p>

      <h2>2. Fotos de perfil geradas por IA</h2>
      <p>Com ferramentas como Midjourney e DALL-E, qualquer pessoa pode gerar um rosto realista em segundos. Sinais de foto gerada por IA: fundo levemente distorcido, orelhas assimétricas, dentes perfeitos demais, cabelo com artefatos visuais nas bordas.</p>
      <p><strong>Teste rápido:</strong> salve a foto e jogue no Google Imagens. Se aparecer em múltiplos lugares diferentes, é foto roubada ou stock.</p>

      <h2>3. Biografia vazia ou genérica</h2>
      <p>Contas reais geralmente têm bios personalizadas. Contas falsas têm bios vazias, ou frases genéricas copiadas. Fique atento a bios que parecem traduzidas automaticamente ou que não fazem sentido contextual.</p>

      <h2>4. Posts muito espaçados ou em rajada</h2>
      <p>Bots frequentemente postam em rajadas — 20 posts em um dia, depois nada por meses. Perfis reais têm frequência mais constante e orgânica.</p>

      <h2>5. Comentários sem sentido ou emojis genéricos</h2>
      <p>Nos posts, analise os comentários. Se a maioria é "🔥🔥🔥" ou "Nice!" sem contexto, os seguidores foram comprados. Comentários reais fazem referência ao conteúdo do post.</p>

      <h2>6. Conta criada recentemente com muitos seguidores</h2>
      <p>Uma conta com 10.000 seguidores criada há 3 meses é muito suspeita. Crescimento orgânico raramente acontece tão rápido sem viralização documentada.</p>

      <h2>7. Sem marcações de localização ou amigos reais</h2>
      <p>Contas reais geralmente aparecem marcadas em fotos de outras pessoas ou marcam lugares. Contas falsas raramente têm esse tipo de interação cruzada.</p>

      <h2>8. Resposta automatizada nas DMs</h2>
      <p>Se você manda mensagem e recebe uma resposta genérica em segundos — especialmente fora do horário comercial — provavelmente é bot. Perfis reais demoram e respondem com contexto.</p>

      <h2>A solução mais rápida</h2>
      <p>Fazer essa análise manualmente leva tempo e exige atenção. O Vetra automatiza tudo isso: verifica o perfil via API oficial do Instagram, analisa os sinais com IA e entrega um score em segundos — com explicação detalhada de cada fator.</p>
    `,
  },

  'lgpd-verificacao-pessoas': {
    slug: 'lgpd-verificacao-pessoas',
    tag: 'Jurídico', tagColor: '#fbbf24',
    title: 'LGPD e verificação de pessoas: o que você pode e não pode fazer',
    excerpt: 'A Lei Geral de Proteção de Dados mudou as regras do jogo. Entenda o que é legalmente permitido ao pesquisar informações sobre terceiros.',
    date: '05 Jan 2025', readTime: '8 min',
    content: `
      <p>A Lei Geral de Proteção de Dados (Lei 13.709/2018) entrou em vigor em 2021 e mudou fundamentalmente a relação das empresas e pessoas com dados pessoais no Brasil. Mas muita gente ainda tem dúvidas: <em>o que exatamente posso verificar sobre outra pessoa?</em></p>

      <h2>O que a LGPD protege?</h2>
      <p>A LGPD protege <strong>dados pessoais</strong> — qualquer informação que identifique ou possa identificar uma pessoa natural. Isso inclui nome, CPF, email, endereço, rosto, dados de saúde, entre outros.</p>
      <p>Dados <strong>sensíveis</strong> têm proteção extra: origem racial, convicção religiosa, saúde, vida sexual, dados genéticos e biométricos.</p>

      <h2>Dados públicos são diferentes</h2>
      <p>A LGPD faz uma distinção importante: <strong>dados tornados manifestamente públicos pelo titular</strong> têm tratamento diferenciado. Se alguém publica algo publicamente no Instagram, esse dado foi voluntariamente tornado público.</p>
      <p>Da mesma forma, registros judiciais são, em regra, públicos. O princípio da publicidade dos atos processuais está na Constituição Federal (art. 93, IX).</p>

      <h2>O que você pode legalmente verificar</h2>
      <ul>
        <li><strong>Perfis públicos de redes sociais:</strong> qualquer pessoa pode ver o que está público</li>
        <li><strong>Registros judiciais públicos:</strong> processos não sigilosos são acessíveis pelo consulta jurídica</li>
        <li><strong>Informações que a própria pessoa forneceu:</strong> com consentimento explícito</li>
        <li><strong>Dados empresariais:</strong> CNPJ, sócios, situação fiscal (dados públicos da Receita)</li>
      </ul>

      <h2>O que você NÃO pode fazer</h2>
      <ul>
        <li>Acessar dados bancários ou financeiros privados</li>
        <li>Consultar dados de saúde sem autorização</li>
        <li>Usar dados para discriminação, assédio ou perseguição</li>
        <li>Compartilhar dados pessoais sem finalidade legítima</li>
        <li>Acessar dados sigilosos de processos judiciais</li>
      </ul>

      <h2>A questão do consentimento</h2>
      <p>Para dados não públicos, o consentimento é fundamental. A LGPD exige que o consentimento seja livre, informado e inequívoco. É por isso que o Vetra sempre solicita que o usuário declare ter consentimento antes de gerar um relatório.</p>

      <h2>Finalidade legítima</h2>
      <p>Mesmo com dados públicos, a finalidade importa. Verificar alguém para proteção pessoal (segurança antes de um encontro), due diligence empresarial ou proteção contra fraudes são finalidades legítimas. Usar para assediar ou perseguir não é.</p>

      <h2>Como o Vetra opera dentro da LGPD</h2>
      <p>O Vetra foi construído com a LGPD como fundamento:</p>
      <ul>
        <li>Apenas dados públicos e fornecidos com consentimento</li>
        <li>CPFs armazenados apenas como hash criptográfico irreversível</li>
        <li>Finalidade declarada pelo usuário antes de cada verificação</li>
        <li>Sem acesso a bases privadas ou governamentais sigilosas</li>
        <li>Direito de exclusão e portabilidade garantidos</li>
      </ul>

      <h2>Conclusão</h2>
      <p>Verificar informações públicas sobre pessoas é legal — desde que a finalidade seja legítima e os dados sejam realmente públicos. A linha vermelha está no acesso a dados privados e no uso para fins ilegítimos.</p>
    `,
  },

  'ia-analise-dados-publicos': {
    slug: 'ia-analise-dados-publicos',
    tag: 'Tecnologia', tagColor: '#a78bfa',
    title: 'Como a IA transforma dados públicos em inteligência acionável',
    excerpt: 'O Gemini AI consegue interpretar dezenas de sinais digitais simultaneamente e gerar análises que levariam horas para um humano produzir.',
    date: '28 Dez 2024', readTime: '6 min',
    content: `
      <p>Imagine ter que verificar manualmente o Instagram de alguém, consultar o base jurídica pública, analisar o padrão de seguidores, verificar o email, cruzar tudo isso e ainda escrever um resumo claro. Isso levaria horas. A inteligência artificial faz em segundos.</p>

      <h2>O problema dos dados fragmentados</h2>
      <p>Dados públicos existem em abundância. O problema é que estão espalhados: Instagram aqui, base jurídica pública ali, email em outro lugar, padrões de comportamento em outro. Juntar tudo manualmente é lento, impreciso e cansativo.</p>

      <h2>Como o Vetra usa o Gemini AI</h2>
      <p>Depois que o sistema coleta e processa todos os sinais digitais, o Gemini 1.5 Flash recebe um pacote estruturado com:</p>
      <ul>
        <li>Score total e scores por categoria</li>
        <li>Sinais positivos e negativos encontrados</li>
        <li>Dados reais do Instagram (seguidores, posts, qualidade)</li>
        <li>Resultado da consulta consulta jurídica</li>
        <li>Dados fornecidos pelo usuário</li>
      </ul>
      <p>O modelo então gera uma análise completa em português: resumo, interpretação, alertas de risco, pontos positivos e recomendação final.</p>

      <h2>Por que isso é poderoso</h2>
      <p>A IA não apenas descreve — ela <em>interpreta</em>. Um score de 75 com Instagram legítimo mas sem base jurídica pública consultado tem uma interpretação diferente de um score de 75 com base jurídica pública limpo mas Instagram privado. A IA entende esses contextos.</p>

      <h2>Temperatura baixa = resultados consistentes</h2>
      <p>O Vetra usa temperatura 0.4 nas chamadas ao Gemini — propositalmente conservadora. Isso garante análises factuais, sem invenções ou alucinações. Queremos dados confiáveis, não criativos.</p>

      <h2>Explicabilidade é fundamental</h2>
      <p>Um dos princípios do Vetra é que cada análise deve ser explicável. Não basta dar um número. O usuário precisa entender <em>por que</em> o score é aquele — e a IA é a ponte entre os dados brutos e o entendimento humano.</p>

      <h2>O futuro: pesos dinâmicos</h2>
      <p>A próxima evolução do sistema é usar IA para ajustar os pesos dos sinais dinamicamente. Um email do Gmail vale diferente quando o telefone também bate. A IA pode aprender esses padrões — e o sistema fica cada vez mais preciso.</p>
    `,
  },

  'seguranca-encontros-tinder': {
    slug: 'seguranca-encontros-tinder',
    tag: 'Segurança', tagColor: '#f87171',
    title: '7 coisas que você precisa verificar antes do primeiro encontro do Tinder',
    excerpt: 'Perfis podem ser construídos em minutos. Antes de se encontrar com alguém que conheceu online, estas verificações podem te proteger.',
    date: '20 Dez 2024', readTime: '9 min',
    content: `
      <p>Você está animada com o match. As fotos são ótimas. A conversa flui. Mas antes de marcar aquele café, existem 7 verificações que podem fazer a diferença entre uma experiência segura e uma situação de risco.</p>

      <blockquote>Não é paranoia. É prevenção inteligente.</blockquote>

      <h2>1. Verifique se o perfil é real</h2>
      <p>A primeira coisa a fazer é confirmar que a pessoa existe de verdade. Peça para adicionar nas redes sociais e observe: a conta é antiga? Tem fotos com contexto real (amigos, lugares, eventos)? As fotos batem com as do Tinder?</p>
      <p>Fotos geradas por IA são cada vez mais comuns. Jogue a foto no Google Imagens — se aparecer em outros lugares, desconfie.</p>

      <h2>2. Pesquise o nome completo</h2>
      <p>Quando você tiver o nome completo, pesquise no Google. Não para invadir privacidade — para verificar consistência. O que aparece? LinkedIn bate com o que ele contou? Existe alguma menção preocupante?</p>

      <h2>3. Confira os registros públicos</h2>
      <p>O base jurídica pública (portal público do ) permite consultar processos judiciais não sigilosos por nome. Não é invasão — são dados públicos. Uma rápida consulta pode revelar processos de violência doméstica, estelionato ou outros crimes relevantes.</p>
      <p>O Vetra faz essa consulta automaticamente como parte do relatório.</p>

      <h2>4. Avalie o padrão de conversa</h2>
      <p>Pessoas mal-intencionadas seguem padrões. Se ele pede dinheiro cedo, tem uma história de vida muito trágica que precisa de ajuda, ou pressiona para encontros imediatos — são sinais de alerta clássicos de romance scam.</p>

      <h2>5. Vídeo chamada antes do encontro</h2>
      <p>Insista em uma vídeo chamada antes do encontro físico. Isso elimina impostores com fotos roubadas e te dá uma noção melhor de quem é a pessoa. Se ele se recusar a fazer vídeo chamada, é um sinal vermelho significativo.</p>

      <h2>6. Avise alguém de confiança</h2>
      <p>Sempre diga para alguém de confiança onde você vai, com quem, e a que horas pretende voltar. Compartilhe a localização em tempo real com uma amiga enquanto está no encontro. Combine uma mensagem de código para sinalizar se precisar de ajuda.</p>

      <h2>7. Escolha local público para o primeiro encontro</h2>
      <p>Nunca aceite convites para casa ou lugares isolados no primeiro encontro. Café movimentado, shopping, praça — lugares públicos com movimento. Vá e volte por conta própria. Não aceite carona na primeira vez.</p>

      <h2>Use tecnologia a seu favor</h2>
      <p>O Vetra foi criado para tornar essas verificações simples e rápidas. Em menos de 60 segundos, você tem um score de confiança completo, verificação do Instagram real, consulta ao base jurídica pública e análise por IA — tudo antes de dar o próximo passo.</p>
      <p>Sua segurança vale mais do que qualquer awkwardness de verificar quem é a pessoa.</p>
    `,
  },

  'datajud-registros-judiciais-publicos': {
    slug: 'datajud-registros-judiciais-publicos',
    tag: 'Jurídico', tagColor: '#fbbf24',
    title: 'base jurídica pública: como consultar registros judiciais públicos gratuitamente',
    excerpt: 'O portal base jurídica pública do  é uma fonte poderosa de informações públicas. Veja como ele funciona e como o Vetra o usa na análise de confiança.',
    date: '15 Dez 2024', readTime: '6 min',
    content: `
      <p>O base jurídica pública é o Sistema Nacional de Informações de Processos Judiciais do Conselho Nacional de Justiça (). Em termos simples: é o banco de dados centralizado de processos judiciais de todo o Brasil — e parte dele é público e acessível por qualquer cidadão.</p>

      <h2>O que é o base jurídica pública?</h2>
      <p>Criado pelo  para integrar as informações processuais de todos os tribunais brasileiros, o base jurídica pública centraliza mais de 90 milhões de processos. É uma ferramenta essencial de transparência judicial.</p>
      <p>Desde 2021, o  disponibiliza uma API pública que permite consultas programáticas — ou seja, sistemas como o Vetra podem integrar e consultar automaticamente.</p>

      <h2>O que é público vs. sigiloso</h2>
      <p>Nem todos os processos são públicos. A Constituição Federal garante publicidade dos atos processuais (art. 93, IX), mas com exceções:</p>
      <ul>
        <li><strong>Público:</strong> a grande maioria dos processos cíveis e criminais</li>
        <li><strong>Sigiloso:</strong> processos que envolvem menores, intimidade, segurança nacional</li>
        <li><strong>Segredo de justiça:</strong> casos específicos determinados pelo juiz</li>
      </ul>
      <p>O Vetra consulta <em>apenas processos públicos</em>. Nunca tenta acessar informações sigilosas.</p>

      <h2>Como consultar manualmente</h2>
      <p>Você pode consultar o base jurídica pública diretamente em <strong>vetra.ai</strong>. A busca por nome ou CPF retorna processos públicos associados àquela pessoa nos tribunais integrados.</p>
      <p>Os principais tribunais já estão integrados: TJSP, TJRJ, TJMG, TJRS, TJPR, STJ, STF e os TRFs.</p>

      <h2>Como o Vetra usa o base jurídica pública</h2>
      <p>O Vetra integra a API pública do base jurídica pública e realiza a consulta automaticamente como parte do processo de verificação:</p>
      <ol>
        <li>Usuário fornece nome e/ou CPF</li>
        <li>Vetra consulta os principais tribunais em paralelo</li>
        <li>Resultado é incorporado ao score e à análise de IA</li>
        <li>Relatório mostra: número de processos encontrados, nível de risco judicial</li>
      </ol>

      <h2>O que significa encontrar processos?</h2>
      <p>Ter processos judiciais não torna ninguém automaticamente suspeito. Um processo de divórcio, uma ação trabalhista como reclamante ou uma disputa de herança são situações comuns e não indicam risco.</p>
      <p>O que o Vetra analisa é o <em>contexto e a quantidade</em>: múltiplos processos criminais são tratados diferentemente de um único processo cível.</p>

      <h2>Privacidade e LGPD</h2>
      <p>A consulta ao base jurídica pública é completamente legal: são dados públicos, disponibilizados pelo próprio Estado. O Vetra não armazena os resultados de forma identificável — eles são usados apenas para calcular o score e gerar o relatório.</p>
    `,
  },
};
