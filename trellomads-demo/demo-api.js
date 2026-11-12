const chaveEstado = "trellomads.demo.state.v3";

function estadoInicial() {
    return {
        quadros: [{ id_quadro: "1", nome_quadro: "Fluxo de trabalho" }],
        colunas: [
            { id_coluna: "101", id_quadro: "1", nome_coluna: "A fazer", coluna_ordem: "1" },
            { id_coluna: "102", id_quadro: "1", nome_coluna: "Em andamento", coluna_ordem: "2" },
            { id_coluna: "103", id_quadro: "1", nome_coluna: "ConcluÃ­do", coluna_ordem: "3" }
        ],
        cards: [
            { id_card: "201", id_coluna: "101", titulo_card: "Planejar a prÃ³xima entrega", descricao_card: "Reunir os prÃ³ximos passos e definir prioridades.", card_ordem: "1" },
            { id_card: "202", id_coluna: "101", titulo_card: "Anotar novas sugestÃµes", descricao_card: "", card_ordem: "2" },
            { id_card: "203", id_coluna: "102", titulo_card: "Revisar a pÃ¡gina inicial", descricao_card: "Conferir a hierarquia visual e os textos.", card_ordem: "1" },
            { id_card: "204", id_coluna: "103", titulo_card: "Preparar o quadro de exemplo", descricao_card: "", card_ordem: "1" }
        ],
        etiquetas: [
            { id_etiqueta: "1", nome_etiqueta: "Etiqueta 1", cor_etiqueta: "#d94f70" },
            { id_etiqueta: "2", nome_etiqueta: "Etiqueta 2", cor_etiqueta: "#e89a35" },
            { id_etiqueta: "3", nome_etiqueta: "Etiqueta 3", cor_etiqueta: "#38a887" },
            { id_etiqueta: "4", nome_etiqueta: "Etiqueta 4", cor_etiqueta: "#4979d1" },
            { id_etiqueta: "5", nome_etiqueta: "Etiqueta 5", cor_etiqueta: "#8a60bf" }
        ],
        etiquetasCards: [
            { id_card: "201", id_etiqueta: "4" },
            { id_card: "203", id_etiqueta: "1" },
            { id_card: "203", id_etiqueta: "3" },
            { id_card: "204", id_etiqueta: "2" }
        ],
        checklists: [
            {
                id_checklist: "301",
                id_card: "203",
                nome_checklist: "PreparaÃ§Ã£o",
                campos: [
                    { id_campo_checklist: "401", nome_check: "Revisar o conteÃºdo", check: "1" },
                    { id_campo_checklist: "402", nome_check: "Conferir a versÃ£o mobile", check: "0" }
                ]
            }
        ],
        comentarios: [],
        logs: [],
        ingressos: [{ id_usuario: "demo-user", nome_usuario: "Pessoa de demonstraÃ§Ã£o", avatar_img: "" }],
        contador: 1000
    };
}

function carregarEstado() {
    try {
        const salvo = sessionStorage.getItem(chaveEstado);
        return salvo ? JSON.parse(salvo) : estadoInicial();
    } catch (erro) {
        console.warn("Estado de demonstraÃ§Ã£o invÃ¡lido; iniciando dados de exemplo.", erro);
        return estadoInicial();
    }
}

const dados = carregarEstado();

if (!sessionStorage.getItem("trellomads_demo_user_id")) {
    sessionStorage.setItem("trellomads_demo_user_id", "demo-user");
}
if (!sessionStorage.getItem("trellomads_demo_board_id")) {
    sessionStorage.setItem("trellomads_demo_board_id", "1");
}
if (!sessionStorage.getItem("trellomads_demo_board_name")) {
    sessionStorage.setItem("trellomads_demo_board_name", "Fluxo de trabalho");
}

function salvarEstado() {
    sessionStorage.setItem(chaveEstado, JSON.stringify(dados));
}

function novoId(tipo) {
    dados.contador += 1;
    return String(dados.contador);
}

function itemCard(id) {
    return dados.cards.find(card => String(card.id_card) === String(id));
}

function etiquetasAtivas(idCard) {
    return dados.etiquetasCards
        .filter(associacao => String(associacao.id_card) === String(idCard))
        .map(associacao => associacao.id_etiqueta);
}

function dadosEtiquetaCard(idCard) {
    return dados.etiquetas.map(etiqueta => {
        const ativa = etiquetasAtivas(idCard).includes(etiqueta.id_etiqueta);
        return {
            ...etiqueta,
            id_card: ativa ? idCard : "",
            flag_ativo: ativa ? "True" : "False"
        };
    });
}

function response(valor = {}) {
    return new Response(JSON.stringify(valor), {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" }
    });
}

function atualizarOrdemCards(lista) {
    if (!Array.isArray(lista)) return;
    for (const item of lista.slice(1)) {
        const card = itemCard(item.id_card);
        if (!card) continue;
        if (item.id_coluna !== undefined) card.id_coluna = String(item.id_coluna);
        if (item.ordem !== undefined) card.card_ordem = String(item.ordem);
        if (item.card_ordem !== undefined) card.card_ordem = String(item.card_ordem);
    }
}

function simularEndpoint(path, corpo) {
    const rota = path.split("/").pop();

    switch (rota) {
        case "lista_quadros.asp":
            return dados.quadros;
        case "grupo.asp":
            return { id_grupo: "demo-group", nome_grupo: "DemonstraÃ§Ã£o" };
        case "avatar.asp":
            return { avatar_img: "" };
        case "lista_colunas.asp":
            return dados.colunas
                .slice()
                .sort((a, b) => Number(a.coluna_ordem) - Number(b.coluna_ordem));
        case "lista_cards.asp":
            return dados.cards
                .slice()
                .sort((a, b) => Number(a.card_ordem) - Number(b.card_ordem));
        case "lista_etiqueta_cards.asp":
            return dados.etiquetas.flatMap(etiqueta => {
                const associacoes = dados.etiquetasCards.filter(item => item.id_etiqueta === etiqueta.id_etiqueta);
                return associacoes.length
                    ? associacoes.map(item => ({ ...etiqueta, id_card: item.id_card, flag_ativo: "True" }))
                    : [{ ...etiqueta, id_card: "", flag_ativo: "False" }];
            });
        case "lista_ingressos_quadro.asp":
            return { ingressos: [], imagens: [] };
        case "lista_ingressos_cards.asp":
            return dados.ingressos;
        case "lista_card_completo.asp": {
            const card = itemCard(corpo.id_card);
            if (!card) return { erro: "CartÃ£o nÃ£o encontrado" };
            const checklists = dados.checklists
                .filter(item => String(item.id_card) === String(card.id_card))
                .map(item => ({
                    id_checklist: item.id_checklist,
                    nome_checklist: item.nome_checklist,
                    campos: item.campos.map(campo => ({
                        id_campo_checklist: campo.id_campo_checklist,
                        id_checklist: item.id_checklist,
                        nome_check: campo.nome_check,
                        check: campo.check
                    }))
                }));
            return {
                id_card: card.id_card,
                titulo_card: card.titulo_card,
                descricao_card: card.descricao_card,
                etiquetas: dadosEtiquetaCard(card.id_card),
                checklists
            };
        }
        case "lista_log_card.asp":
            return dados.logs.filter(log => String(log.id_card) === String(corpo.id_card));
        case "lista_descricao_card.asp": {
            const card = itemCard(corpo.id_card);
            return { descricao_card: card ? card.descricao_card : "" };
        }
        case "mencoes_notificacoes.asp":
            return [];
        case "ver_notificacao.asp":
        case "enviar_avatar.asp":
        case "alterar_senha.asp":
        case "edit_permissao_quadro.asp":
        case "remove_usuario_quadros.asp":
            return { sucesso: true };
        case "add_quadro.asp": {
            const quadro = { id_quadro: novoId("quadro"), nome_quadro: corpo.nome_quadro || "Novo quadro" };
            dados.quadros.push(quadro);
            salvarEstado();
            return quadro;
        }
        case "add_coluna.asp": {
            const coluna = {
                id_coluna: novoId("coluna"),
                id_quadro: corpo.id_quadro || "1",
                nome_coluna: corpo.nome_coluna || "Nova coluna",
                coluna_ordem: String(dados.colunas.length + 1)
            };
            dados.colunas.push(coluna);
            salvarEstado();
            return coluna;
        }
        case "edit_colunas.asp": {
            const coluna = dados.colunas.find(item => String(item.id_coluna) === String(corpo.id_coluna));
            if (coluna) coluna.nome_coluna = corpo.nome_coluna;
            salvarEstado();
            return { sucesso: true };
        }
        case "excluir_coluna.asp": {
            const id = String(corpo.id_coluna);
            const cardsRemovidos = dados.cards.filter(card => String(card.id_coluna) === id);
            const idsRemovidos = new Set(cardsRemovidos.map(card => String(card.id_card)));
            dados.colunas = dados.colunas.filter(coluna => String(coluna.id_coluna) !== id);
            dados.cards = dados.cards.filter(card => String(card.id_coluna) !== id);
            dados.etiquetasCards = dados.etiquetasCards.filter(item => !idsRemovidos.has(String(item.id_card)));
            salvarEstado();
            return { sucesso: true };
        }
        case "mover_colunas.asp":
            if (Array.isArray(corpo)) {
                for (const item of corpo.slice(1)) {
                    const coluna = dados.colunas.find(entry => String(entry.id_coluna) === String(item.id_coluna));
                    if (coluna) coluna.coluna_ordem = String(item.ordem);
                }
            }
            salvarEstado();
            return { sucesso: true };
        case "add_card.asp": {
            const card = {
                id_card: novoId("card"),
                id_coluna: String(corpo.id_coluna),
                titulo_card: corpo.titulo_card || "Novo cartÃ£o",
                descricao_card: corpo.descricao_card || "",
                card_ordem: String(dados.cards.filter(item => String(item.id_coluna) === String(corpo.id_coluna)).length + 1)
            };
            dados.cards.push(card);
            salvarEstado();
            return card;
        }
        case "mover_card.asp":
            atualizarOrdemCards(corpo);
            salvarEstado();
            return { sucesso: true };
        case "edit_lista_etiquetas.asp": {
            const lista = Array.isArray(corpo.etiquetas) ? corpo.etiquetas : [];
            dados.etiquetasCards = dados.etiquetasCards.filter(item => String(item.id_card) !== String(corpo.id_card));
            for (const item of lista) {
                if (item.flag_ativo === true || ["1", "True"].includes(String(item.flag_ativo))) {
                    dados.etiquetasCards.push({ id_card: corpo.id_card, id_etiqueta: item.id_etiqueta });
                }
            }
            salvarEstado();
            return { sucesso: true };
        }
        case "edit_card.asp": {
            const card = itemCard(corpo.id_card);
            if (card) {
                card.titulo_card = corpo.titulo_card;
                card.descricao_card = corpo.descricao_card;
            }
            salvarEstado();
            return { sucesso: true };
        }
        case "add_etiqueta_quadro.asp": {
            const etiqueta = {
                id_etiqueta: novoId("etiqueta"),
                nome_etiqueta: corpo.nome_etiqueta || "Nova etiqueta",
                cor_etiqueta: corpo.cor_etiqueta || "#4979d1"
            };
            dados.etiquetas.push(etiqueta);
            salvarEstado();
            return etiqueta;
        }
        case "excluir_card.asp": {
            const id = String(corpo.id_card);
            dados.cards = dados.cards.filter(card => String(card.id_card) !== id);
            dados.etiquetasCards = dados.etiquetasCards.filter(item => String(item.id_card) !== id);
            dados.checklists = dados.checklists.filter(item => String(item.id_card) !== id);
            dados.comentarios = dados.comentarios.filter(item => String(item.id_card) !== id);
            salvarEstado();
            return { sucesso: true };
        }
        case "remove_etiqueta_quadro.asp":
            dados.etiquetas = dados.etiquetas.filter(item => String(item.id_etiqueta) !== String(corpo.id_etiqueta));
            dados.etiquetasCards = dados.etiquetasCards.filter(item => String(item.id_etiqueta) !== String(corpo.id_etiqueta));
            salvarEstado();
            return { sucesso: true };
        case "ingressar_card.asp":
            return dados.ingressos;
        case "enviar_comentario.asp": {
            const comentario = {
                id_comentario: novoId("comentario"),
                id_card: corpo.id_card,
                comentario: corpo.comentario,
                nome_usuario: "Pessoa de demonstraÃ§Ã£o",
                dthr_comentario: new Date().toISOString()
            };
            dados.comentarios.push(comentario);
            salvarEstado();
            return comentario;
        }
        case "add_checklist.asp": {
            const checklist = {
                id_checklist: novoId("checklist"),
                id_card: corpo.id_card,
                nome_checklist: corpo.nome_checklist,
                campos: []
            };
            dados.checklists.push(checklist);
            salvarEstado();
            return checklist;
        }
        case "add_campos_checklist.asp": {
            const checklist = dados.checklists.find(item => String(item.id_checklist) === String(corpo.id_checklist));
            if (!checklist) return { sucesso: false };
            const campo = { id_campo_checklist: novoId("campo"), nome_check: corpo.nome_check, check: "0" };
            checklist.campos.push(campo);
            salvarEstado();
            return campo;
        }
        case "edit_campos_checklist.asp": {
            const campo = dados.checklists.flatMap(item => item.campos)
                .find(item => String(item.id_campo_checklist) === String(corpo.id_campo_checklist));
            if (campo) campo.nome_check = corpo.nome_check;
            salvarEstado();
            return { sucesso: true };
        }
        case "edit_checklist.asp": {
            const checklist = dados.checklists.find(item => String(item.id_checklist) === String(corpo.id_checklist));
            if (checklist) checklist.nome_checklist = corpo.nome_checklist;
            salvarEstado();
            return { sucesso: true };
        }
        case "excluir_campos_checklist.asp":
            for (const checklist of dados.checklists) {
                checklist.campos = checklist.campos.filter(item => String(item.id_campo_checklist) !== String(corpo.id_campo_checklist));
            }
            salvarEstado();
            return { sucesso: true };
        case "excluir_checklist.asp":
            dados.checklists = dados.checklists.filter(item => String(item.id_checklist) !== String(corpo.id_checklist));
            salvarEstado();
            return { sucesso: true };
        case "check_campo_checklist.asp": {
            const campo = dados.checklists.flatMap(item => item.campos)
                .find(item => String(item.id_campo_checklist) === String(corpo.id_campo_checklist));
            if (campo) campo.check = String(corpo.check);
            salvarEstado();
            return { sucesso: true };
        }
        case "lista_usuarios_quadro.asp":
            return [{ id_usuario: "demo-user", nome_usuario: "Pessoa de demonstraÃ§Ã£o", nome_grupo: "DemonstraÃ§Ã£o" }];
        case "lista_grupos.asp":
            return [{ id_grupo: "demo-group", nome_grupo: "DemonstraÃ§Ã£o" }];
        case "lista_usuarios_fora_quadro.asp":
            return [];
        case "add_usuario_sistema.asp":
        case "add_usuario_quadro.asp":
            return { sucesso: true };
        default:
            throw new Error(`Rota nÃ£o simulada na demonstraÃ§Ã£o: ${rota}`);
    }
}

window.fetch = async (recurso, opcoes = {}) => {
    const endereco = typeof recurso === "string" ? recurso : recurso.url;
    const rota = new URL(endereco, window.location.href).pathname;

    if (!rota.includes("/api/endpoints/")) {
        throw new Error(`A demonstraÃ§Ã£o bloqueou uma tentativa de acesso externo: ${rota}`);
    }

    let corpo = {};
    if (opcoes.body) {
        try {
            corpo = JSON.parse(opcoes.body);
        } catch (erro) {
            throw new Error(`Corpo invÃ¡lido na rota simulada ${rota}: ${erro.message}`);
        }
    }

    return response(simularEndpoint(rota, corpo));
};

