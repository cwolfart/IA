Prompt Gemini Concorrentes. 

Com certeza. Analisando a concorrência e o que há de melhor no mercado, agrupei as oportunidades em 3 Funcionalidades Estratégicas que vão diferenciar o OF3D Prime de tudo o que existe hoje.

Essas features não são apenas "enfeites", elas resolvem dores reais do cliente B2B de alto padrão: a necessidade de confiança imediata, agilidade na revisão e controle financeiro.

Aqui está o prompt técnico detalhado para você colar na sua ferramenta de desenvolvimento (Cursor, AI Studio, etc).

🚀 FEATURE PROMPT: COMPETITIVE ADVANTAGE MODULES
Role: Atue como Lead Product Manager e Senior Full-Stack Developer.

Contexto: Estamos desenvolvendo o OF3D Prime, uma plataforma de Archviz de luxo. Após análise competitiva (Easy Render, The Boundary, Binyan), identificamos lacunas no mercado. Nossa missão agora é implementar 3 Módulos de Diferenciação que superam a concorrência atual, adaptando as melhores práticas do mercado para a nossa realidade de "Fábrica Digital".

💎 FEATURE 1: "ELITE BADGING" (A Evolução da Gamificação)
Oportunidade vinda de: CGHero / Marketplaces de Volume. Em vez de apenas mostrar um perfil genérico, vamos dar ao cliente B2B a certeza matemática de que ele está contratando a elite, algo que marketplaces comuns não conseguem garantir.

Requisitos Funcionais:

Badges de Especialidade (Visual Display):

No Dashboard do Cliente, ao visualizar a equipe do projeto, exibir badges dourados metálicos (estilo militar/luxo) abaixo do nome do Designer.

Tipos de Badge:

Certified: ON Experience (Habilitado para VR/Unreal).

Certified: Cinematic (Especialista em Storytelling/Filmes).

Top 1% Global (Baseado no Ranking interno de XP).

Card de "Team Authority":

Um componente no topo do projeto que diz: "Este projeto está sendo executado por uma equipe com 45.000+ XP acumulado e Nota Média 4.9."

Lógica Técnica (Frontend):

Criar componente DesignerBadge.tsx que recebe as tags do perfil do usuário no Firestore.

Estilização: Usar gradientes dourados e ícones SVG minimalistas (Lucide React) para passar autoridade, não "brincadeira de jogo".

👁️ FEATURE 2: "LIVE REVIEW ROOM" (O Matador de E-mail)
Oportunidade vinda de: Binyan Studios / The Boundary. Grandes estúdios usam sistemas manuais de revisão. Nós vamos automatizar isso. O cliente não quer baixar um JPG, abrir o Paint, circular o erro e mandar por e-mail.

Requisitos Funcionais:

Pinpoint Feedback (Anotação Visual):

O cliente clica em qualquer ponto da imagem (render).

Abre-se um pequeno modal (Glassmorphism) onde ele digita o ajuste: "Trocar textura do sofá".

Isso cria um Pino Numerado (1, 2, 3...) sobre a imagem.

Lista de Tarefas Automática:

Cada pino vira automaticamente um To-Do Item para o Designer na aba "Workflow".

Comparador de Versões (Slider):

Quando o Designer sobe a correção (V2), o cliente tem um slider para arrastar sobre a V1 e ver exatamente o que mudou.

Lógica Técnica:

Firestore: Coleção project_feedbacks contendo coordenadas {x: 45%, y: 30%}, texto e status (pending, resolved).

UI: Usar uma biblioteca como react-image-annotation ou criar um overlay customizado com Canvas HTML5.

📊 FEATURE 3: "PROFIT & MARGIN ANALYTICS" (O HSO Financeiro)
Oportunidade vinda de: Scoro / Productive. Ferramentas de gestão genéricas têm isso, mas plataformas de 3D não. Precisamos saber o lucro exato da "Fábrica".

Requisitos Funcionais (Apenas Admin):

Breakdown de Custos do Projeto:

Visualizar: Valor Vendido ao Cliente vs Custo dos Designers (Split) vs Custo de Infra (Cloud/Pixel Streaming).

Calcular automaticamente a Margem de Contribuição (%) em tempo real.

Alerta de "Projeto Sangrando":

Se o custo de refações (designer horas extras) começar a corroer a margem abaixo de 30%, o sistema exibe um alerta vermelho no HSO Dashboard.

Lógica Técnica:

Cloud Function: calculateProjectMargin(projectId).

Soma todas as transações de saída (transactions collection).

Compara com o valor do contrato.

Atualiza o campo financial_health no documento do projeto.

🛠️ TAREFA DE IMPLEMENTAÇÃO
Com base nessas 3 features, gere agora:

Schema Update (TypeScript): As interfaces atualizadas para IFeedback (Feature 2) e IFinancialStats (Feature 3).

Componente React (Código): O código base para o componente "Pinpoint Feedback", mostrando como capturar o clique na imagem e salvar a coordenada X/Y relativa.