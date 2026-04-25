# ✦ TaskFlow – Gerenciador de Tarefas Moderno

TaskFlow é um aplicativo web de lista de tarefas (To-Do List) funcional e elegante, desenvolvido com foco em estética premium (Dark Luxury) e alta performance. O app oferece gerenciamento completo de tarefas com categorização, priorização e análises visuais.

![TaskFlow Preview](https://via.placeholder.com/1200x600/0d0d0f/c9a84c?text=TaskFlow+Premium+To-Do+List)

## 🚀 Funcionalidades

### 📋 Gestão de Tarefas (CRUD)
- **Criação Rápida**: Adicione tarefas com título, data e metadados.
- **Conclusão**: Marque tarefas com um clique (animação de checkbox customizada).
- **Exclusão**: Remova tarefas de forma intuitiva.
- **Persistência Dual**: Sincronização em tempo real com **Supabase** e fallback offline via **LocalStorage**.

### 🏷️ Organização Inteligente
- **Categorização**: Organize por Trabalho, Pessoal, Estudos ou Outros, com tags coloridas.
- **Priorização**: Sistema de prioridade (Alta, Média, Baixa) com indicadores visuais dinâmicos.
- **Data de Vencimento**: Ícones de alerta para tarefas atrasadas.

### 📊 Visualização e Análises
- **Dashboards**: Acompanhe sua produtividade com métricas de conclusão e distribuição por categoria.
- **Calendário Interativo**: Veja suas tarefas distribuídas no mês e crie novas tarefas clicando diretamente nos dias.
- **Filtros Avançados**: Alterne entre tarefas 'Todas', 'Pendentes' e 'Concluídas'.

## 🛠️ Tecnologias Utilizadas

- **Core**: [React 18](https://reactjs.org/) (via CDN/UMD)
- **Backend/DB**: [Supabase](https://supabase.com/) (PostgreSQL + RLS)
- **Estilização**: CSS3 Customizado (Design System próprio com variáveis e Glassmorphism)
- **Ícones**: SVGs Inline customizados (baseados em Lucide)
- **Tipografia**: Google Fonts (Playfair Display & DM Sans)

## 📦 Como rodar o projeto

O projeto foi desenvolvido para ser extremamente leve e não requer instalação de dependências locais (como Node.js), pois utiliza bibliotecas via CDN.

1. Clone o repositório:
   ```bash
   git clone https://github.com/kellybeu48-gut/lista_tarefas.git
   ```
2. Entre na pasta do projeto:
   ```bash
   cd lista_tarefas
   ```
3. Abra o arquivo `index.html` em qualquer navegador moderno.

*Dica: Para evitar problemas de segurança de alguns navegadores ao carregar arquivos locais, recomenda-se usar uma extensão de "Live Server" ou rodar um comando simples de servidor (ex: `npx serve` ou `python -m http.server`).*

## 🔒 Segurança e Banco de Dados

O projeto utiliza **Supabase Row Level Security (RLS)** para proteger os dados. Atualmente, está configurado com uma política de acesso público para fins de demonstração, mas está preparado para integração completa com o Supabase Auth.

---

Desenvolvido com ❤️ por [Kellybeu](https://github.com/kellybeu48-gut)
