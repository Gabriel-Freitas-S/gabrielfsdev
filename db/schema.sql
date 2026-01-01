DROP TABLE IF EXISTS experiences;
CREATE TABLE experiences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    description TEXT NOT NULL,
    achievements TEXT -- JSON array of strings
);

DROP TABLE IF EXISTS certifications;
CREATE TABLE certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    date TEXT NOT NULL,
    hours INTEGER,
    url TEXT,
    group_name TEXT -- To group related certs
);

-- Textos gerenciáveis
DROP TABLE IF EXISTS site_content;
CREATE TABLE site_content (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Dados importados do projeto legado (site-astro)
INSERT INTO experiences (company, role, start_date, end_date, description, achievements) VALUES
('Seatrium Aracruz', 'Auxiliar de Infraestrutura', '2023-10-01', '2025-02-01', 'Durante minha atuação na empresa, tive a oportunidade de participar ativamente em um projeto mobile de grande relevância. Minha contribuição abrangeu diversas etapas do processo, desde o levantamento de requisitos junto aos stakeholders até a prototipagem no Figma. Além disso, estive envolvido no desenvolvimento do aplicativo e na prestação de suporte pós-lançamento. Esta experiência multifacetada me permitiu aprimorar minhas habilidades técnicas e de comunicação, além de proporcionar uma visão abrangente do ciclo de vida de um projeto de software. O trabalho em estreita colaboração com diferentes equipes e stakeholders foi fundamental para o sucesso do projeto e para meu crescimento profissional.', '["Participação em um projeto mobile de grande relevância","Levantamento de requisitos junto aos stakeholders","Prototipagem no Figma","Desenvolvimento do aplicativo","Prestação de suporte pós-lançamento","Aprimoramento de habilidades técnicas e de comunicação","Colaboração com diferentes equipes e stakeholders","Visão abrangente do ciclo de vida de um projeto de software"]'),
('IRMANDADE DA SANTA CASA DE MISERICORDIA DE VITORIA', 'Auxiliar de Escritório Geral', '2023-05-01', '2023-10-01', 'Atuei como auxiliar administrativo na Santa Casa de Vitória Unidade Pró-Matre, onde minhas responsabilidades incluíam a organização de arquivos, o apoio às rotinas administrativas e a colaboração em equipe. Esta experiência foi fundamental para o desenvolvimento de habilidades de organização e trabalho em equipe, além de proporcionar uma visão do funcionamento de uma instituição de saúde.', '["Organização de arquivos administrativos","Apoio às rotinas administrativas diárias","Colaboração em equipe para otimização de processos","Desenvolvimento de habilidades organizacionais e de trabalho em equipe","Experiência em ambiente hospitalar, adquirindo visão sobre o funcionamento de uma instituição de saúde"]'),
('Correios', 'Assistente Administrativo', '2019-02-01', '2020-02-01', 'Durante minha experiência como jovem aprendiz nos Correios, iniciei minha formação com o curso de Assistente de Logística no SENAI, onde adquiri conhecimentos teóricos fundamentais sobre a área. Após essa etapa, fui designado para uma agência dos Correios, onde pude aplicar na prática o que aprendi, sendo responsável pela separação de encomendas e correspondências de acordo com os CEPs. Essa vivência me proporcionou uma visão abrangente do setor logístico e contribuiu para o desenvolvimento de habilidades como organização e atenção aos detalhes.', '["Curso de Assistente de Logística no SENAI","Aplicação prática de conhecimentos logísticos nos Correios","Desenvolvimento de habilidades em organização e atenção aos detalhes","Visão do setor logístico e de distribuição de encomendas"]');

INSERT INTO certifications (title, issuer, date, hours, url, group_name) VALUES
-- HTML e CSS - fundamentos
('HTML e CSS: ambientes de desenvolvimento, estrutura de arquivos e tags', 'Alura', '2023-12-12', 8, '', 'HTML e CSS - fundamentos'),
('HTML e CSS: Classes, posicionamento e Flexbox', 'Alura', '2023-12-12', 8, '', 'HTML e CSS - fundamentos'),
('HTML e CSS: cabeçalho, footer e variáveis CSS', 'Alura', '2023-12-12', 6, '', 'HTML e CSS - fundamentos'),
('HTML e CSS: trabalhando com responsividade e publicação de projetos', 'Alura', '2023-12-13', 6, '', 'HTML e CSS - fundamentos'),
('HTML e CSS: praticando HTML/CSS', 'Alura', '2023-12-13', 8, '', 'HTML e CSS - fundamentos'),
('HTML e CSS: responsividade com mobile-first', 'Alura', '2023-12-15', 12, '', 'HTML e CSS - fundamentos'),

-- CSS e layout
('CSS: Flexbox e layouts responsivos', 'Alura', '2023-12-15', 6, '', 'CSS e layout'),
('CSS: construindo layouts com Grid', 'Alura', '2023-12-18', 6, '', 'CSS e layout'),
('SASS e CSS: estilizando um site', 'Alura', '2023-12-18', 8, '', 'CSS e layout'),
('Tailwind CSS: estilizando a sua página com classes utilitárias', 'Alura', '2023-12-18', 8, '', 'CSS e layout'),
('Praticando CSS: Grid e Flexbox', 'Alura', '2023-12-18', 6, '', 'CSS e layout'),

-- JavaScript para Web
('JavaScript para Web: Crie páginas dinâmicas', 'Alura', '2023-12-19', 10, '', 'JavaScript para Web'),
('JavaScript: manipulando elementos no DOM', 'Alura', '2023-12-19', 6, '', 'JavaScript para Web'),
('JavaScript: explorando a manipulação de elementos e da localStorage', 'Alura', '2023-12-19', 8, '', 'JavaScript para Web'),
('JavaScript: validações e reconhecimento de voz', 'Alura', '2023-12-19', 6, '', 'JavaScript para Web'),
('JavaScript: consumindo e tratando dados de uma API', 'Alura', '2023-12-19', 6, '', 'JavaScript para Web'),
('JavaScript: métodos de array', 'Alura', '2023-12-19', 8, '', 'JavaScript para Web'),
('JavaScript: criando requisições', 'Alura', '2023-12-20', 8, '', 'JavaScript para Web'),
('JavaScript: validando formulários', 'Alura', '2023-12-20', 8, '', 'JavaScript para Web'),

-- JavaScript OO e concorrência
('JavaScript: manipulando objetos', 'Alura', '2023-12-20', 8, '', 'JavaScript OO e concorrência'),
('JavaScript: classes e heranças no desenvolvimento de aplicações com orientação a objetos', 'Alura', '2023-12-20', 6, '', 'JavaScript OO e concorrência'),
('JavaScript: trabalhando com threads para requisições simultâneas', 'Alura', '2023-12-20', 6, '', 'JavaScript OO e concorrência'),

-- React com JavaScript/TypeScript
('React: desenvolvendo com JavaScript', 'Alura', '2023-12-22', 14, '', 'React com JavaScript/TypeScript'),
('React: como os componentes funcionam', 'Alura', '2023-12-26', 8, '', 'React com JavaScript/TypeScript'),
('React: desenvolvendo em React Router com JavaScript', 'Alura', '2023-12-26', 8, '', 'React com JavaScript/TypeScript'),
('React: estilize componentes com Styled Components e manipule arquivos estáticos', 'Alura', '2023-12-26', 10, '', 'React com JavaScript/TypeScript'),
('React: gerencie estados globalmente com Context API', 'Alura', '2023-12-26', 8, '', 'React com JavaScript/TypeScript'),
('React: praticando React com Js', 'Alura', '2023-12-26', 8, '', 'React com JavaScript/TypeScript'),
('React: migrando para TypeScript', 'Alura', '2023-12-26', 8, '', 'React com JavaScript/TypeScript'),

-- TypeScript
('TypeScript Part 1: Evolving Your JavaScript', 'Alura', '2023-12-21', 10, '', 'TypeScript'),
('TypeScript parte 2: avançando na linguagem', 'Alura', '2023-12-21', 10, '', 'TypeScript'),
('Typescript parte 3: mais técnicas e boas práticas', 'Alura', '2023-12-21', 10, '', 'TypeScript'),

-- Dart e Flutter
('Dart: criando e manipulando variáveis e listas', 'Alura', '2023-11-16', 10, '', 'Dart e Flutter'),
('Dart: entendendo a Orientação a Objetos', 'Alura', '2023-11-17', 12, '', 'Dart e Flutter'),
('Dart: sintaxe, coleções e dinamismo', 'Alura', '2023-11-18', 8, '', 'Dart e Flutter'),
('Dart: lidando com Exceptions e Null Safety', 'Alura', '2023-11-20', 12, '', 'Dart e Flutter'),
('Dart: entendendo assincronismo', 'Alura', '2023-11-20', 8, '', 'Dart e Flutter'),

-- Engenharia de software
('Quality Assurance: plano de testes e gestão de bugs', 'Alura', '2024-01-23', 8, '', 'Engenharia de software'),
('Microsserviços: padrões de projeto', 'Alura', '2023-12-29', 6, '', 'Engenharia de software'),
('Microsserviços: explorando os conceitos', 'Alura', '2024-01-02', 8, '', 'Engenharia de software'),
('Microsserviços na prática: entendendo a tomada de decisões', 'Alura', '2024-01-22', 8, '', 'Engenharia de software'),
('Integração Contínua: mais qualidade e menos risco no desenvolvimento', 'Alura', '2024-01-24', 6, '', 'Engenharia de software'),
('Entrega Contínua: confiabilidade e qualidade na implantação de software', 'Alura', '2024-01-24', 8, '', 'Engenharia de software'),
('Scrum: agilidade em seu projeto', 'Alura', '2024-01-24', 8, '', 'Engenharia de software'),
('Equipes ágeis: organizando os papéis em uma equipe', 'Alura', '2024-01-24', 8, '', 'Engenharia de software'),
('Extreme Programming: metodologia de desenvolvimento ágil de software', 'Alura', '2024-01-24', 8, '', 'Engenharia de software'),

-- OWASP e Segurança
('OWASP Top 10: de Injections a Broken Access Control', 'Alura', '2024-01-25', 4, '', 'OWASP e Segurança'),
('OWASP Top 10: Security misconfiguration, logging e monitoramento', 'Alura', '2024-01-25', 6, '', 'OWASP e Segurança'),
('OWASP: padrão de verificação de segurança de aplicações', 'Alura', '2024-01-25', 6, '', 'OWASP e Segurança'),
('OWASP: padrão de verificação de segurança de aplicações V5 a V8', 'Alura', '2024-01-26', 7, '', 'OWASP e Segurança'),
('OWASP: padrão de verificação de segurança de aplicações V9 a V14', 'Alura', '2024-01-26', 7, '', 'OWASP e Segurança'),
('OWASP: melhorando a segurança com Clojure', 'Alura', '2024-01-30', 12, '', 'OWASP e Segurança'),

-- Rust
('Rust: a linguagem de programação performática e segura', 'Alura', '2024-04-29', 8, '', 'Rust'),
('Rust: aprenda mais sobre tipos', 'Alura', '2024-04-30', 8, '', 'Rust');

-- Conteúdo editável padrão
INSERT INTO site_content (key, value) VALUES
('hero_title', 'Desenvolvedor Full Stack'),
('hero_subtitle', 'Especialista em criar soluções modernas, escaláveis e esteticamente agradáveis. Focando agora em infraestrutura Cloudflare e experiência do usuário.'),
('hero_cta_experience', 'Ver Experiência'),
('hero_cta_certifications', 'Certificações');
