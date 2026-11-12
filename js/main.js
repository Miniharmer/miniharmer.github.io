/**
 * ============================================================================
 * PORTFÓLIO & DASHBOARD - GUILHERME MADEIRA (MADS)
 * Script Principal de Interatividades e Filtros do Dashboard
 * ============================================================================
 * 
 * Este arquivo controla:
 * 1. Filtro dinâmico de projetos por categoria (Todos, Aplicações, Templates, etc.)
 * 2. Pesquisa em tempo real (por título, descrição ou tags)
 * 3. Contador dinâmico de projetos ativos
 * 4. Sistema de Toast (notificações na tela)
 * 
 * DICA PARA O MADS:
 * Ao adicionar um novo card no HTML, você NÃO precisa mexer em nada aqui!
 * O script lê os cards automaticamente usando as classes .project-card, 
 * os data-category="sua-categoria" e o conteúdo de texto do card.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------------------------------------------
    // ELEMENTOS DO DOM
    // ------------------------------------------------------------------------
    const searchInput = document.getElementById('projectSearch');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card:not(.new-slot-card)');
    const countDisplay = document.getElementById('visibleProjectsCount');
    const totalDisplay = document.getElementById('totalProjectsCount');
    const noResultsMessage = document.getElementById('noResultsMessage');

    // Inicializa contador total de projetos
    if (totalDisplay) {
        totalDisplay.textContent = projectCards.length;
    }

    let currentCategory = 'all';
    let currentSearchTerm = '';

    // ------------------------------------------------------------------------
    // FUNÇÃO PRINCIPAL: FILTRAR CARDS
    // ------------------------------------------------------------------------
    function filterProjects() {
        let visibleCount = 0;

        projectCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category') || 'all';
            const cardText = card.textContent.toLowerCase();

            // Verifica se bate com a categoria selecionada
            const matchesCategory = (currentCategory === 'all' || cardCategory === currentCategory);

            // Verifica se bate com o texto digitado na busca
            const matchesSearch = cardText.includes(currentSearchTerm);

            if (matchesCategory && matchesSearch) {
                card.style.display = 'flex';
                // Efeito suave de entrada
                card.style.animation = 'fadeIn 0.35s ease forwards';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Atualiza o contador de exibição
        if (countDisplay) {
            countDisplay.textContent = visibleCount;
        }

        // Mostra ou esconde aviso de "Nenhum resultado encontrado"
        if (noResultsMessage) {
            if (visibleCount === 0) {
                noResultsMessage.style.display = 'block';
            } else {
                noResultsMessage.style.display = 'none';
            }
        }
    }

    // ------------------------------------------------------------------------
    // EVENTO: BARRA DE PESQUISA
    // ------------------------------------------------------------------------
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value.trim().toLowerCase();
            filterProjects();
        });
    }

    // ------------------------------------------------------------------------
    // EVENTO: BOTÕES DE FILTRO POR CATEGORIA
    // ------------------------------------------------------------------------
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove a classe ativa de todos e adiciona no clicado
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentCategory = btn.getAttribute('data-filter') || 'all';
            filterProjects();
        });
    });

    // ------------------------------------------------------------------------
    // TOAST / NOTIFICAÇÃO TEMPORÁRIA
    // ------------------------------------------------------------------------
    window.showToast = function(message) {
        let toast = document.getElementById('toastNotice');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toastNotice';
            toast.className = 'toast-notice';
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3200);
    };

    // ------------------------------------------------------------------------
    // INTERAÇÃO EXTRA: LOG NO CONSOLE PARA DESENVOLVEDORES / RECRUTADORES
    // ------------------------------------------------------------------------
    console.log(
        '%c⚙️ Mads Portfolio & Lab %c| Bem-vindo ao dashboard de Guilherme Madeira!',
        'background: #5c2d82; color: #faeecf; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
        'color: #c59828; font-weight: bold;'
    );
    console.log('GitHub: https://github.com/Miniharmer | LinkedIn: https://linkedin.com/in/miniharmer');
});

