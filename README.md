# ⚙️ Mads | Portfólio & Laboratório de Aplicações

Bem-vindo ao repositório do meu **portfólio e dashboard de projetos**, desenvolvido para hospedar demonstrações interativas, templates e aplicações web no **GitHub Pages**.

🔗 **Acesse o Portfólio Online:** [https://miniharmer.github.io/github-portifolio/](https://miniharmer.github.io/github-portifolio/)

---

## 🧭 Sobre o Desenvolvedor

- **Nome:** Guilherme Madeira
- **Apelido / Assinatura:** Mads
- **GitHub:** [@Miniharmer](https://github.com/Miniharmer)
- **LinkedIn:** [in/miniharmer](https://www.linkedin.com/in/miniharmer)

---

## 🎨 Conceito Visual & Design

O portfólio foi desenhado com uma estética **Retro Vintage & Fantasia Steampunk Alquímica**, equilibrando elegância clássica com usabilidade moderna:

- **Paleta de Cores:** Viagem suave entre **dourado/latão antigo** e **roxo/ametista**, utilizando predominantemente tons pastéis claros para garantir alto conforto visual e legibilidade, reservando saturações fortes apenas para estados de foco, hover e destaques principais.
- **Tipografia:** 
  - `Poppins`: Interface limpa, legível e moderna para corpo de texto, botões e tags.
  - `Satisfy`: Toque caligráfico / feito à mão no título e na assinatura.
  - `Cinzel`: Detalhes clássicos e ornamentais nos subtítulos.
- **Elementos Visuais:** Engrenagens decorativas sutis animadas em SVG, cantos ornamentados com moldura clássica nos cards e transições fluídas.

---

## 📂 Estrutura do Repositório

```text
github-portifolio/
│
├── index.html              # Página inicial e Dashboard principal do portfólio
│
├── css/
│   └── style.css           # Estilos temáticos do portfólio (variáveis, layout e responsividade)
│
├── js/
│   └── main.js             # Lógica de busca em tempo real, filtros de categorias e contadores
│
├── trellomads-demo/        # [PROJETO 1] Demonstração completa do sistema Kanban TrelloMads
│   ├── index.html          # Redirecionador do TrelloMads
│   ├── dashboard.html      # Painel de quadros
│   ├── quadro.html         # Quadro interativo de tarefas
│   └── ...
│
└── README.md               # Documentação do projeto
```

---

## 🚀 Como Adicionar uma Nova Aplicação no Dashboard

Toda a arquitetura foi planejada para que você só precise **copiar e colar um bloco no `index.html`** sem precisar alterar nenhuma linha de JavaScript ou CSS!

### Passo a Passo:

1. Coloque a pasta do seu novo projeto na raiz deste repositório (exemplo: `meu-novo-projeto/`).
2. Abra o arquivo `index.html`.
3. Na seção `<div class="projects-grid" id="projectsGrid">`, duplique o card abaixo e ajuste os textos:

```html
<article class="project-card" data-category="app">
    <!-- Cantos ornamentais clássicos -->
    <div class="card-corners-extra" aria-hidden="true"></div>

    <!-- Cabeçalho com Ícone e Categoria -->
    <div class="card-top">
        <div class="card-icon-wrapper">
            <!-- Escolha qualquer ícone do Font Awesome -->
            <i class="fa-solid fa-rocket"></i>
        </div>
        <!-- Categoria: "app", "template" ou "experimento" -->
        <span class="card-category-badge">Aplicação</span>
    </div>

    <!-- Conteúdo do Card -->
    <div class="card-content">
        <h3 class="card-title">Nome da Sua Aplicação</h3>
        <p class="card-description">
            Breve resumo explicando o que a aplicação faz, os recursos principais e as tecnologias utilizadas.
        </p>
        <div class="card-tags">
            <span class="card-tag">JavaScript</span>
            <span class="card-tag">CSS3</span>
            <span class="card-tag">HTML5</span>
        </div>
    </div>

    <!-- Botão de Redirecionamento -->
    <div class="card-action">
        <a href="./meu-novo-projeto/index.html" class="card-link-btn" title="Abrir projeto">
            <span>Acessar Demonstração</span>
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
    </div>
</article>
```

4. Salve o arquivo e envie para o GitHub (`git add . && git commit -m "feat: novo projeto adicionado" && git push`).
5. Pronto! O script do dashboard atualizará automaticamente a contagem de projetos e incluirá seu novo card na busca e nos filtros.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 Semântico:** Acessibilidade, OpenGraph e estrutura modular.
- **CSS3 Moderno:** CSS Grid, Flexbox, Variáveis Customizadas (`:root`), animações e glassmorphism.
- **JavaScript Vanilla (ES6+):** Busca dinâmica, filtragem por tags/categorias e feedback com notificações toast.
- **Google Fonts & Font Awesome 6:** Tipografia e iconografia integradas via CDN.

