-- Limpa dados atuais (opcional; comente se não quiser apagar)
DELETE FROM experiences;
DELETE FROM certifications;
DELETE FROM site_content;

-- Experiências do legado
INSERT INTO experiences (company, role, start_date, end_date, description, achievements) VALUES
('Seatrium Aracruz', 'Auxiliar de Infraestrutura', '2023-10-01', '2025-02-01', 'Durante minha atuacao na empresa, tive a oportunidade de participar ativamente em um projeto mobile de grande relevancia. Minha contribuicao abrangeu diversas etapas do processo, desde o levantamento de requisitos junto aos stakeholders ate a prototipagem no Figma. Alem disso, estive envolvido no desenvolvimento do aplicativo e na prestacao de suporte pos-lancamento. Esta experiencia multifacetada me permitiu aprimorar minhas habilidades tecnicas e de comunicacao, alem de proporcionar uma visao abrangente do ciclo de vida de um projeto de software. O trabalho em estreita colaboracao com diferentes equipes e stakeholders foi fundamental para o sucesso do projeto e para meu crescimento profissional.', '["Participacao em um projeto mobile de grande relevancia","Levantamento de requisitos junto aos stakeholders","Prototipagem no Figma","Desenvolvimento do aplicativo","Prestacao de suporte pos-lancamento","Aprimoramento de habilidades tecnicas e de comunicacao","Colaboracao com diferentes equipes e stakeholders","Visao abrangente do ciclo de vida de um projeto de software"]'),
('IRMANDADE DA SANTA CASA DE MISERICORDIA DE VITORIA', 'Auxiliar de Escritorio Geral', '2023-05-01', '2023-10-01', 'Atuei como auxiliar administrativo na Santa Casa de Vitoria Unidade Pro-Matre, onde minhas responsabilidades incluiam a organizacao de arquivos, o apoio as rotinas administrativas e a colaboracao em equipe. Esta experiencia foi fundamental para o desenvolvimento de habilidades de organizacao e trabalho em equipe, alem de proporcionar uma visao do funcionamento de uma instituicao de saude.', '["Organizacao de arquivos administrativos","Apoio as rotinas administrativas diarias","Colaboracao em equipe para otimizacao de processos","Desenvolvimento de habilidades organizacionais e de trabalho em equipe","Experiencia em ambiente hospitalar, adquirindo visao sobre o funcionamento de uma instituicao de saude"]'),
('Correios', 'Assistente Administrativo', '2019-02-01', '2020-02-01', 'Durante minha experiencia como jovem aprendiz nos Correios, iniciei minha formacao com o curso de Assistente de Logistica no SENAI, onde adquiri conhecimentos teoricos fundamentais sobre a area. Apos essa etapa, fui designado para uma agencia dos Correios, onde pude aplicar na pratica o que aprendi, sendo responsavel pela separacao de encomendas e correspondencias de acordo com os CEPs. Essa vivencia me proporcionou uma visao abrangente do setor logistico e contribuiu para o desenvolvimento de habilidades como organizacao e atencao aos detalhes.', '["Curso de Assistente de Logistica no SENAI","Aplicacao pratica de conhecimentos logisticos nos Correios","Desenvolvimento de habilidades em organizacao e atencao aos detalhes","Visao do setor logistico e de distribuicao de encomendas"]');

-- Certificações do legado
INSERT INTO certifications (title, issuer, date, hours, url, group_name) VALUES
('HTML e CSS: ambientes de desenvolvimento, estrutura de arquivos e tags', 'Alura', '2023-12-12', 8, '', 'HTML e CSS - fundamentos'),
('HTML e CSS: Classes, posicionamento e Flexbox', 'Alura', '2023-12-12', 8, '', 'HTML e CSS - fundamentos'),
('HTML e CSS: cabecalho, footer e variaveis CSS', 'Alura', '2023-12-12', 6, '', 'HTML e CSS - fundamentos'),
('HTML e CSS: trabalhando com responsividade e publicacao de projetos', 'Alura', '2023-12-13', 6, '', 'HTML e CSS - fundamentos'),
('HTML e CSS: praticando HTML/CSS', 'Alura', '2023-12-13', 8, '', 'HTML e CSS - fundamentos'),
('HTML e CSS: responsividade com mobile-first', 'Alura', '2023-12-15', 12, '', 'HTML e CSS - fundamentos'),
('CSS: Flexbox e layouts responsivos', 'Alura', '2023-12-15', 6, '', 'CSS e layout'),
('CSS: construindo layouts com Grid', 'Alura', '2023-12-18', 6, '', 'CSS e layout'),
('SASS e CSS: estilizando um site', 'Alura', '2023-12-18', 8, '', 'CSS e layout'),
('Tailwind CSS: estilizando a sua pagina com classes utilitarias', 'Alura', '2023-12-18', 8, '', 'CSS e layout'),
('Praticando CSS: Grid e Flexbox', 'Alura', '2023-12-18', 6, '', 'CSS e layout'),
('JavaScript para Web: Crie paginas dinamicas', 'Alura', '2023-12-19', 10, '', 'JavaScript para Web'),
('JavaScript: manipulando elementos no DOM', 'Alura', '2023-12-19', 6, '', 'JavaScript para Web'),
('JavaScript: explorando a manipulacao de elementos e da localStorage', 'Alura', '2023-12-19', 8, '', 'JavaScript para Web'),
('JavaScript: validacoes e reconhecimento de voz', 'Alura', '2023-12-19', 6, '', 'JavaScript para Web'),
('JavaScript: consumindo e tratando dados de uma API', 'Alura', '2023-12-19', 6, '', 'JavaScript para Web'),
('JavaScript: metodos de array', 'Alura', '2023-12-19', 8, '', 'JavaScript para Web'),
('JavaScript: criando requisicoes', 'Alura', '2023-12-20', 8, '', 'JavaScript para Web'),
('JavaScript: validando formularios', 'Alura', '2023-12-20', 8, '', 'JavaScript para Web'),
('JavaScript: manipulando objetos', 'Alura', '2023-12-20', 8, '', 'JavaScript OO e concorrencia'),
('JavaScript: classes e herancas no desenvolvimento de aplicacoes com orientacao a objetos', 'Alura', '2023-12-20', 6, '', 'JavaScript OO e concorrencia'),
('JavaScript: trabalhando com threads para requisicoes simultaneas', 'Alura', '2023-12-20', 6, '', 'JavaScript OO e concorrencia'),
('React: desenvolvendo com JavaScript', 'Alura', '2023-12-22', 14, '', 'React com JavaScript/TypeScript'),
('React: como os componentes funcionam', 'Alura', '2023-12-26', 8, '', 'React com JavaScript/TypeScript'),
('React: desenvolvendo em React Router com JavaScript', 'Alura', '2023-12-26', 8, '', 'React com JavaScript/TypeScript'),
('React: estilize componentes com Styled Components e manipule arquivos estaticos', 'Alura', '2023-12-26', 10, '', 'React com JavaScript/TypeScript'),
('React: gerencie estados globalmente com Context API', 'Alura', '2023-12-26', 8, '', 'React com JavaScript/TypeScript'),
('React: praticando React com Js', 'Alura', '2023-12-26', 8, '', 'React com JavaScript/TypeScript'),
('React: migrando para TypeScript', 'Alura', '2023-12-26', 8, '', 'React com JavaScript/TypeScript'),
('TypeScript Part 1: Evolving Your JavaScript', 'Alura', '2023-12-21', 10, '', 'TypeScript'),
('TypeScript parte 2: avancando na linguagem', 'Alura', '2023-12-21', 10, '', 'TypeScript'),
('Typescript parte 3: mais tecnicas e boas praticas', 'Alura', '2023-12-21', 10, '', 'TypeScript'),
('Dart: criando e manipulando variaveis e listas', 'Alura', '2023-11-16', 10, '', 'Dart e Flutter'),
('Dart: entendendo a Orientacao a Objetos', 'Alura', '2023-11-17', 12, '', 'Dart e Flutter'),
('Dart: sintaxe, colecoes e dinamismo', 'Alura', '2023-11-18', 8, '', 'Dart e Flutter'),
('Dart: lidando com Exceptions e Null Safety', 'Alura', '2023-11-20', 12, '', 'Dart e Flutter'),
('Dart: entendendo assincronismo', 'Alura', '2023-11-20', 8, '', 'Dart e Flutter'),
('Quality Assurance: plano de testes e gestao de bugs', 'Alura', '2024-01-23', 8, '', 'Engenharia de software'),
('Microsservicos: padroes de projeto', 'Alura', '2023-12-29', 6, '', 'Engenharia de software'),
('Microsservicos: explorando os conceitos', 'Alura', '2024-01-02', 8, '', 'Engenharia de software'),
('Microsservicos na pratica: entendendo a tomada de decisoes', 'Alura', '2024-01-22', 8, '', 'Engenharia de software'),
('Integracao Continua: mais qualidade e menos risco no desenvolvimento', 'Alura', '2024-01-24', 6, '', 'Engenharia de software'),
('Entrega Continua: confiabilidade e qualidade na implantacao de software', 'Alura', '2024-01-24', 8, '', 'Engenharia de software'),
('Scrum: agilidade em seu projeto', 'Alura', '2024-01-24', 8, '', 'Engenharia de software'),
('Equipes ageis: organizando os papeis em uma equipe', 'Alura', '2024-01-24', 8, '', 'Engenharia de software'),
('Extreme Programming: metodologia de desenvolvimento agil de software', 'Alura', '2024-01-24', 8, '', 'Engenharia de software'),
('OWASP Top 10: de Injections a Broken Access Control', 'Alura', '2024-01-25', 4, '', 'OWASP e Seguranca'),
('OWASP Top 10: Security misconfiguration, logging e monitoramento', 'Alura', '2024-01-25', 6, '', 'OWASP e Seguranca'),
('OWASP: padrao de verificacao de seguranca de aplicacoes', 'Alura', '2024-01-25', 6, '', 'OWASP e Seguranca'),
('OWASP: padrao de verificacao de seguranca de aplicacoes V5 a V8', 'Alura', '2024-01-26', 7, '', 'OWASP e Seguranca'),
('OWASP: padrao de verificacao de seguranca de aplicacoes V9 a V14', 'Alura', '2024-01-26', 7, '', 'OWASP e Seguranca'),
('OWASP: melhorando a seguranca com Clojure', 'Alura', '2024-01-30', 12, '', 'OWASP e Seguranca'),
('Rust: a linguagem de programacao performatica e segura', 'Alura', '2024-04-29', 8, '', 'Rust'),
('Rust: aprenda mais sobre tipos', 'Alura', '2024-04-30', 8, '', 'Rust');

-- Conteúdo editável padrão
INSERT INTO site_content (key, value) VALUES
('hero_title', 'Desenvolvedor Full Stack'),
('hero_subtitle', 'Especialista em criar solucoes modernas, escalaveis e esteticamente agradaveis. Focando agora em infraestrutura Cloudflare e experiencia do usuario.'),
('hero_cta_experience', 'Ver Experiencia'),
('hero_cta_certifications', 'Certificacoes');