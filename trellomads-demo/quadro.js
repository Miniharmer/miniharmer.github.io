// import { createElement } from "react";
import * as baseHtml from "./base_html.js"

let temporizadorQuadro

document.addEventListener("DOMContentLoaded", async function () {
    loadingScreen();

    await baseHtml.gerarQuadro();

    const [
        colunas,
        cards,
        etiquetas,
        ingressosQuadro
    ] = await Promise.all([
        gerarColunas(),
        gerarCards(),
        gerarEtiquetas(),
        listarIngressosQuadro()
    ]);
    // const ingressosQuadro = []


    await montarQuadro(colunas, cards, etiquetas, ingressosQuadro);

    await funcionalidades();
    await funcionalidadesGlobais();
    setNomeQuadro();
    comTempoIrmao();

    EndloadingScreen();
});



let cardArrastando = null;
let colunaOrigem = null;
let ordemColunaOrigem = null;
let colunaArrastando = null


let atualizandoQuadro = false;

let operacaoUsuario = false;

function semTempoIrmao() {

    clearInterval(temporizadorQuadro);

}


function comTempoIrmao() {

    temporizadorQuadro = setInterval(atualizarQuadro, 20000);

}

async function atualizarQuadro() {

    if (atualizandoQuadro || operacaoUsuario) {
        return;
    }

    atualizandoQuadro = true;

    try {

        const CD = document.getElementById("corpoDashboard");

        const colunas = await gerarColunas();
        const cards = await gerarCards();
        const etiquetas = await gerarEtiquetas();

        const ingressosQuadro = await listarIngressosQuadro();
        // const ingressosQuadro = [];

        // Verifica novamente porque o usuÃ¡rio
        // pode ter comeÃ§ado uma operaÃ§Ã£o enquanto
        // as requisiÃ§Ãµes estavam acontecendo.
        if (!operacaoUsuario) {

            await montarQuadro(colunas, cards, etiquetas, ingressosQuadro);
            await funcionalidades();
        }

    } catch (erro) {
        console.error("Erro ao atualizar quadro:", erro);

    } finally {
        atualizandoQuadro = false;
    }
}

function loadingScreen() {
    const fundoLS = document.getElementById("fundoLS");

    fundoLS.style.display = "flex";

    fundoLS.classList.remove("opacidade0");
    fundoLS.classList.add("opacidade1");
}


function EndloadingScreen() {
    const fundoLS = document.getElementById("fundoLS");

    fundoLS.classList.remove("opacidade1");
    fundoLS.classList.add("opacidade0");

    setTimeout(() => {
        fundoLS.style.display = "none";
    }, 300);
}

function loadingSmScreen() {
    const fundoLS = document.getElementById("smfundoLS");

    fundoLS.style.display = "flex";

    fundoLS.classList.remove("opacidade0");
    fundoLS.classList.add("opacidade1");
}


function EndloadingSmScreen() {
    const fundoLS = document.getElementById("smfundoLS");

    fundoLS.classList.remove("opacidade1");
    fundoLS.classList.add("opacidade0");

    setTimeout(() => {
        fundoLS.style.display = "none";
    }, 300);
}

function setNomeQuadro() {
    const nomeQuadro = sessionStorage.getItem("trellomads_demo_board_name")
    document.title = nomeQuadro
}

async function funcionalidadesGlobais() {
    let contextMenuOpen = false

    document.addEventListener("contextmenu", (rbc) => {
        rbc.preventDefault();
        operacaoUsuario = true
        if (contextMenuOpen === true) {
            const menuAnterior = document.getElementById("context-menu");
            menuAnterior.remove()
            contextMenuOpen = false
            operacaoUsuario = false
            return
        }
        const cElement = rbc.target;

        if (cElement.closest(".etqDivGeral")) {

            const divgeral = cElement.closest(".etqDivGeral")
            const idEtiqueta = divgeral.dataset.id_etiqueta;

            const menuEditEtq = document.createElement("div");
            menuEditEtq.id = "context-menu"
            menuEditEtq.style = `border-radius: 5px; display:flex;  justify-content: center; background-color: #303030;   z-index: 1001; position: fixed; left: ${rbc.clientX}px; top: ${rbc.clientY}px`;
            menuEditEtq.classList.add("modalBase")

            document.body.appendChild(menuEditEtq);
            contextMenuOpen = true;

            const mEEContent = document.createElement("div");
            mEEContent.style = `padding: 10px`
            mEEContent.innerHTML = `
                <div  style="width: 100%; justify-content: center; display: grid">
                    <button style="margin-bottom: 10px" id="excluir-etiqueta" class="botaoSimplesVermelho">Excluir etiqueta</button>
                </div>
            `
            menuEditEtq.appendChild(mEEContent);

            const btnExcluirEtiqueta = menuEditEtq.querySelector("#excluir-etiqueta");
            btnExcluirEtiqueta.addEventListener("click", async () => {
                await excluirEtiqueta(idEtiqueta);
                menuEditEtq.remove();
                divgeral.remove();
                contextMenuOpen = false
                operacaoUsuario = false

            });
            const btnEditarEtiqueta = menuEditEtq.querySelector("#editar-etiqueta");
            btnEditarEtiqueta.addEventListener("click", async () => {
                await editarEtiqueta(idEtiqueta);
                menuEditEtq.remove();
                divgeral.remove();
                contextMenuOpen = false
                operacaoUsuario = false

            });




        }

    })



    const notification = document.getElementById("notificationImg");

    notification.addEventListener("click", abrirNotificacoes);
}


async function funcionalidades() {




    // const btnAddQuadro = document.getElementById("buttonAddHeader");
    // btnAddQuadro.addEventListener("click", async () => {
    //     try {
    //         const API = await fetch("api/endpoints/quadros/add_")

    //     } catch (err) {

    //     }
    // })

    const containerContent = document.getElementById("container-content");
    containerContent.addEventListener("dragover", (e) => {
        e.preventDefault();

        if (!colunaArrastando) {
            return;
        }
        if (cardArrastando) return;

        const container = e.currentTarget
        if (container) {
            let referencia = null;
            containerContent.querySelectorAll(".colunaTitulo").forEach(colunas => {
                if (colunas === colunaArrastando) {
                    return;
                }
                const colRect = colunas.getBoundingClientRect();
                const colCenterX = colRect.left + colRect.width / 2;

                if (e.clientX < colCenterX && referencia === null) {
                    referencia = colunas.closest(".colunaDiv");
                }
            })
            if (referencia) {

                container.insertBefore(colunaArrastando, referencia);

            } else {

                containerContent.append(colunaArrastando)

            }
        }
    })
    const colunaDivs = document.querySelectorAll(".colunaTitulo");
    colunaDivs.forEach(coluna => {
        coluna.addEventListener("dragstart", (e) => {
            const divBtnAddColuna = document.getElementById("divBtnAddColuna");
            divBtnAddColuna.style.display = `none`
            operacaoUsuario = true
            colunaArrastando = coluna.closest(".colunaDiv");
            ordemColunaOrigem = colunaArrastando.dataset.coluna_ordem;

            colunaArrastando.classList.add("card-arrastando");

            setTimeout(() => {
                colunaArrastando.classList.add("card-placeholder");
            }, 0);

        })
    })
    colunaDivs.forEach(coluna => {
        coluna.addEventListener("dragend", async (e) => {
            operacaoUsuario = false
            colunaArrastando = null;
            const colDiv = coluna.closest(".colunaDiv");
            colDiv.classList.remove("card-placeholder");
            colDiv.classList.remove("card-arrastando");

            const ordemColunas = await atualizarOrdemColuna();
            await enviarColunasAtualizadas(ordemColunas);
            const divBtnAddColuna = document.getElementById("divBtnAddColuna")
            containerContent.appendChild(divBtnAddColuna)
            divBtnAddColuna.style.display = "flex"

        })
    })

    const colunaCardContent = document.querySelectorAll(".colunaCardContent");
    colunaCardContent.forEach(cardContent => {
        cardContent.addEventListener("dragover", (e) => {

            e.preventDefault();
            if (colunaArrastando) return;

            if (!cardArrastando) {
                return;
            }
            const coluna = e.currentTarget
            if (coluna) {
                let referenciaCard = null;

                coluna.querySelectorAll(".cardDiv").forEach(card => {
                    if (card === cardArrastando) {
                        return;
                    }


                    const cardRect = card.getBoundingClientRect();
                    const cardCenterY = cardRect.top + cardRect.height / 2;

                    if (e.clientY < cardCenterY && referenciaCard === null) {
                        referenciaCard = card;
                    }
                })
                if (referenciaCard) {

                    coluna.insertBefore(cardArrastando, referenciaCard);

                } else {

                    coluna.append(cardArrastando);

                }
            }
        })


    })
    const cardDivs = document.querySelectorAll(".cardDiv");

    cardDivs.forEach(cardDiv => {
        cardDiv.addEventListener("dragstart", () => {
            operacaoUsuario = true
            cardArrastando = cardDiv;

            colunaOrigem = cardDiv.closest(".colunaDiv");
            cardDiv.classList.add("card-arrastando");

            setTimeout(() => {
                cardDiv.classList.add("card-placeholder");
            }, 0);
        })
    })
    cardDivs.forEach(async cardDiv => {
        cardDiv.addEventListener("dragend", async () => {
            operacaoUsuario = false
            cardArrastando = null;
            cardDiv.classList.remove("card-placeholder");
            cardDiv.classList.remove("card-arrastando");



            let dadosjson = atualizarColuna(colunaOrigem, cardDiv.closest(".colunaDiv"), cardDiv.dataset.id_card);

            await enviarCardsAtualizados(dadosjson);


        });
    });
    aplicarArrastarTela();
    await puxarNotificacao();



}
let notificacoes = []

async function puxarNotificacao() {

    const notificationDiv = document.getElementById("notificationDiv");

    try {

        const API = await fetch("../api/endpoints/quadros/mencoes_notificacoes.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id")
            })
        });

        notificacoes = [];

        if (API.ok) {
            notificacoes = await API.json();
        }

        const bolinhaExistente = notificationDiv.querySelector(".notificationBolinha");


        if (notificacoes.length > 0) {

            if (!bolinhaExistente) {

                const bolinha = document.createElement("div");
                bolinha.textContent = `${notificacoes.length}`

                bolinha.classList.add("notificationBolinha");

                bolinha.style.position = "absolute";
                bolinha.style.width = "20px";
                bolinha.style.height = "20px";
                bolinha.style.borderRadius = "50%";
                bolinha.style.backgroundColor = "red";
                bolinha.style.top = "-3px";
                bolinha.style.right = "-3px";
                bolinha.style.justifyContent = "center"
                bolinha.style.color = "white"
                bolinha.style.display = "flex"
                bolinha.style.alignItems = "flex"

                notificationDiv.append(bolinha);
            }
            if (bolinhaExistente) {
                bolinhaExistente.textContent = `${notificacoes.length}`
            }

        } else {

            if (bolinhaExistente) {
                bolinhaExistente.remove();
            }

        }

    } catch (err) {

        console.error(err);
        notificacoes = [];

    }

}

function abrirNotificacoes() {

    const notification = document.getElementById("notificationImg");
    const notificationDiv = document.getElementById("notificationDiv");

    const modalExistente = notificationDiv.querySelector(".modalBase");

    if (modalExistente) {
        modalExistente.remove();
        return;
    }

    const modal = document.createElement("div");

    modal.classList.add("modalBase");

    modal.style.position = "absolute";
    modal.style.right = "0";
    modal.style.top = "100%";
    modal.style.width = "200px";
    modal.style.maxHeight = "400px";
    modal.style.overflowY = "auto";
    modal.style.zIndex = "9999";

    if (!notificacoes || notificacoes.length === 0) {

        const semNotificacao = document.createElement("div");

        semNotificacao.textContent = "NÃ£o hÃ¡ notificaÃ§Ãµes";
        semNotificacao.style = "color:white";

        modal.append(semNotificacao);

    } else {

        for (const notificacao of notificacoes) {

            const notificacaoDiv = document.createElement("div");

            notificacaoDiv.style = `
                border-radius: 6px;
                cursor: pointer;
                padding: 5px;
                width: 100%;
                max-width: 100%;
                min-width: 0;
                box-sizing: border-box;
            `;

            const texto = document.createElement("span");

            texto.style = `
                color: white;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 3;
                overflow: hidden;
                overflow-wrap: anywhere;
                min-width: 0;
                max-width: 100%;
            `;

            texto.textContent =
                `${notificacao.nome_usuario} te marcou neste Card: ${notificacao.titulo_card}`;

            notificacaoDiv.append(texto);

            notificacaoDiv.addEventListener("mouseenter", () => {
                notificacaoDiv.style.backgroundColor = "#303030";
            });

            notificacaoDiv.addEventListener("mouseleave", () => {
                notificacaoDiv.style.backgroundColor = "";
            });

            notificacaoDiv.addEventListener("click", async () => {

                modal.remove();

                try {

                    await fetch("../api/endpoints/quadros/ver_notificacao.asp", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            "id_mencao": notificacao.id_mencao,
                            "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                            "id_quadro": sessionStorage.getItem("trellomads_demo_board_id")
                        })
                    });

                } catch (err) {
                    console.error(err);
                }

                // Atualiza a lista e a bolinha
                await puxarNotificacao();

                await modalCard(notificacao.id_card);

            });

            modal.append(notificacaoDiv);
        }
    }

    notificationDiv.append(modal);
}

// async function puxarNotificacao() {

//     const notification = document.getElementById("notificationImg");
//     const notificationDiv = document.getElementById("notificationDiv");


//     try {

//         const API = await fetch("../api/endpoints/quadros/mencoes_notificacoes.asp", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({
//                 "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
//                 "id_quadro": sessionStorage.getItem("trellomads_demo_board_id")
//             })
//         });

//         let notificacoes = [];

//         if (API.ok) {
//             notificacoes = await API.json();
//         }

//         // notificationDiv.replaceChildren();

//         const sino = notification;

//         sino.addEventListener("click", () => {

//             const modalExistente = notificationDiv.querySelector(".modalBase");

//             if (modalExistente) {
//                 modalExistente.remove();
//                 return;
//             }

//             const modal = document.createElement("div");
//             modal.classList.add("modalBase");

//             modal.style.position = "absolute";
//             modal.style.right = "0";
//             modal.style.top = "100%";
//             modal.style.width = "200px";
//             modal.style.maxHeight = "400px";
//             modal.style.overflowY = "auto";
//             modal.style.zIndex = "9999";


//             if (!notificacoes || notificacoes.length === 0) {

//                 const semNotificacao = document.createElement("div");

//                 semNotificacao.textContent = "NÃ£o hÃ¡ notificaÃ§Ãµes";
//                 semNotificacao.style = "color:white"

//                 modal.append(semNotificacao);

//             } else {

//                 for (const notificacao of notificacoes) {

//                     const notificacaoDiv = document.createElement("div");
//                     notificacaoDiv.style = `
//     border-radius: 6px;
//     cursor: pointer;
//     padding: 5px;
//     width: 100%;
//     max-width: 100%;
//     min-width: 0;
//     box-sizing: border-box;
// `;

//                     const texto = document.createElement("span");
//                     texto.style = `
//     color: white;
//     display: -webkit-box;
//     -webkit-box-orient: vertical;
//     -webkit-line-clamp: 3;
//     overflow: hidden;
//     overflow-wrap: anywhere;
//     min-width: 0;
//     max-width: 100%;
// `;

//                     texto.textContent =
//                         `${notificacao.nome_usuario} te marcou neste Card: ${notificacao.titulo_card}`;

//                     notificacaoDiv.append(texto);

//                     notificacaoDiv.addEventListener("mouseenter", () => {
//                         notificacaoDiv.style.backgroundColor = "#303030";
//                     });

//                     notificacaoDiv.addEventListener("mouseleave", () => {
//                         notificacaoDiv.style.backgroundColor = "";
//                     });

//                     notificacaoDiv.addEventListener("click", async () => {

//                         modal.remove();

//                         try {

//                             await fetch("../api/endpoints/quadros/ver_notificacao.asp", {
//                                 method: "POST",
//                                 headers: {
//                                     "Content-Type": "application/json"
//                                 },
//                                 body: JSON.stringify({
//                                     "id_mencao": notificacao.id_mencao,
//                                     "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
//                                     "id_quadro": sessionStorage.getItem("trellomads_demo_board_id")
//                                 })
//                             });

//                         } catch (err) {
//                             console.error(err);
//                         }

//                         await modalCard(notificacao.id_card);

//                     });

//                     modal.append(notificacaoDiv);
//                 }
//             }

//             notificationDiv.append(modal);
//         });

//         // Se houver notificaÃ§Ãµes, mostra a bolinha
//         if (notificacoes.length > 0) {

//             const bolinhaExistente = notificationDiv.querySelector(".notificationBolinha");

//             if (!bolinhaExistente) {

//                 const bolinha = document.createElement("div");

//                 bolinha.classList.add("notificationBolinha");

//                 bolinha.style.position = "absolute";
//                 bolinha.style.width = "8px";
//                 bolinha.style.height = "8px";
//                 bolinha.style.borderRadius = "50%";
//                 bolinha.style.backgroundColor = "red";
//                 bolinha.style.top = "-3px";
//                 bolinha.style.right = "-3px";

//                 notificationDiv.append(bolinha);
//             }
//         }

//     } catch (err) {

//         console.error(err);

//     }

// }


function aplicarArrastarTela() {

    const container = document.getElementById("container-content");

    let arrastandoTela = false;
    let mouseInicialX = 0;
    let scrollInicial = 0;

    // Controle do auto-scroll
    let mouseX = 0;
    let autoScrollAtivo = false;
    let animationFrame = null;

    const zonaScroll = 180; // distÃ¢ncia da borda para comeÃ§ar a mover
    const velocidadeMaxima = 15;

    function autoScroll() {

        if (!autoScrollAtivo || !cardArrastando) {
            animationFrame = null;
            return;
        }

        const larguraTela = window.innerWidth;

        // Perto da borda esquerda
        if (mouseX < zonaScroll) {

            const distancia = zonaScroll - mouseX;

            // Quanto mais perto da borda, mais rÃ¡pido
            const velocidade =
                Math.min(
                    velocidadeMaxima,
                    (distancia / zonaScroll) * velocidadeMaxima
                );

            container.scrollLeft -= velocidade;
        }

        // Perto da borda direita
        else if (mouseX > larguraTela - zonaScroll) {

            const distancia = mouseX - (larguraTela - zonaScroll);

            const velocidade =
                Math.min(
                    velocidadeMaxima,
                    (distancia / zonaScroll) * velocidadeMaxima
                );

            container.scrollLeft += velocidade;
        }

        animationFrame = requestAnimationFrame(autoScroll);
    }


    container.addEventListener("mousedown", (e) => {

        document.body.classList.add("dragandoTela");

        // BotÃ£o esquerdo apenas
        if (e.button !== 0) return;

        // Se jÃ¡ estÃ¡ arrastando algo, ignora
        if (cardArrastando || colunaArrastando) return;

        // NÃ£o inicia o scroll se clicou em elementos interativos
        if (
            e.target.closest(".cardDiv") ||
            e.target.closest(".colunaTitulo") ||
            e.target.closest(".botaoAddCard") ||
            e.target.closest("input") ||
            e.target.closest("textarea") ||
            e.target.closest("button") ||
            e.target.closest(".naoArrastar")
        ) {
            return;
        }

        arrastandoTela = true;

        mouseInicialX = e.pageX;
        scrollInicial = container.scrollLeft;

        container.classList.add("arrastandoTela");
    });


    document.addEventListener("mousemove", (e) => {

        // Scroll manual da tela
        if (arrastandoTela) {

            const distancia = e.pageX - mouseInicialX;

            container.scrollLeft = scrollInicial - distancia;
        }

    });


    // Guarda a posiÃ§Ã£o do mouse durante o drag nativo
    document.addEventListener("dragover", (e) => {

        if (!cardArrastando && !colunaArrastando) {
            return;
        }

        e.preventDefault();

        mouseX = e.clientX;

        if (!autoScrollAtivo) {

            autoScrollAtivo = true;

            if (!animationFrame) {
                animationFrame = requestAnimationFrame(autoScroll);
            }
        }

    });


    document.addEventListener("dragend", () => {

        autoScrollAtivo = false;

        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }

    });


    document.addEventListener("mouseup", () => {

        document.body.classList.remove("dragandoTela");

        if (!arrastandoTela) return;

        arrastandoTela = false;

        container.classList.remove("arrastandoTela");
    });


    // Caso o mouse saia da janela
    document.addEventListener("mouseleave", () => {

        arrastandoTela = false;

        autoScrollAtivo = false;

        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }

        container.classList.remove("arrastandoTela");
    });
}


// function aplicarArrastarTela() {

//     const container = document.getElementById("container-content");

//     let arrastandoTela = false;
//     let mouseInicialX = 0;
//     let scrollInicial = 0;

//     container.addEventListener("mousedown", (e) => {
//         document.body.classList.add("dragandoTela");

//         // BotÃ£o esquerdo apenas
//         if (e.button !== 0) return;

//         // Se jÃ¡ estÃ¡ arrastando algo, ignora
//         if (cardArrastando || colunaArrastando) return;

//         // NÃ£o inicia o scroll se clicou em elementos interativos
//         if (
//             e.target.closest(".cardDiv") ||
//             e.target.closest(".colunaTitulo") ||
//             e.target.closest(".botaoAddCard") ||
//             e.target.closest("input") ||
//             e.target.closest("textarea") ||
//             e.target.closest("button") ||
//             e.target.closest(".naoArrastar")
//         ) {
//             return;
//         }

//         arrastandoTela = true;

//         mouseInicialX = e.pageX;
//         scrollInicial = container.scrollLeft;

//         container.classList.add("arrastandoTela");
//     });

//     document.addEventListener("mousemove", (e) => {

//         if (!arrastandoTela) return;

//         const distancia = e.pageX - mouseInicialX;

//         container.scrollLeft = scrollInicial - distancia;
//     });

//     document.addEventListener("mouseup", () => {
//         document.body.classList.remove("dragandoTela");
//         if (!arrastandoTela) return;

//         arrastandoTela = false;

//         container.classList.remove("arrastandoTela");

//     });

//     // Caso o mouse saia da janela
//     document.addEventListener("mouseleave", () => {

//         arrastandoTela = false;

//         container.classList.remove("arrastandoTela");

//     });

// }

async function gerarColunas() {
    try {
        const API = await fetch("/api/endpoints/colunas/lista_colunas.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id")
            })
        })

        const APIresponse = await API.json()

        if (API.ok) {

            return APIresponse;

        }
        if (!API.ok) {
            console.warn(APIresponse)
            return APIresponse;
        }
    } catch (err) {
        console.warn(err)
    }

}

async function gerarCards() {

    try {
        const APIcard = await fetch("/api/endpoints/cards/lista_cards.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                // "id_coluna": item.id_coluna
            })
        })
        const APIresponseCards = await APIcard.json();

        if (APIcard.ok) {

            return APIresponseCards;




        }
        if (!APIcard.ok) {
            console.warn(APIresponseCards)
        }
    } catch (err) {
        console.warn(err);
    }
}

async function gerarEtiquetas() {
    try {
        const API = await fetch("/api/endpoints/cards/lista_etiqueta_cards.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id")
            })
        })

        const APIresponse = await API.json()

        if (API.ok) {

            return APIresponse;

        }
        if (!API.ok) {
            console.warn(APIresponse)
        }
    } catch (err) {
        console.warn(err)
    }

}


async function montarQuadro(colunas, cards, etiquetas, ingressosQuadro) {

    let scrollAntigo


    const cc = document.getElementById("container-content");
    if (cc) {
        scrollAntigo = cc.scrollLeft;
        cc.remove()
    }



    const containerContent = document.createElement("div");
    containerContent.id = "container-content";

    const containerColunas = document.getElementById("container-coluna");


    containerColunas.appendChild(containerContent);

    document.getElementById("main-content").appendChild(corpoDashboard);

    // Percorre todas as colunas

    if (colunas.length > 0) {
        for (const coluna of colunas) {

            // ===== CRIA A COLUNA =====

            const colunaDiv = document.createElement("div");
            colunaDiv.classList.add("colunaDiv");
            colunaDiv.dataset.id_coluna = coluna.id_coluna;
            colunaDiv.dataset.coluna_ordem = coluna.coluna_ordem;


            const colunaHeader = document.createElement("div");
            colunaHeader.classList.add("colunaHeader");
            const colunaTitulo = document.createElement("div");
            colunaTitulo.classList.add("colunaTitulo");
            colunaTitulo.textContent = coluna.nome_coluna;
            colunaTitulo.draggable = true;
            colunaTitulo.title = coluna.nome_coluna;


            const tresPontosColuna = document.createElement("div");
            tresPontosColuna.classList.add("tresPontosDiv");
            const imgTresPontos = document.createElement("img");
            imgTresPontos.src = "/assets/icons/sliders-solid-full.svg";
            imgTresPontos.title = "Mais opÃ§Ãµes";
            imgTresPontos.width = 16;
            imgTresPontos.height = 16;
            imgTresPontos.style.cursor = "pointer";
            tresPontosColuna.appendChild(imgTresPontos);

            tresPontosColuna.classList.add("tresPontosColuna");

            let menuTPOpen = false
            let menuMoreOptColuna = null;
            tresPontosColuna.addEventListener("click", (e) => {
                e.stopPropagation


                if (menuTPOpen === true) {
                    menuMoreOptColuna.remove()
                    menuTPOpen = false
                    return
                }

                menuMoreOptColuna = document.createElement("div");
                menuMoreOptColuna.classList.add("menuMoreOptColuna");

                tresPontosColuna.appendChild(menuMoreOptColuna)
                const divOptMore = document.createElement("div");
                const btnCancelarColuna = document.createElement("button");
                btnCancelarColuna.classList.add("btnCancelarColuna");
                btnCancelarColuna.textContent = `X`;

                btnCancelarColuna.addEventListener("click", async () => {

                    criarModalConfirma("Deseja excluir essa coluna?", "Confirmar", "Cancelar")

                    const btnConfirmModalFunction = document.getElementById("btnConfirmModalFunction")
                    const btnCancelModalFunction = document.getElementById("btnCancelModalFunction")

                    btnConfirmModalFunction.addEventListener("click", async () => {
                        const idColuna = colunaDiv.dataset.id_coluna;
                        await excluirColuna(idColuna);
                        colunaDiv.remove();
                        const modalBgFunction = document.getElementById("modalBgFunction")
                        modalBgFunction.remove();
                    })

                    btnCancelModalFunction.addEventListener("click", () => {
                        const modalBgFunction = document.getElementById("modalBgFunction")
                        modalBgFunction.remove();
                    })


                })

                menuMoreOptColuna.appendChild(divOptMore);
                divOptMore.appendChild(btnCancelarColuna);

                menuTPOpen = true
            })


            colunaHeader.appendChild(colunaTitulo);
            colunaHeader.appendChild(tresPontosColuna);
            colunaDiv.appendChild(colunaHeader);

            colunaTitulo.addEventListener("dblclick", async () => {
                const inputNewTitle = document.createElement("input");
                inputNewTitle.value = colunaTitulo.textContent;
                inputNewTitle.style = `background-color: #303030; color: white; outline: 2px solid #505050; border: none; font-size: 20px`
                colunaHeader.replaceChild(inputNewTitle, colunaTitulo);

                inputNewTitle.addEventListener("keydown", async (ik) => {
                    if (ik.key === "Enter") {
                        await editaColuna(coluna.id_coluna, inputNewTitle.value);
                        colunaTitulo.textContent = inputNewTitle.value;
                        colunaHeader.replaceChild(colunaTitulo, inputNewTitle);

                    }
                })

            })


            const colunaCardContent = document.createElement("div");
            colunaCardContent.classList.add("colunaCardContent");

            const colunaFooter = document.createElement("div");
            colunaFooter.classList.add("colunaFooter");

            colunaDiv.appendChild(colunaHeader);
            colunaDiv.appendChild(colunaCardContent);
            colunaDiv.appendChild(colunaFooter);

            containerContent.appendChild(colunaDiv);




            // ===== PEGA SOMENTE OS CARDS DESSA COLUNA =====
            if (cards.length > 0) {
                const cardsDaColuna = cards.filter(card => {

                    return Number(card.id_coluna) === Number(coluna.id_coluna);

                });


                // ===== CRIA OS CARDS =====

                for (const card of cardsDaColuna) {

                    const cardDiv = document.createElement("div");
                    cardDiv.classList.add("cardDiv");
                    cardDiv.dataset.id_card = card.id_card;
                    cardDiv.draggable = true;

                    const cardInfoDiv = document.createElement("div");
                    const numberTicket = document.createElement("div");

                    cardInfoDiv.appendChild(numberTicket)
                    // cardInfoDiv.style = "color:white; justify-content: right; display:flex; background-color: #202020; border-radius: 10px 10px 0 0"
                    cardInfoDiv.classList.add("cardInfoDiv")
                    numberTicket.textContent = "#" + card.id_card
                    numberTicket.classList.add("numberTicket")
                    // numberTicket.style = "background-color: #202020; padding:5px; border-radius: 5px; font-style: italic "

                    const cardTitulo = document.createElement("div");
                    cardTitulo.classList.add("cardTitulo");
                    cardTitulo.textContent = card.titulo_card;

                    const divEtiquetaContainer = document.createElement("div");
                    divEtiquetaContainer.classList.add("divEtiquetaContainer");

                    cardDiv.appendChild(cardInfoDiv)
                    cardDiv.appendChild(divEtiquetaContainer);
                    cardDiv.appendChild(cardTitulo);

                    const cardDescricao = document.createElement("div");
                    const carinhadiv = document.createElement("div");
                    carinhadiv.style = "display:flex; gap: 5px"
                    cardDescricao.classList.add("divCardDescricao");

                    if (card.descricao_card && card.descricao_card.trim() !== "") {

                        const imgDescricao = document.createElement("img");
                        imgDescricao.src = "/assets/icons/list-solid-full.svg";
                        imgDescricao.alt = "DescriÃ§Ã£o";
                        imgDescricao.width = 20;
                        imgDescricao.height = 20;
                        imgDescricao.classList.add("imgDescricao");


                        // cardDescricao.textContent = card.descricao_card;

                        cardDescricao.appendChild(imgDescricao);
                    }


                    // console.log(ingressosQuadro);

                    if (ingressosQuadro) {
                        // console.log(ingressosQuadro);
                        // return

                        const ingressosCard = ingressosQuadro.ingressos.filter(ic => {
                            return Number(ic.id_card) === Number(card.id_card);
                        })

                        for (const ingressado of ingressosCard) {
                            const carinha = document.createElement("div")


                            const carinhaImg = document.createElement("img");

                            const imagensCard = ingressosQuadro.imagens.find(ic => {
                                return Number(ic.id_usuario) === Number(ingressado.id_usuario);
                            })
                            // console.log(imagensCard)

                            if (imagensCard.avatar_img) {
                                carinhaImg.src = `data:image/jpeg;base64,${imagensCard.avatar_img}`;
                            } else {
                                carinhaImg.src = "/assets/icons/circle-user.svg"
                            }
                            carinhaImg.style = `width: 100%; height: 100%; display: block;object-fit: cover`;
                            carinha.appendChild(carinhaImg)

                            carinha.style = `overflow:hidden;width: 40px; height: 40px; border-radius: 50%; cursor: pointer; background-color: var(--azul-claro);`;
                            carinha.title = ingressado.nome_usuario;
                            // if (ingressado.id_usuario === sessionStorage.getItem("trellomads_demo_user_id")) {
                            //     carinha.style.backgroundColor = "green";
                            // }

                            carinhadiv.appendChild(carinha)
                        }
                        cardDescricao.appendChild(carinhadiv)

                    }


                    cardDiv.appendChild(cardDescricao);
                    // cardDiv.appendChild(cardInfoDiv);

                    colunaCardContent.appendChild(cardDiv);





                    // ===== PEGA AS ETIQUETAS DE CADA CARD =====
                    const etiquetaDoCard = etiquetas.filter(etiqueta => {


                        return Number(etiqueta.id_card) === Number(card.id_card) && (Number(etiqueta.flag_ativo) === 1 || etiqueta.flag_ativo === "True");

                    });

                    if (etiquetaDoCard.length > 0) {

                        for (const etiqueta of etiquetaDoCard) {

                            const divEtiqueta = document.createElement("div");
                            divEtiqueta.classList.add("divEtiqueta");

                            divEtiqueta.style.backgroundColor = etiqueta.cor_etiqueta;
                            divEtiqueta.textContent = etiqueta.nome_etiqueta;

                            divEtiquetaContainer.appendChild(divEtiqueta);
                        }


                    }

                    cardDiv.addEventListener("click", async () => {
                        // loadingScreen();
                        await modalCard(card.id_card);
                        // EndloadingScreen();
                    });




                }
            }
            // ===== BOTÃƒO ADICIONAR CARD =====

            const botaoAddCard = document.createElement("button");
            botaoAddCard.classList.add("botaoAddCard");
            botaoAddCard.textContent = "+ Adicionar Card";

            colunaFooter.appendChild(botaoAddCard);

            botaoAddCard.addEventListener("click", () => {
                operacaoUsuario = true;
                const divEtiquetaContainer = document.createElement("div");
                divEtiquetaContainer.classList.add("divEtiquetaContainer");

                const cardInfoDiv = document.createElement("div");
                const numberTicket = document.createElement("div");

                cardInfoDiv.appendChild(numberTicket)
                cardInfoDiv.classList.add("cardInfoDiv")
                // numberTicket.textContent = "#" + card.id_card
                numberTicket.classList.add("numberTicket")

                const novoCardDiv = document.createElement("div");
                novoCardDiv.classList.add("cardDiv");
                novoCardDiv.draggable = true;

                let cardTitulo = document.createElement("div");
                cardTitulo.classList.add("cardTitulo");
                const inputCard = document.createElement("input");
                cardTitulo.appendChild(inputCard);
                inputCard.type = "text";
                inputCard.placeholder = "Digite o tÃ­tulo do card";
                inputCard.style = `background-color: transparent; border: none; color: white; outline: none;`
                colunaCardContent.appendChild(novoCardDiv);

                novoCardDiv.appendChild(cardInfoDiv)
                novoCardDiv.appendChild(divEtiquetaContainer);
                novoCardDiv.appendChild(cardTitulo);

                inputCard.focus();
                inputCard.addEventListener("keypress", async (event) => {
                    if (event.key === "Enter") {
                        if (inputCard.value.trim() === "") {
                            novoCardDiv.remove();
                            operacaoUsuario = false;
                            return;
                        }

                        cardTitulo.textContent = inputCard.value.trim();
                        const idColuna = novoCardDiv.closest(".colunaDiv").dataset.id_coluna;


                        const nomeNovoCard = cardTitulo.textContent;
                        // console.log("ID COLUNA:", nomeNovoCard);
                        // return
                        const dadosNovoCard = await inserirCard(idColuna, nomeNovoCard)



                        novoCardDiv.dataset.id_card = dadosNovoCard.id_card;
                        numberTicket.textContent = "#" + dadosNovoCard.id_card


                        const colunaPai = novoCardDiv.closest(".colunaDiv");
                        await aplicarDDCards();
                        await atualizarQuadro();
                        // const dadosAtualizados = atualizaOrdemCards(colunaPai);
                        // await enviarCardsAtualizados(dadosAtualizados);


                        inputCard.remove();
                        operacaoUsuario = false;
                        novoCardDiv.addEventListener("click", async () => {
                            await modalCard(novoCardDiv.dataset.id_card);
                        });
                    }
                })

            })
            let temporizador
            colunaCardContent.addEventListener('scroll', () => {
                if (operacaoUsuario === true) {
                    clearTimeout(temporizador)
                    return
                } else {
                    operacaoUsuario = true
                    semTempoIrmao();
                    console.log("sem tempo")

                }
            });
            colunaCardContent.addEventListener("scrollend", () => {
                temporizador = setTimeout(() => {
                    operacaoUsuario = false
                    comTempoIrmao();
                    console.log("comtepo")
                }, 20000)
            })




        }
    }


    const divBtnAddColuna = document.createElement("div");
    divBtnAddColuna.id = "divBtnAddColuna";
    const btnAddColuna = document.createElement("button");
    divBtnAddColuna.appendChild(btnAddColuna);
    containerContent.appendChild(divBtnAddColuna);
    btnAddColuna.id = "btnAddColuna";
    btnAddColuna.textContent = "+ Adicionar Coluna";
    btnAddColuna.addEventListener("click", () => {
        operacaoUsuario = true;
        // LÃ³gica para adicionar nova coluna
        const novaColunaDiv = document.createElement("div");
        novaColunaDiv.classList.add("colunaDiv");
        const colunaHeader = document.createElement("div");
        colunaHeader.classList.add("colunaHeader");
        const novaColunaTitulo = document.createElement("div");
        novaColunaTitulo.classList.add("colunaTitulo");
        novaColunaTitulo.draggable = true;
        const inputColuna = document.createElement("input");
        inputColuna.type = "text";
        inputColuna.placeholder = "Digite o nome da coluna";
        inputColuna.style = `background-color: #303030; color: white; outline: 2px solid #505050; border: none; font-size: 20px`
        colunaHeader.appendChild(novaColunaTitulo)
        novaColunaTitulo.appendChild(inputColuna);
        containerContent.insertBefore(novaColunaDiv, divBtnAddColuna);

        const NovaColunaCardContent = document.createElement("div");
        NovaColunaCardContent.classList.add("colunaCardContent");

        const novaColunaFooter = document.createElement("div");
        novaColunaFooter.classList.add("colunaFooter");

        const novoBotaoAddCard = document.createElement("button");
        novoBotaoAddCard.classList.add("botaoAddCard");
        novoBotaoAddCard.textContent = "+ Adicionar Card";
        novaColunaFooter.appendChild(novoBotaoAddCard);

        novaColunaDiv.appendChild(colunaHeader);
        novaColunaDiv.appendChild(NovaColunaCardContent);
        novaColunaDiv.appendChild(novaColunaFooter);
        inputColuna.focus();

        inputColuna.addEventListener("keypress", async (event) => {
            if (event.key === "Enter") {
                if (inputColuna.value.trim() === "") {
                    novaColunaDiv.remove();
                    operacaoUsuario = false;
                    return;
                }
                novaColunaTitulo.textContent = inputColuna.value.trim();
                const nomeNovaColuna = novaColunaTitulo.textContent;

                const dadosNovaColuna = await inserirColuna(nomeNovaColuna);

                novaColunaDiv.dataset.id_coluna = dadosNovaColuna.id_coluna;
                inputColuna.remove();
                await aplicarDDColunas();


                novoBotaoAddCard.addEventListener("click", () => {
                    operacaoUsuario = true;
                    const divEtiquetaContainer = document.createElement("div");
                    divEtiquetaContainer.classList.add("divEtiquetaContainer");


                    const novoCardDiv = document.createElement("div");
                    novoCardDiv.classList.add("cardDiv");
                    novoCardDiv.draggable = true;
                    let cardTitulo = document.createElement("div");
                    cardTitulo.classList.add("cardTitulo");
                    const inputCard = document.createElement("input");
                    cardTitulo.appendChild(inputCard);
                    inputCard.type = "text";
                    inputCard.placeholder = "Digite o tÃ­tulo do card";
                    inputCard.style = `background-color: transparent; border: none; color: white; outline: none;`
                    NovaColunaCardContent.appendChild(novoCardDiv);
                    novoCardDiv.appendChild(divEtiquetaContainer);
                    novoCardDiv.appendChild(cardTitulo);

                    inputCard.focus();
                    inputCard.addEventListener("keypress", async (event) => {
                        if (event.key === "Enter") {
                            if (inputCard.value.trim() === "") {
                                novoCardDiv.remove();
                                return;
                            }

                            cardTitulo.textContent = inputCard.value.trim();
                            const idColuna = novoCardDiv.closest(".colunaDiv").dataset.id_coluna;


                            const nomeNovoCard = cardTitulo.textContent;
                            // console.log("ID COLUNA:", nomeNovoCard);
                            // return
                            const dadosNovoCard = await inserirCard(idColuna, nomeNovoCard)


                            novoCardDiv.dataset.id_card = dadosNovoCard.id_card;

                            const colunaPai = novoCardDiv.closest(".colunaDiv");

                            await aplicarDDCards();


                            // const dadosAtualizados = atualizaOrdemCards(colunaPai);
                            // await enviarCardsAtualizados(dadosAtualizados);


                            inputCard.remove();
                            operacaoUsuario = false;
                            novoCardDiv.addEventListener("click", async () => {


                                await modalCard(novoCardDiv.dataset.id_card);
                            });

                        }
                    })
                    operacaoUsuario = false;

                })

            }
        });

    }


    );
    if (scrollAntigo > 0) {
        containerContent.scrollLeft = scrollAntigo;
    }

}



async function inserirColuna(nomeNovaColuna) {
    try {
        const API = await fetch("/api/endpoints/colunas/add_coluna.asp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                "nome_coluna": nomeNovaColuna
            })
        });
        if (!API.ok) {
            const APIresponse = await API.json();
            console.warn(APIresponse);
            return;
        }
        const APIresponse = await API.json();
        return APIresponse;
    } catch (err) {
        console.warn(err);
    }
}

async function inserirCard(idColuna, nomeNovoCard) {

    try {
        const API = await fetch("/api/endpoints/cards/add_card.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                "id_coluna": idColuna,
                "titulo_card": nomeNovoCard,
                "descricao_card": ""
            })
        });
        const APIresponse = await API.json();

        if (API.ok) {
            return APIresponse;
        }
        if (!API.ok) {
            console.warn(APIresponse);
            return
        }
    } catch (err) {
        console.warn(err);
    }
}

function atualizaOrdemCards(colunaPai) {
    const json = [];
    json.push({
        id_usuario: sessionStorage.getItem("trellomads_demo_user_id"),
        id_quadro: sessionStorage.getItem("trellomads_demo_board_id"),
    });
    coluna1.querySelectorAll(".cardDiv").forEach((card, indice) => {

        json.push({

            id_card: card.dataset.id_card,

            id_coluna: colunaPai.dataset.id_coluna,

            ordem: indice + 1

        });

    });


}

function atualizarColuna(coluna1, coluna2, prota) {

    const json = [];
    json.push({
        id_usuario: sessionStorage.getItem("trellomads_demo_user_id"),
        id_quadro: sessionStorage.getItem("trellomads_demo_board_id"),
        coluna_1: coluna1.dataset.id_coluna,
        coluna_2: coluna2.dataset.id_coluna,
        id_card_prota: prota
    });
    coluna1.querySelectorAll(".cardDiv").forEach((card, indice) => {

        json.push({

            id_card: card.dataset.id_card,

            id_coluna: coluna1.dataset.id_coluna,

            ordem: indice + 1

        });

    });

    coluna2.querySelectorAll(".cardDiv").forEach((card, indice) => {

        json.push({

            id_card: card.dataset.id_card,

            id_coluna: coluna2.dataset.id_coluna,

            ordem: indice + 1

        });

    });

    // console.log(json)

    return json;

}

async function enviarCardsAtualizados(dadosjson) {
    // console.log(JSON.stringify(dadosjson));
    // return

    try {
        const API = await fetch("/api/endpoints/cards/mover_card.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosjson)
        });

        if (!API.ok) {
            const APIresponse = await API.json();
            console.warn(APIresponse);
        }
        if (API.ok) {
            const APIresponse = await API.json();
            // console.log("toma: ", APIresponse);
        }
    } catch (err) {
        console.warn(err);
    }
}

async function atualizarOrdemColuna() {

    const json = [];
    json.push({
        id_usuario: sessionStorage.getItem("trellomads_demo_user_id"),
        id_quadro: sessionStorage.getItem("trellomads_demo_board_id"),
    });

    const containerContent = document.getElementById("container-content");
    containerContent.querySelectorAll(".colunaDiv").forEach((coluna, indice) => {

        json.push({

            id_coluna: coluna.dataset.id_coluna,
            ordem: indice + 1
        });

    });

    return json
}

async function enviarColunasAtualizadas(dadosjson) {

    try {
        const API = await fetch("/api/endpoints/colunas/mover_colunas.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosjson)
        });

        if (!API.ok) {
            const APIresponse = await API.json();
            console.warn(APIresponse);
        }
    } catch (err) {
        console.warn(err);
    }
}

async function aplicarDDCards() {



    const colunaCardContent = document.querySelectorAll(".colunaCardContent");
    colunaCardContent.forEach(cardContent => {
        cardContent.addEventListener("dragover", (e) => {

            e.preventDefault();
            if (colunaArrastando) return;

            if (!cardArrastando) {
                return;
            }
            const coluna = e.currentTarget
            if (coluna) {
                let referenciaCard = null;

                coluna.querySelectorAll(".cardDiv").forEach(card => {
                    if (card === cardArrastando) {
                        return;
                    }


                    const cardRect = card.getBoundingClientRect();
                    const cardCenterY = cardRect.top + cardRect.height / 2;

                    if (e.clientY < cardCenterY && referenciaCard === null) {
                        referenciaCard = card;
                    }
                })
                if (referenciaCard) {

                    coluna.insertBefore(cardArrastando, referenciaCard);

                } else {

                    coluna.append(cardArrastando);

                }
            }
        })

    })





    const cardDivs = document.querySelectorAll(".cardDiv");

    cardDivs.forEach(cardDiv => {
        cardDiv.addEventListener("dragstart", () => {
            operacaoUsuario = true
            // console.log("card");
            cardArrastando = cardDiv;
            colunaOrigem = cardDiv.closest(".colunaDiv");
            cardDiv.classList.add("card-arrastando");

            setTimeout(() => {
                cardDiv.classList.add("card-placeholder");
            }, 0);
        })
    })
    cardDivs.forEach(async cardDiv => {
        cardDiv.addEventListener("dragend", async () => {
            operacaoUsuario = false
            cardArrastando = null;
            cardDiv.classList.remove("card-placeholder");
            cardDiv.classList.remove("card-arrastando");
            let dadosjson = (colunaOrigem, cardDiv.closest(".colunaDiv"));

            await enviarCardsAtualizados(dadosjson);

        });
    });

}


async function aplicarDDColunas() {
    const containerContent = document.getElementById("container-content");
    containerContent.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (!colunaArrastando) {
            return;
        }
        if (cardArrastando) return;

        const container = e.currentTarget
        if (container) {
            let referencia = null;
            containerContent.querySelectorAll(".colunaTitulo").forEach(colunas => {
                if (colunas === colunaArrastando) {
                    return;
                }
                const colRect = colunas.getBoundingClientRect();
                const colCenterX = colRect.left + colRect.width / 2;

                if (e.clientX < colCenterX && referencia === null) {
                    referencia = colunas.closest(".colunaDiv");
                }
            })
            if (referencia) {

                container.insertBefore(colunaArrastando, referencia);

            } else {

                containerContent.append(colunaArrastando)

            }
        }
    })
    const colunaDivs = document.querySelectorAll(".colunaTitulo");
    colunaDivs.forEach(coluna => {
        coluna.addEventListener("dragstart", (e) => {
            operacaoUsuario = true
            colunaArrastando = coluna.closest(".colunaDiv");
            ordemColunaOrigem = colunaArrastando.dataset.coluna_ordem;
            coluna.classList.add("card-arrastando");

            setTimeout(() => {
                coluna.classList.add("card-placeholder");
            }, 0);
            // console.log("COLUNA");
        })
    })
    colunaDivs.forEach(coluna => {
        coluna.addEventListener("dragend", async (e) => {
            operacaoUsuario = false
            colunaArrastando = null;
            const colDiv = coluna.closest(".colunaDiv");
            colDiv.classList.remove("card-placeholder");
            colDiv.classList.remove("card-arrastando");

            const ordemColunas = await atualizarOrdemColuna();
            await enviarColunasAtualizadas(ordemColunas);

        })
    })
    const colunaCardContent = document.querySelectorAll("colunaCardContent")
    for (const coluna of colunaCardContent) {
        coluna.addEventListener("scroll", () => {
            operacaoUsuario = true
        })
        coluna.addEventListener("scrollend", () => {
            operacaoUsuario = false
        })
    }

}



async function modalCard(id_card) {
    // console.log(JSON.stringify({
    //             "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
    //             "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
    //             "id_card": id_card
    //         }))
    //         return
    // loadingScreen();
    // console.log("ANTES DO LOADING");
    loadingSmScreen();
    // console.log("DEPOIS DO LOADING");
    // loadingScreen();

    await new Promise(resolve => setTimeout(resolve, 100));


    try {
        const API = await fetch("/api/endpoints/cards/lista_card_completo.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                "id_card": id_card
            })
        })
        const APIresponse = await API.json()

        const IngressosCard = await listarIngressos(id_card);

        // console.log(IngressosCard);




        if (API.ok) {

            // console.log(APIresponse.titulo_card)

            const divModalCardContainer = document.createElement("div");
            divModalCardContainer.classList.add("divModalCardContainer");
            const divModalCard = document.createElement("div");
            divModalCard.classList.add("divModalCard");
            const modalCardContentContainer = document.createElement("div");
            modalCardContentContainer.classList.add("modalCardContentContainer");


            const modalCardHeader = document.createElement("div");
            modalCardHeader.classList.add("modalCardHeader");
            const botaoPrimario = document.createElement("div");
            botaoPrimario.classList.add("faixaInfosPrimarias")
            const fecharModal = document.createElement("button");
            const idTicketDiv = document.createElement("div")
            idTicketDiv.classList.add("numberModalTicket")
            idTicketDiv.textContent = "#" + id_card
            idTicketDiv.title = "ID do Card"
            botaoPrimario.appendChild(idTicketDiv)
            botaoPrimario.appendChild(fecharModal)
            fecharModal.textContent = `X`
            fecharModal.style = `background-color: #E50914; border: none; padding: 5px 10px; color: white; border-radius: 3px; cursor: pointer`
            fecharModal.addEventListener("click", () => {
                loadingScreen();
                const mED = document.querySelector(".menuEtqDiv");
                if (mED){
                    mED.remove();
                }
                divModalCardContainer.remove();
                atualizarQuadro();
                EndloadingScreen();
            })

            const modalCardTitulo = document.createElement("textarea")


            modalCardTitulo.addEventListener('keydown', async function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault(); // Impede o Enter e o Shift + Enter de criarem nova linha
                    modalCardTitulo.blur()
                    modalCardTitulo.style.backgroundColor = "transparent"
                    await editaCard(id_card, modalCardTitulo.value, modalDescricao.textContent)
                }
            });
            modalCardTitulo.classList.add("modalCardTitulo");
            modalCardTitulo.value = APIresponse.titulo_card;

            const modalButtonLine = document.createElement("div");
            modalButtonLine.classList.add("modalButtonLine");

            const divInfoLine = document.createElement("div");
            divInfoLine.style = `width: 200px;  display: flex; justify-content: center; align-content: center`
            // divInfoLine.classList.add("modalButtonLine")

            const ingressarCard = document.createElement("button");

            const moverCard = document.createElement("button");
            moverCard.textContent = "Mover Card";
            moverCard.classList.add("botaoSimples")
            moverCard.title = "Mover Card"




            ingressarCard.textContent = `Ingressar`
            ingressarCard.classList.add("botaoSimplesVerde");
            ingressarCard.title = "Excluir Card"

            if (Array.isArray(IngressosCard)) {
                montarCarinhasModal(IngressosCard, divInfoLine)

                const carinhaUsuario = IngressosCard.some(li => {
                    return li.id_usuario === sessionStorage.getItem("trellomads_demo_user_id")
                })

                if (carinhaUsuario) {
                    ingressarCard.textContent = `Sair`
                    ingressarCard.classList.remove("botaoSimples");
                    ingressarCard.classList.add("botaoSimplesVermelho");
                    ingressarCard.title = "Sair do Card"
                }
            }

            const checklistBtn = document.createElement("button")

            checklistBtn.textContent = `+ Checklist`
            checklistBtn.classList.add("botaoSimplesVerde");
            checklistBtn.title = "Checklist"




            checklistBtn.addEventListener("click", () => {

                const divCheck = document.createElement("div");
                divCheck.classList.add("checklistDiv");

                const inputNameCheck = document.createElement("input");
                inputNameCheck.classList.add("inputSimples");
                inputNameCheck.type = "text";
                inputNameCheck.placeholder = "Nome do Checklist";

                divCheck.appendChild(inputNameCheck);
                modalDescricaoDiv.appendChild(divCheck);

                inputNameCheck.focus();

                let checklistCriando = false;

                async function confirmarChecklist() {

                    if (checklistCriando) return;

                    const nomeChecklist = inputNameCheck.value.trim();

                    if (!nomeChecklist) {
                        divCheck.remove();
                        return;
                    }

                    checklistCriando = true;

                    try {

                        const apichecklist = await criarChecklist(id_card, nomeChecklist);
                        const idChecklist = apichecklist.id_checklist;

                        if (!idChecklist) {
                            checklistCriando = false;
                            return;
                        }

                        divCheck.dataset.id_checklist = idChecklist;

                        const respIdCampo = await criarCampoChecklist(
                            idChecklist,
                            "Tarefa"
                        );

                        const idCampo = respIdCampo.id_campo_checklist;

                        if (!idCampo) {
                            checklistCriando = false;
                            return;
                        }

                        inputNameCheck.remove();

                        // Entrega o checklist para a funÃ§Ã£o compartilhada
                        montarChecklist(
                            divCheck,
                            idChecklist,
                            nomeChecklist,
                            [{
                                id_campo_checklist: idCampo,
                                texto: "Tarefa",
                                nomeSalvo: "Tarefa",
                                concluida: false
                            }]
                        );

                        document.removeEventListener("click", cliqueFora);

                    } catch (erro) {

                        console.error("Erro ao criar checklist:", erro);
                        checklistCriando = false;
                    }
                }


                inputNameCheck.addEventListener("keydown", (e) => {

                    if (e.key === "Enter") {
                        e.preventDefault();
                        document.removeEventListener("click", cliqueFora);
                        confirmarChecklist();
                    }

                    if (e.key === "Escape") {
                        document.removeEventListener("click", cliqueFora);
                        divCheck.remove();
                    }
                });


                function cliqueFora(ev) {

                    if (ev.target === checklistBtn) return;
                    if (divCheck.contains(ev.target)) return;

                    document.removeEventListener("click", cliqueFora);

                    if (inputNameCheck.value.trim() === "") {
                        divCheck.remove();
                    } else {
                        confirmarChecklist();
                    }
                }


                setTimeout(() => {
                    document.addEventListener("click", cliqueFora);
                }, 0);

            });






            modalCardHeader.appendChild(botaoPrimario);
            modalCardHeader.appendChild(modalCardTitulo);
            modalCardHeader.appendChild(modalButtonLine);

            const divButtonLine = document.createElement("div");
            divButtonLine.style = `width: 500px;  display: flex; justify-content: center; align-content: center; gap: 10px`
            const cancelarCard = document.createElement("button");
            cancelarCard.textContent = `Excluir Card`
            cancelarCard.classList.add("botaoSimplesVermelho")
            // cancelarCard.style = `background-color: #E50914; color: white; border-radius: 3px; border: none; width: 30px; height: 30px; font-weight: bold; cursor: pointer `
            cancelarCard.title = "Excluir Card"

            divButtonLine.appendChild(cancelarCard);
            divButtonLine.appendChild(moverCard);
            divButtonLine.appendChild(ingressarCard);
            divButtonLine.appendChild(checklistBtn);

            cancelarCard.addEventListener("click", async () => {


                const modalConfirm = document.createElement('div');
                modalConfirm.classList.add("modalConfirmBack")
                const mainContent = document.getElementById("main-content")
                const modalContent = document.createElement("div");
                const botoesModal = document.createElement("div");
                const textoModal = document.createElement("div");
                const botaoModalConfirm = document.createElement("button");
                const botaoModalCancel = document.createElement("button");
                modalConfirm.appendChild(modalContent);
                modalContent.appendChild(textoModal);
                botoesModal.appendChild(botaoModalConfirm);
                botoesModal.appendChild(botaoModalCancel);
                modalContent.appendChild(botoesModal)

                botoesModal.style = `display: flex; height: 40px`
                modalContent.style = `background-color: #505050; display: grid; justify-content: center;  color: white; height: 100px`
                textoModal.style = `padding: 20px; color: white; display: flex; align-items: center; font-size: 18px`;
                textoModal.textContent = "VocÃª deseja realmente cancelar este card?"
                botaoModalConfirm.style = `padding: 10px 5px; background-color: #E50914; border: none; color: white; flex: 1; font-size: 18px`
                botaoModalCancel.style = `padding: 10px 5px; background-color: #707070; border: none; color: white; flex: 1; font-size: 18px`
                botaoModalConfirm.textContent = "Confirmar"
                botaoModalCancel.textContent = "Retornar"

                mainContent.appendChild(modalConfirm)

                botaoModalConfirm.addEventListener("click", async () => {
                    await cancelaCard(id_card);
                    const cardDash = document.querySelector(`.cardDiv[data-id_card="${id_card}"]`)
                    cardDash.remove()
                    modalConfirm.remove();
                    divModalCardContainer.remove();
                })
                botaoModalCancel.addEventListener("click", () => {
                    modalConfirm.remove();
                })



            })

            ingressarCard.addEventListener("click", async () => {
                const ingressarAPI = await ingressarCardF(id_card);
                const listaIn = await listarIngressos(id_card);
                // console.log(listaIn)
                divInfoLine.innerHTML = ""
                if (Array.isArray(listaIn)) {

                    montarCarinhasModal(listaIn, divInfoLine);

                    const carinhaUsuario = listaIn.some(li => {
                        return String(li.id_usuario) === String(sessionStorage.getItem("trellomads_demo_user_id"))
                    })

                    if (carinhaUsuario) {
                        ingressarCard.textContent = `Sair`
                        ingressarCard.classList.remove("botaoSimples");
                        ingressarCard.classList.add("botaoSimplesVermelho");
                        ingressarCard.title = "Sair do Card"

                    }
                } else {
                    ingressarCard.textContent = `Ingressar`
                    ingressarCard.classList.remove("botaoSimplesVermelho");
                    ingressarCard.classList.add("botaoSimples");
                    ingressarCard.title = "Ingressar no Card"

                    // } else{

                    //     alert("Erro ao listar membros ingressados no Card")
                }




            })

            let mcMenu = false
            moverCard.style = `position:relative`



            moverCard.addEventListener("click", async (mc) => {


                if (mcMenu === true) {

                    const mvMB = moverCard.querySelector(".modalBase")
                    mvMB.remove();
                    mcMenu = false
                    return




                }

                document.addEventListener("click", function clickForaMoveCard(ads) {
                    if (!moverCard.contains(ads.target) && mcMenu === true) {

                        document.removeEventListener("click", clickForaMoveCard)
                        const mvMB = moverCard.querySelector(".modalBase")
                        mvMB.remove();
                        mcMenu = false
                    }
                })




                const colunas = await gerarColunas();

                const modalBase = document.createElement("div")

                const mBTitle = document.createElement("div")
                mBTitle.textContent = `Selecione o destino do Card`
                mBTitle.style = `color:white; margin-bottom: 10px; display:flex; justify-content:center`
                modalBase.classList.add("modalBase");
                modalBase.style = `position:absolute; width: max-content; gap:5px; justify-content:center`
                modalBase.appendChild(mBTitle)
                moverCard.appendChild(modalBase)
                modalBase.addEventListener("click", (mb) => {

                    mb.stopPropagation();

                })
                for (const colunaOpt of colunas) {
                    const divColGeral = document.createElement("div")
                    const divColName = document.createElement("div")
                    divColGeral.appendChild(divColName)
                    divColName.textContent = colunaOpt.nome_coluna
                    divColGeral.dataset.id_coluna = colunaOpt.id_coluna
                    divColGeral.classList.add("divColGeral");
                    divColGeral.addEventListener("click", async () => {

                        const cDiv = document.querySelector(`.cardDiv[data-id_card="${id_card}"]`)
                        const col1 = cDiv.closest(`.colunaDiv`);
                        const col2 = document.querySelector(`.colunaDiv[data-id_coluna="${colunaOpt.id_coluna}"]`);

                        const col2Cont = col2.querySelector(".colunaCardContent")

                        col2Cont.prepend(cDiv)

                        const json = atualizarColuna(col1, col2, id_card)
                        // console.log(json)
                        await enviarCardsAtualizados(json);




                    })
                    modalBase.appendChild(divColGeral)



                }
                mcMenu = true
            })



            modalButtonLine.appendChild(divButtonLine)
            modalButtonLine.appendChild(divInfoLine)

            const etiquetasDiv = document.createElement("div");
            etiquetasDiv.classList.add("etiquetasDiv");
            modalCardHeader.appendChild(etiquetasDiv);
            const botaoAddEtiq = document.createElement("button");
            botaoAddEtiq.classList.add("botaoAddEtiq");
            botaoAddEtiq.textContent = "+";
            etiquetasDiv.appendChild(botaoAddEtiq)

            if (APIresponse.etiquetas.length > 0) {
                // console.log(APIresponse.etiquetas)

                for (const etiquetaSel of APIresponse.etiquetas) {

                    const etqModal = document.createElement("div");
                    etqModal.dataset.id_etiqueta = etiquetaSel.id_etiqueta;
                    etqModal.dataset.flag_ativo = etiquetaSel.flag_ativo;
                    etqModal.textContent = etiquetaSel.nome_etiqueta;
                    etqModal.style.backgroundColor = etiquetaSel.cor_etiqueta;
                    etqModal.classList.add("etqModal");
                    if (etqModal.dataset.flag_ativo === "True") {
                        etiquetasDiv.appendChild(etqModal);
                    }
                }
            }

            // ========= BOTAO PARA ABRIR MENU DE ADD ETIQUETA
            let menuEtqAberto = false
            botaoAddEtiq.addEventListener("click", function botaoAddEtqF(e) {
                e.target

                let addEtqClicado = false


                if (menuEtqAberto === true) {
                    return
                }
                menuEtqAberto = true

                e.stopPropagation();

                const menuEtqDiv = document.createElement("div");
                menuEtqDiv.classList.add("menuEtqDiv");
                // menuEtqDiv.setAttribute("popover", "auto");

                const cabecaEtqMenu = document.createElement("div");
                const corpoEtqMenu = document.createElement("div");
                corpoEtqMenu.classList.add("corpoEtqMenu")

                const addEtqBtn = document.createElement("div");
                addEtqBtn.textContent = "+"
                addEtqBtn.classList.add("addEtqBtn")
                const btnFecharMenu = document.createElement("button");
                btnFecharMenu.textContent = "X";
                btnFecharMenu.classList.add("btnFecharMenu")

                cabecaEtqMenu.style = `display: flex; width: 100%; justify-content: space-between; margin-bottom: 10px; height: 50px`
                cabecaEtqMenu.appendChild(addEtqBtn)
                cabecaEtqMenu.appendChild(btnFecharMenu)
                menuEtqDiv.appendChild(cabecaEtqMenu);
                menuEtqDiv.appendChild(corpoEtqMenu);

                for (const etiquetaSel of APIresponse.etiquetas) {
                    const marcadorEtqDiv = document.createElement("div");
                    marcadorEtqDiv.classList.add("marcadorEtqDiv")

                    const etqDivGeral = document.createElement("div");
                    etqDivGeral.classList.add("etqDivGeral");
                    etqDivGeral.dataset.id_etiqueta = etiquetaSel.id_etiqueta
                    etqDivGeral.dataset.flag_ativo = etiquetaSel.flag_ativo

                    const etqSelOp = document.createElement("div");
                    etqSelOp.classList.add("etqSelOp");
                    etqSelOp.style.backgroundColor = etiquetaSel.cor_etiqueta;

                    const nameEtqSelOp = document.createElement("div");
                    nameEtqSelOp.textContent = etiquetaSel.nome_etiqueta;
                    nameEtqSelOp.classList.add("nameEtqSelOp");
                    nameEtqSelOp.title = etiquetaSel.nome_etiqueta;

                    etqSelOp.appendChild(nameEtqSelOp);
                    if (etqDivGeral.dataset.flag_ativo === "True") {
                        etqDivGeral.appendChild(marcadorEtqDiv)
                    }

                    etqDivGeral.appendChild(etqSelOp);


                    corpoEtqMenu.appendChild(etqDivGeral);

                    etqDivGeral.addEventListener("click", async (ev) => {
                        ev.stopPropagation();

                        if (etqDivGeral.dataset.flag_ativo === "True") {

                            removerEtqModal(etqDivGeral.dataset.id_etiqueta);


                            marcadorEtqDiv.remove();

                            etqDivGeral.dataset.flag_ativo = "False";

                            return;
                        }

                        await ExibirEtqModal(
                            etqDivGeral.dataset.id_etiqueta,
                            etqDivGeral.dataset.flag_ativo,
                            nameEtqSelOp.textContent,
                            etqSelOp.style.backgroundColor
                        );
                        //     const marcadorEtqDiv = document.createElement("div");
                        // marcadorEtqDiv.classList.add("marcadorEtqDiv")
                        etqDivGeral.insertBefore(marcadorEtqDiv, etqSelOp);

                        etqDivGeral.dataset.flag_ativo = "True";
                    });
                    let ctxMenu = false;
                    let ctxMenuInfo = null;

                    // etqDivGeral.addEventListener("contextmenu", (cm) => {
                    //     cm.preventDefault();
                    //     if (ctxMenu === true){
                    //         document.querySelector(".menuEtqDivGeral").remove();
                    //         ctxMenuInfo.remove();
                    //         ctxMenu = false
                    //         return
                    //     }

                    //     const menuEtqDivGeral = document.createElement("div")
                    //     ctxMenuInfo = menuEtqDivGeral;
                    //     menuEtqDivGeral.innerHTML = `
                    //     <div>
                    //     <div class="contextExEtq">Excluir Etiqueta</div>
                    //     </div>`
                    //     menuEtqDivGeral.classList.add("contextMenuDiv")
                    //     document.body.appendChild(menuEtqDivGeral)
                    //     menuEtqDivGeral.style = `left: ${cm.clientX}px; top: ${cm.clientY}px; z-index: 1001`
                    //     ctxMenu = true


                    // })
                }
                const posicao = botaoAddEtiq.getBoundingClientRect();

                menuEtqDiv.style.position = "fixed";
                menuEtqDiv.style.top = `${posicao.bottom + 5}px`;
                menuEtqDiv.style.left = `${posicao.left}px`;
                document.body.appendChild(menuEtqDiv);
                // botaoAddEtiq.appendChild(menuEtqDiv);

                btnFecharMenu.addEventListener("click", async (bf) => {
                    if (addEtqClicado === true) {
                        bf.stopPropagation();
                        menuEtqDiv.remove();
                        addEtqClicado = false
                        menuEtqAberto = false
                        divModalCardContainer.remove();
                        await modalCard(id_card);
                        return
                    }
                    menuEtqAberto = false
                    menuEtqDiv.remove();
                    bf.stopPropagation();
                    // console.log("cliquei")
                    const idCard = id_card
                    await atualizarDadosEtiquetasCard(idCard, etiquetasDiv, menuEtqDiv);
                    divModalCardContainer.remove();
                    await modalCard(id_card);
                });
                addEtqBtn.addEventListener("click", async (ab) => {
                    if (addEtqClicado === true) {
                        return
                    }
                    addEtqClicado = true
                    ab.stopPropagation()
                    const etqDivGeral = document.createElement("div");
                    etqDivGeral.classList.add("etqDivGeral");



                    const etqSelOp = document.createElement("div");
                    etqSelOp.classList.add("etqSelOp");

                    const nameEtqInput = document.createElement("input")
                    nameEtqInput.type = "text";
                    nameEtqInput.style = `color: white; background-color: transparent; border: none`
                    nameEtqInput.placeholder = "Insira o nome da etiqueta."

                    const colorPickerEtq = document.createElement("input");
                    colorPickerEtq.type = "color";
                    colorPickerEtq.style = `border-radius: 50%; background-color: transparent; border: none;`


                    etqDivGeral.appendChild(etqSelOp);
                    etqSelOp.appendChild(nameEtqInput);
                    etqSelOp.appendChild(colorPickerEtq)

                    nameEtqInput.focus()

                    async function confirmarCriacaoEtiqueta() {


                        if (nameEtqInput.value === "" || nameEtqInput.value === null || nameEtqInput === " ") {
                            etqDivGeral.remove();
                            addEtqClicado = false
                            return
                        }
                        const nameEtqSelOp = document.createElement("div");
                        nameEtqSelOp.textContent = nameEtqInput.value;
                        nameEtqSelOp.title = nameEtqInput.value;
                        nameEtqSelOp.classList.add("nameEtqSelOp");
                        etqSelOp.appendChild(nameEtqSelOp);

                        const novoIDEtiqueta = await addEtiqueta(nameEtqInput.value, colorPickerEtq.value)


                        etqDivGeral.dataset.id_etiqueta = novoIDEtiqueta.id_etiqueta;
                        etqDivGeral.dataset.flag_ativo = "False";
                        etqSelOp.style.backgroundColor = colorPickerEtq.value

                        nameEtqInput.remove()
                        colorPickerEtq.remove()

                        etqDivGeral.addEventListener("click", (ev) => {
                            ev.stopPropagation();
                            if (etqDivGeral.dataset.flag_ativo === "True") {

                                const marcadorDiv = etqDivGeral.querySelector(".marcadorEtqDiv")
                                marcadorDiv.remove();
                                removerEtqModal(etqDivGeral.dataset.id_etiqueta, id_card)


                                etqDivGeral.dataset.flag_ativo = "False"
                                return
                            } else {


                                const marcadorDiv2 = document.createElement("div")
                                marcadorDiv2.classList.add("marcadorEtqDiv");
                                etqDivGeral.insertBefore(marcadorDiv2, etqSelOp)
                                ExibirEtqModal(etqDivGeral.dataset.id_etiqueta, etqDivGeral.dataset.flag_ativo, nameEtqSelOp.textContent, etqSelOp.style.backgroundColor)

                            }
                            etqDivGeral.dataset.flag_ativo = "True";
                        });
                        addEtqClicado = false



                    }

                    nameEtqInput.addEventListener("keydown", async (kd) => {
                        if (kd.key === "Enter") {
                            await confirmarCriacaoEtiqueta();

                            document.removeEventListener("click", cliqueFora);

                        }

                    })

                    async function cliqueFora(ev) {

                        if (
                            !etqDivGeral.contains(ev.target) &&
                            !addEtqBtn.contains(ev.target)
                        ) {

                            await confirmarCriacaoEtiqueta();

                            document.removeEventListener("click", cliqueFora);
                        }
                    }

                    document.addEventListener("click", cliqueFora);


                    colorPickerEtq.addEventListener("input", (c) => {
                        etqSelOp.style.backgroundColor = colorPickerEtq.value;
                    })

                    etqSelOp.appendChild(nameEtqInput);
                    etqSelOp.appendChild(colorPickerEtq);
                    etqDivGeral.appendChild(etqSelOp);
                    corpoEtqMenu.appendChild(etqDivGeral)

                    menuEtqDiv.appendChild(corpoEtqMenu);




                })




            });

            const modalDescricaoDiv = document.createElement("div");
            modalDescricaoDiv.classList.add("modalDescricaoDiv");
            const modalDescricao = document.createElement("div");
            modalDescricao.classList.add("modalDescricao");
            const modalBodyContent = document.createElement("div");
            modalBodyContent.classList.add("modalBodyContent");


            const textDescricao = document.createElement("textarea")
            textDescricao.classList.add("textDescricao");

            if (APIresponse.descricao_card !== "" && APIresponse.descricao_card !== " ") {

                modalDescricao.textContent = `${APIresponse.descricao_card}`


            } else {
                modalDescricao.textContent = `Insira a descriÃ§Ã£o aqui`

            }

            modalDescricao.addEventListener("dblclick", async () => {

                loadingSmScreen();

                const descrC = await chamarDescricaoCard(id_card);
                // console.log(descrC);
                // return
                if (descrC.descricao_card === "" || descrC.descricao_card === " ") {

                    modalDescricao.textContent = ""
                    textDescricao.value = modalDescricao.textContent;


                } else {
                    textDescricao.value = descrC.descricao_card
                }


                EndloadingSmScreen()

                modalDescricaoDiv.replaceChild(textDescricao, modalDescricao);
                const botoesDescricao = document.createElement("div");
                botoesDescricao.style.marginTop = "10px";
                const botaoConfirma = document.createElement("button");
                botaoConfirma.classList.add("botaoConfirma");
                botaoConfirma.classList.add("botaoModal");
                botaoConfirma.innerHTML = "Salvar AlteraÃ§Ãµes";
                botaoConfirma.style.marginRight = "10px";
                const botaoCancela = document.createElement("button");
                botaoCancela.classList.add("botaoCancela");
                botaoCancela.classList.add("botaoModal");
                botaoCancela.innerHTML = "Cancelar"


                botoesDescricao.appendChild(botaoConfirma);
                botoesDescricao.appendChild(botaoCancela);
                // modalDescricaoDiv.appendChild(botoesDescricao)
                // modalDescricaoDiv.insertBefore(botoesDescricao, modalDescricao.nextSibling);
                modalDescricaoDiv.insertBefore(botoesDescricao, textDescricao.nextSibling);
                botaoCancela.addEventListener("click", () => {
                    modalDescricaoDiv.replaceChild(modalDescricao, textDescricao);
                    botoesDescricao.remove();

                })

                botaoConfirma.addEventListener("click", async () => {
                    modalDescricao.textContent = textDescricao.value
                    modalDescricaoDiv.replaceChild(modalDescricao, textDescricao);
                    botoesDescricao.remove()
                    await editaCard(id_card, modalCardTitulo.value, modalDescricao.textContent)

                })


            })
            async function comentariosDivF() {

                const comentariosDiv = document.createElement("div");

                comentariosDiv.classList.add("comentariosDiv");

                const comentariosContent = document.createElement("div");

                comentariosContent.classList.add("comentariosContent");

                const inputComDiv = document.createElement("div");

                inputComDiv.style = `width:100%; display:flex; flex-direction:column`

                const h3Com = document.createElement("h3")

                h3Com.textContent = "ComentÃ¡rio"

                h3Com.style = `color:white; `;

                const inputCom = document.createElement("input")

                inputCom.classList.add("inputSimples");

                inputCom.style = `position:relative; margin:0 10px 10px 10px; max-width: 100%`

                inputCom.placeholder = `Seu comentÃ¡rio...`

                let inputAnterior = "";

                let mencoes = []

                inputCom.addEventListener("input", async () => {

                    const inputAtual = inputCom.value;
                    const cursor = inputCom.selectionStart;

                    mencoes = mencoes.filter(mencao => {

                        return inputAtual.includes("@" + mencao.nome_usuario);

                    });
                    //                     console.log("Texto:", inputAtual);
                    // console.log("MenÃ§Ãµes:", mencoes);

                    // Texto que estÃ¡ antes do cursor
                    const textoAntesCursor = inputAtual.slice(0, cursor);

                    // Procura um @ que esteja iniciando uma menÃ§Ã£o
                    // Exemplos:
                    // "OlÃ¡ @"       -> pega
                    // "OlÃ¡ @gui"   -> pega
                    // "OlÃ¡ @gui "  -> nÃ£o pega
                    const match = textoAntesCursor.match(/(^|\s)@([^\s@]*)$/);

                    if (match) {

                        // Estamos dentro de uma menÃ§Ã£o
                        const textoBusca = match[2];

                        // console.log("MenÃ§Ã£o:", textoBusca);

                        // Cria a lista somente se ela ainda nÃ£o existir
                        let listaUsersDiv = inputComDiv.querySelector(".listaUsuarios");

                        if (!listaUsersDiv) {

                            listaUsersDiv = document.createElement("div");

                            listaUsersDiv.classList.add("modalBase");
                            listaUsersDiv.classList.add("listaUsuarios");

                            listaUsersDiv.innerHTML = `
                            <div>
                                Carregando...
                            </div>
                        `;

                            inputComDiv.appendChild(listaUsersDiv);

                            try {

                                const API = await fetch(
                                    "/api/endpoints/quadros/lista_usuarios_quadro.asp",
                                    {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json"
                                        },
                                        body: JSON.stringify({
                                            id_usuario: sessionStorage.getItem("trellomads_demo_user_id"),
                                            id_quadro: sessionStorage.getItem("trellomads_demo_board_id")
                                        })
                                    }
                                );

                                const APIresponse = await API.json();

                                if (API.ok) {

                                    // console.log(APIresponse);

                                    // Guarda a lista na prÃ³pria div
                                    listaUsersDiv.usuarios = APIresponse;

                                    mostrarUsuarios(APIresponse, textoBusca, listaUsersDiv);



                                    // inputCom.appendChild(uss)
                                }

                            } catch (err) {

                                console.error(err);

                            }

                        } else {

                            // A lista jÃ¡ existe, entÃ£o apenas filtra
                            const usuarios = listaUsersDiv.usuarios || [];

                            mostrarUsuarios(
                                usuarios,
                                textoBusca,
                                listaUsersDiv

                            );
                        }

                    } else {

                        // NÃ£o estamos mais dentro de uma menÃ§Ã£o
                        const listaUsersDiv = inputComDiv.querySelector(".listaUsuarios");

                        if (listaUsersDiv) {
                            listaUsersDiv.remove();
                        }
                    }

                    inputAnterior = inputAtual;
                });

                function mostrarUsuarios(usuarios, textoBusca, listaUsersDiv) {

                    listaUsersDiv.innerHTML = "";

                    const busca = textoBusca.toLowerCase();

                    const usuariosFiltrados = usuarios.filter(usuario =>
                        usuario.nome_usuario.toLowerCase().includes(busca)
                    );

                    if (usuariosFiltrados.length === 0) {

                        listaUsersDiv.innerHTML =
                            `
                            <div>
                                Nenhum usuÃ¡rio encontrado
                            </div>
                        `;

                        return;
                    }

                    for (const usuario of usuariosFiltrados) {

                        const divUser = document.createElement("div");

                        divUser.textContent = usuario.nome_usuario;
                        divUser.dataset.id_usuario = usuario.id_usuario
                        divUser.style = `padding:5px; cursor:pointer; border: 1px solid #505050; background-color: #303030; box-shadow: 0 5pc 5pc rgba(0,0,0,0.5); border-radius: 5px; gap: 5px`

                        listaUsersDiv.appendChild(divUser);

                        divUser.addEventListener("click", () => {

                            mencoes.push({
                                id_usuario: usuario.id_usuario,
                                nome_usuario: usuario.nome_usuario
                            })

                            const textoAtual = inputCom.value;
                            const cursor = inputCom.selectionStart;

                            const textoAntesCursor = textoAtual.slice(0, cursor);

                            const match = textoAntesCursor.match(/(^|\s)@([^\s@]*)$/);

                            if (!match) return;

                            const inicioMencao = match.index + match[1].length;


                            const marcacao = textoAtual.slice(0, inicioMencao) +
                                "@" + usuario.nome_usuario + " " +
                                textoAtual.slice(cursor);
                            // marcacao.style.color = "#6c00e7"
                            inputCom.value = marcacao
                            listaUsersDiv.remove();
                            inputCom.focus();
                        });
                    }
                }



                inputComDiv.appendChild(h3Com)

                inputComDiv.appendChild(inputCom)


                comentariosDiv.appendChild(inputComDiv)

                inputCom.addEventListener("keydown", async (ikd) => {

                    if (ikd.key === "Enter") {

                        if (inputCom.value) {
                            loadingSmScreen()
                            await enviarComentario(id_card, inputCom.value, mencoes)
                            comentariosDiv.remove();
                            await comentariosDivF();
                            EndloadingSmScreen()
                        } else {
                            return
                        }
                    }

                })


                const botaoMMais = document.createElement("button");

                const divBtnMMais = document.createElement("div");

                divBtnMMais.style = `display: flex; justify-content: right; margin: 5px 10px`

                divBtnMMais.appendChild(botaoMMais)

                comentariosDiv.appendChild(divBtnMMais)

                botaoMMais.textContent = "Mostrar Mais"

                botaoMMais.classList.add("botaoSimplesDark")

                botaoMMais.style.padding = "5px "


                const logs = await listarLogs(id_card);

                comentariosDiv.appendChild(comentariosContent)


                // FunÃ§Ã£o responsÃ¡vel por montar cada item do histÃ³rico
                function montarHistorico(item) {

                    const itemDiv = document.createElement("div");

                    itemDiv.classList.add("logDiv");

                    itemDiv.dataset.tipo_item = item.tipo_item;


                    if (item.tipo_item === "log") {

                        itemDiv.dataset.id_externo = item.id_logs;
                        itemDiv.dataset.tipo_log = item.tipo_log;


                        const logContent = document.createElement("div");

                        const logDthr = document.createElement("div");


                        logContent.textContent = `${item.text_log}`;

                        logContent.style = `overflow-wrap: break-word; text-overflow: ellipsis; white-space:pre-wrap; overflow: hidden; max-width: 300px`


                        logDthr.textContent = `${item.dthr}`;

                        logDthr.style = `font-size: 12px; color: #909090;`


                        itemDiv.appendChild(logContent);

                        itemDiv.appendChild(logDthr);

                    }


                    else if (item.tipo_item === "comentario") {

                        itemDiv.dataset.id_comentario = item.id_comentario;

                        itemDiv.style = ``


                        const comentarioName = document.createElement("div");
                        const comentarioContent = document.createElement("div");

                        const comentarioDthr = document.createElement("div");


                        comentarioName.textContent = `${item.nome_usuario}`

                        comentarioName.style = `font-weight:bold; margin-bottom:10px;`


                        comentarioContent.textContent = `${item.comentario_text}`;


                        comentarioContent.style = `overflow-wrap: break-word; text-overflow: ellipsis; white-space:pre-wrap; overflow: hidden; max-width: 300px;  background-color: #101010;padding:10px;border-radius:0 10px 10px 10px;margin-bottom:10px`


                        comentarioDthr.textContent = `${item.dthr}`;

                        comentarioDthr.style = `font-size: 12px; color: #909090;`


                        itemDiv.appendChild(comentarioName);
                        itemDiv.appendChild(comentarioContent);

                        itemDiv.appendChild(comentarioDthr);

                    }


                    return itemDiv;

                }



                // Mostra inicialmente apenas os logs bÃ¡sicos + comentÃ¡rios
                if (logs.length > 0) {

                    const historicoBasico = logs.filter(item => {

                        // ComentÃ¡rios sempre aparecem
                        if (item.tipo_item === "comentario") {
                            return true;
                        }

                        // MOVECARD continua escondido inicialmente
                        return item.tipo_log !== "MOVECARD";

                    });


                    if (historicoBasico.length > 0) {

                        for (const item of historicoBasico) {

                            const itemDiv = montarHistorico(item);

                            comentariosContent.appendChild(itemDiv);

                        }

                    }


                    let MMostrado = true;


                    botaoMMais.addEventListener("click", async () => {

                        if (MMostrado === true) {

                            comentariosContent.innerHTML = "";


                            // Mostra absolutamente tudo
                            for (const item of logs) {

                                const itemDiv = montarHistorico(item);

                                comentariosContent.appendChild(itemDiv);

                            }


                            MMostrado = false

                            botaoMMais.classList.add("botaoSimplesDarkInv")

                            botaoMMais.classList.remove("botaoSimplesDark")

                            botaoMMais.textContent = "Mostrar Menos"

                        }


                        else {

                            comentariosContent.innerHTML = "";


                            const historicoBasico = logs.filter(item => {

                                // ComentÃ¡rios sempre aparecem
                                if (item.tipo_item === "comentario") {
                                    return true;
                                }

                                // MOVECARD continua escondido
                                return item.tipo_log !== "MOVECARD";

                            });


                            if (historicoBasico.length > 0) {

                                for (const item of historicoBasico) {

                                    const itemDiv = montarHistorico(item);

                                    comentariosContent.appendChild(itemDiv);

                                }

                            }


                            MMostrado = true

                            botaoMMais.classList.add("botaoSimplesDark")

                            botaoMMais.classList.remove("botaoSimplesDarkInv")

                            botaoMMais.textContent = "Mostrar Mais"

                        }

                    })

                }


                modalBodyContent.appendChild(modalDescricaoDiv);

                modalBodyContent.appendChild(comentariosDiv)

                modalDescricaoDiv.appendChild(modalDescricao);


            }
            await comentariosDivF()
            listarChecklists(APIresponse.checklists, modalDescricaoDiv);

            const mainContent = document.getElementById("main-content")
            mainContent.appendChild(divModalCardContainer)
            divModalCardContainer.appendChild(divModalCard);
            divModalCard.appendChild(modalCardContentContainer);
            modalCardContentContainer.appendChild(modalCardHeader)
            modalCardContentContainer.appendChild(modalBodyContent)








        }
        if (!API.ok) {
            console.warn(APIresponse)
        }
    } catch (err) {
        console.error(err);
    }
    EndloadingSmScreen();
}


function ExibirEtqModal(idEtiqueta, flagAtivo, nomeEtiqueta, bgColor) {

    const etiquetasDiv = document.querySelector(".etiquetasDiv")

    const etqextistente = etiquetasDiv.querySelector(`.etqModal[data-id_etiqueta="${idEtiqueta}"`)
    if (etqextistente) {
        removerEtqModal(idEtiqueta)
        etqextistente.flag_ativo = "False"
        return
    }



    // console.log("ADICIONANDO ETIQUETA");
    // console.log("id:", idEtiqueta);
    // console.log("flag:", flagAtivo);
    // console.log("nome:", nomeEtiqueta);
    // console.log("cor:", bgColor);
    // console.log("container:", etiquetasDiv);

    const etqModal = document.createElement("div");
    etqModal.dataset.id_etiqueta = idEtiqueta;
    etqModal.dataset.flag_ativo = flagAtivo;
    etqModal.textContent = nomeEtiqueta;
    etqModal.style.backgroundColor = bgColor;
    etqModal.classList.add("etqModal");
    etiquetasDiv.appendChild(etqModal);


}

function removerEtqModal(idEtiqueta, idCard) {
    const etiquetasDiv = document.querySelector(".etiquetasDiv");

    const etq = etiquetasDiv.querySelector(
        `.etqModal[data-id_etiqueta="${idEtiqueta}"]`
    );

    if (etq) {
        etq.remove();
    }

    const cardDiv = document.querySelector(
        `.cardDiv[data-id_card="${idCard}"]`
    );

    if (cardDiv) {
        const divEtqFor = cardDiv.querySelector(".divEtiquetaContainer");

        const etqFor = divEtqFor.querySelector(
            `.divEtiqueta[data-id_etiqueta="${idEtiqueta}"]`
        );

        if (etqFor) {
            etqFor.remove();
        }
    }
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

async function atualizarDadosEtiquetasCard(idCard, etiquetasDiv, menuEtqDiv) {



    const etiquetas = [];

    // Pega o estado atual de TODAS as etiquetas do menu
    menuEtqDiv.querySelectorAll(".etqDivGeral").forEach(etq => {

        etiquetas.push({
            id_etiqueta: etq.dataset.id_etiqueta,
            flag_ativo: etq.dataset.flag_ativo
        });

    });

    const dados = {
        id_usuario: sessionStorage.getItem("trellomads_demo_user_id"),
        id_quadro: sessionStorage.getItem("trellomads_demo_board_id"),
        id_card: idCard,
        etiquetas: etiquetas
    };

    // console.log(dados);

    try {

        const API = await fetch("/api/endpoints/cards/edit_lista_etiquetas.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        const resposta = await API.json();

        if (!API.ok) {
            console.error("Erro na API:", resposta);
            return;
        }

        // console.log("Etiquetas atualizadas:", resposta);

    } catch (erro) {
        console.error("Erro no fetch:", erro);
    }
}

async function editaCard(idCard, cardTitulo, modalDescricao) {

    try {
        const API = await fetch("/api/endpoints/cards/edit_card.asp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                "id_card": idCard,
                "titulo_card": cardTitulo,
                "descricao_card": modalDescricao
            })


        })
        const APIresponse = await API.json();
        if (API.ok) {
            // console.log(APIresponse)
        }

    } catch (err) {
        // console.log(err);
    }
}


async function addEtiqueta(nomeEtiqueta, corEtiqueta) {
    try {
        const API = await fetch("/api/endpoints/cards/add_etiqueta_quadro.asp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                "nome_etiqueta": nomeEtiqueta,
                "cor_etiqueta": corEtiqueta
            })


        })
        const APIresponse = await API.json();
        if (API.ok) {
            // console.log(APIresponse)
            return APIresponse;
        }

    } catch (err) {
        // console.log(err)
    }


}

async function listaCardCompleto(id_card) {
    try {
        const API = await fetch("/api/endpoints/cards/lista_card_completo.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                "id_card": id_card
            })
        })
        const APIresponse = await API.json()

        if (API.ok) {
            return APIresponse

        }
    } catch (err) {

    }
}

async function cancelaCard(idCard) {
    try {
        const API = await fetch("/api/endpoints/cards/excluir_card.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                "id_card": idCard
            })
        })
        const APIresponse = await API.json()

        if (API.ok) {
            // console.log(APIresponse);

        }
        if (!API.ok) {
            console.warn(APIresponse)
        }
    } catch (err) {
        console.error(err)
    }
}

async function editaColuna(idColuna, nomeColuna) {

    try {
        const API = await fetch("/api/endpoints/colunas/edit_colunas.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                "id_coluna": idColuna,
                "nome_coluna": nomeColuna
            })
        })
        const APIresponse = await API.json()

        if (API.ok) {
            // console.log(APIresponse);

        }
        if (!API.ok) {
            console.warn(APIresponse)
        }
    } catch (err) {
        console.error(err)
    }
}


async function excluirColuna(idColuna) {
    // console.log(JSON.stringify({
    //             "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
    //             "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
    //             "id_coluna": idColuna
    // }))
    // return
    try {
        const API = await fetch("/api/endpoints/colunas/excluir_coluna.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                "id_coluna": idColuna

            })
        })
        const APIresponse = await API.json()

        if (API.ok) {
            // console.log(APIresponse);

        }
        if (!API.ok) {
            console.warn(APIresponse)
        }
    } catch (err) {
        console.error(err)
    }

}


async function excluirEtiqueta(idEtiqueta) {
    // console.log(JSON.stringify({
    //     "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
    //     "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
    //     "id_etiqueta": idEtiqueta
    // }))
    try {
        const API = await fetch("/api/endpoints/cards/remove_etiqueta_quadro.asp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                "id_etiqueta": idEtiqueta
            })
        })
        const APIresponse = API.json();

        if (API.ok) {
            // console.log(APIresponse)

        }
        if (!API.ok) {
            console.warn(APIresponse)
        }

    } catch (err) {
        console.error(err)
    }
}


async function listarIngressos(idCard) {

    try {

        const API = await fetch("/api/endpoints/cards/lista_ingressos_cards.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                "id_card": idCard
            })
        })
        const APIresponse = await API.json();
        if (API.ok) {
            return APIresponse
        }
        if (!API.ok) {
            console.warn(APIresponse)
        }
    } catch (err) {
        console.error(err)
    }
}

async function ingressarCardF(idCard) {
    try {

        const API = await fetch("/api/endpoints/cards/ingressar_card.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                "id_card": idCard
            })
        })
        const APIresponse = await API.json();
        if (API.ok) {
            return APIresponse
        }
        if (!API.ok) {
            console.warn(APIresponse)
        }
    } catch (err) {
        console.error(err)
    }
}

function montarCarinhasModal(listaIngressos, divInfoLine) {
    for (const ingressado of listaIngressos) {
        const carinha = document.createElement("div")


        const carinhaImg = document.createElement("img");

        if (ingressado.avatar_img.length > 0) {
            carinhaImg.src = `data:image/jpeg;base64,${ingressado.avatar_img}`;
        } else {
            carinhaImg.src = "/assets/icons/circle-user.svg"
        }
        carinhaImg.style = `width: 100%; height: 100%; display: block;object-fit: cover`;
        carinha.appendChild(carinhaImg)

        carinha.style = `overflow:hidden;cursor: pointer; border-radius: 50%; background-color: var(--azul-claro); width:40px; height: 40px;`;
        carinha.title = ingressado.nome_usuario;
        // if (ingressado.id_usuario === sessionStorage.getItem("trellomads_demo_user_id")) {
        //     carinha.style.backgroundColor = "green";
        // }

        divInfoLine.appendChild(carinha)
    }
}
async function listarIngressosQuadro() {
    try {
        console.log(
            JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
            })

        )

        const API = await fetch("/api/endpoints/cards/lista_ingressos_quadro.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
            })
        })
        const APIresponse = await API.json();
        if (API.ok) {
            return APIresponse
        }
        if (!API.ok) {
            console.warn(APIresponse)
        }
    } catch (err) {
        console.error(err)
    }
}

async function listarLogs(id_card) {

    try {
        const API = await fetch("/api/endpoints/cards/lista_log_card.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                "id_card": id_card
            })
        })
        const APIresponse = await API.json();
        if (API.ok) {
            return APIresponse
        }
        if (!API.ok) {
            console.warn(APIresponse)
        }
    } catch (err) {
        console.error(err)
    }

}
async function chamarDescricaoCard(id_card) {

    try {
        const API = await fetch("/api/endpoints/cards/lista_descricao_card.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                "id_card": id_card
            })
        })
        const APIresponse = await API.json();
        if (API.ok) {
            // console.log(APIresponse)
            // return
            return APIresponse
        }
        if (!API.ok) {
            console.warn(APIresponse)
        }
    } catch (err) {
        console.error(err)
    }

}

function criarModalConfirma(enunciado, confirmaOpt, cancelaOpt) {

    const modalBg = document.createElement("div");
    const modalBase = document.createElement("div");

    const modalContent = document.createElement("div");

    const enunciadoDiv = document.createElement("div")
    const botoes = document.createElement("div")

    modalBg.id = "modalBgFunction"

    enunciadoDiv.style = `display:flex;justify-content: center; color:white; font-size:20px`;
    enunciadoDiv.textContent = enunciado

    botoes.style = `display: flex; justify-content: center; gap: 20px; margin-top: 20px`
    botoes.innerHTML = `
    
        <button id="btnConfirmModalFunction" style="flex: 1" class="botaoSimplesVermelho">${confirmaOpt}</button>
        <button id="btnCancelModalFunction" style="flex:1" class="botaoSimples">${cancelaOpt}</button>

    `
    modalContent.appendChild(enunciadoDiv)
    modalContent.appendChild(botoes)
    modalBase.appendChild(modalContent)
    modalBg.appendChild(modalBase);
    document.body.appendChild(modalBg)

    modalBg.classList.add("modalBg")
    modalBase.classList.add("modalBase")

}


async function enviarComentario(id_card, comentario, mencoes) {
    // console.log(JSON.stringify({
    //                 "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
    //                 "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
    //                 "id_card": id_card,
    //                 "comentario": comentario,
    //                 "mencoes": mencoes
    //             }))
    //             return 
    try {
        const API = await fetch("/api/endpoints/cards/enviar_comentario.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                "id_card": id_card,
                "comentario": comentario,
                "mencoes": mencoes
            })
        })
        const APIresponse = await API.json();
        if (API.ok) {
            // console.log(APIresponse)
            // return
            return APIresponse
        }
        if (!API.ok) {
            console.warn(APIresponse)
        }
    } catch (err) {
        console.error(err)
    }
}



async function criarChecklist(idCard, nomeChecklist) {

    try {
        const API = await fetch("/api/endpoints/cards/add_checklist.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                "id_card": idCard,
                "nome_checklist": nomeChecklist
            })
        })
        const APIresponse = await API.json();
        if (API.ok) {
            // console.log(APIresponse)
            // return
            return APIresponse
        }
        if (!API.ok) {
            console.warn(APIresponse)
        }
    } catch (err) {
        console.error(err)
    }


}


async function criarCampoChecklist(id_checklist, nome_check) {
    console.log(JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                "id_checklist": id_checklist,
                "nome_check": nome_check
            }))
    //         return

    try {
        const API = await fetch("/api/endpoints/cards/add_campos_checklist.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                "id_checklist": id_checklist,
                "nome_check": nome_check
            })
        })
        const APIresponse = await API.json();
        if (API.ok) {
            // console.log(APIresponse)
            // return
            return APIresponse
        }
        if (!API.ok) {
            console.warn(APIresponse)
        }
    } catch (err) {
        console.error(err)
    }


}



async function editarCampoChecklist(id_campo_checklist, id_checklist, nome_check) {
    console.log(JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                "id_campo_checklist": id_campo_checklist,
                "id_checklist": id_checklist,
                "nome_check": nome_check
            }))
    //         return

    try {
        const API = await fetch("/api/endpoints/cards/edit_campos_checklist.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                "id_campo_checklist": id_campo_checklist,
                "id_checklist": id_checklist,
                "nome_check": nome_check
            })
        })
        const APIresponse = await API.json();
        if (API.ok) {
            // console.log(APIresponse)
            // return
            return APIresponse
        }
        if (!API.ok) {
            console.warn(APIresponse)
        }
    } catch (err) {
        console.error(err)
    }


}




async function editarChecklist(id_checklist, nome_checklist) {
    // console.log(JSON.stringify({
    //             "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
    //             "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
    //             "id_checklist": id_checklist,
    //             "nome_check": nome_check
    //         }))
    //         return

    try {
        const API = await fetch("/api/endpoints/cards/edit_checklist.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                // "id_campo_checklist": id_campo_checklist,
                "id_checklist": id_checklist,
                "nome_checklist": nome_checklist
            })
        })
        const APIresponse = await API.json();
        if (API.ok) {
            // console.log(APIresponse)
            // return
            return APIresponse
        }
        if (!API.ok) {
            console.warn(APIresponse)
        }
    } catch (err) {
        console.error(err)
    }


}




async function excluirCampoChecklist(id_campo_checklist) {
    // console.log(JSON.stringify({
    //             "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
    //             "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
    //             "id_checklist": id_checklist,
    //             "nome_check": nome_check
    //         }))
    //         return

    try {
        const API = await fetch("/api/endpoints/cards/excluir_campos_checklist.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                // "id_campo_checklist": id_campo_checklist,
                "id_campo_checklist": id_campo_checklist
                // "nome_checklist": nome_checklist
            })
        })
        const APIresponse = await API.json();
        if (API.ok) {
            // console.log(APIresponse)
            // return
            return APIresponse
        }
        if (!API.ok) {
            console.warn(APIresponse)
        }
    } catch (err) {
        console.error(err)
    }


}




async function excluirChecklist(id_checklist) {
    // console.log(JSON.stringify({
    //             "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
    //             "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
    //             "id_checklist": id_checklist
    //             // "nome_check": nome_check
    //         }))
    //         return

    try {
        const API = await fetch("/api/endpoints/cards/excluir_checklist.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                // "id_campo_checklist": id_campo_checklist,
                "id_checklist": id_checklist
                // "nome_checklist": nome_checklist
            })
        })
        const APIresponse = await API.json();
        if (API.ok) {
            // console.log(APIresponse)
            // return
            return APIresponse
        }
        if (!API.ok) {
            console.warn(APIresponse)
        }
    } catch (err) {
        console.error(err)
    }


}





async function atualizarCheckCampoChecklist(id_campo_checklist, check) {
    // console.log(JSON.stringify({
    //             "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
    //             "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
    //             // "id_campo_checklist": id_campo_checklist,
    //             "id_campo_checklist": id_campo_checklist,
    //             "check": check
    //             // "nome_checklist": nome_checklist
    //         }))
    //         return

    try {
        const API = await fetch("/api/endpoints/cards/check_campo_checklist.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": sessionStorage.getItem("trellomads_demo_board_id"),
                // "id_campo_checklist": id_campo_checklist,
                "id_campo_checklist": id_campo_checklist,
                "check": check
                // "nome_checklist": nome_checklist
            })
        })
        const APIresponse = await API.json();
        if (API.ok) {
            console.log(APIresponse)
            // return
            return APIresponse
        }
        if (!API.ok) {
            console.warn(APIresponse)
        }
    } catch (err) {
        console.error(err)
    }


}







function listarChecklists(listaChecklists, modalDescricaoDiv) {

    if (!Array.isArray(listaChecklists) || listaChecklists.length === 0) {
        return;
    }

    listaChecklists.forEach((checklist) => {

        const divCheck = document.createElement("div");
        divCheck.classList.add("checklistDiv");

        divCheck.dataset.id_checklist = checklist.id_checklist;

        // Converte os campos recebidos da API para o formato utilizado
        // pela funÃ§Ã£o montarChecklist()
        const tarefas = checklist.campos.map((campo) => {

            const valorCheck = String(campo.check).toLowerCase();

            const concluida = valorCheck === "true" || valorCheck === "1";

            return {
                id_campo_checklist: campo.id_campo_checklist,
                texto: campo.nome_check,
                nomeSalvo: campo.nome_check,
                concluida: concluida
            };
        });

        montarChecklist(
            divCheck,
            checklist.id_checklist,
            checklist.nome_checklist,
            tarefas
        );

        modalDescricaoDiv.appendChild(divCheck);

    });
}



function montarChecklist(divCheck, idChecklist, nomeInicial, tarefasIniciais) {

    let nome = nomeInicial;
    let tarefas = tarefasIniciais;

    // RenderizaÃ§Ã£o normal do checklist
    function renderizarChecklist() {

        divCheck.replaceChildren();

        const nomeCheck = document.createElement("div");
        nomeCheck.classList.add("checklistNomeDiv");

        const nCText = document.createElement("div");
        nCText.classList.add("checklistNome");
        nCText.textContent = nome;

        const checkEditBtn = document.createElement("button");
        checkEditBtn.classList.add("botaoSimplesVerde");
        checkEditBtn.textContent = "Editar";
        checkEditBtn.style = "padding: 5px";

        nomeCheck.appendChild(nCText);
        nomeCheck.appendChild(checkEditBtn);
        divCheck.appendChild(nomeCheck);

        const bodyCheck = document.createElement("div");
        bodyCheck.classList.add("bodyCheck");

        tarefas.forEach((tarefa) => {

            const checkDiv = document.createElement("div");
            checkDiv.classList.add("checkDiv");
            checkDiv.dataset.id_campo_checklist = tarefa.id_campo_checklist;
            checkDiv.dataset.id_checklist = idChecklist;

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.classList.add("checkbox");
            checkbox.checked = tarefa.concluida;

            const textoTarefa = document.createElement("div");
            textoTarefa.classList.add("textoCheckbox");
            textoTarefa.textContent = tarefa.texto;

            if (tarefa.concluida) {
                textoTarefa.classList.add("tarefaConcluida");
            }

            checkbox.addEventListener("change", async () => {

                const estadoAnterior = tarefa.concluida;

                tarefa.concluida = checkbox.checked;

                textoTarefa.classList.toggle(
                    "tarefaConcluida",
                    checkbox.checked
                );

                try {

                    await atualizarCheckCampoChecklist(
                        tarefa.id_campo_checklist,
                        checkbox.checked
                    );

                } catch (erro) {

                    console.error("Erro ao atualizar check:", erro);

                    // Reverte a alteraÃ§Ã£o caso a API falhe
                    tarefa.concluida = estadoAnterior;
                    checkbox.checked = estadoAnterior;

                    textoTarefa.classList.toggle(
                        "tarefaConcluida",
                        estadoAnterior
                    );
                }
            });

            checkDiv.appendChild(checkbox);
            checkDiv.appendChild(textoTarefa);
            bodyCheck.appendChild(checkDiv);
        });

        divCheck.appendChild(bodyCheck);

        checkEditBtn.addEventListener("click", abrirEdicaoChecklist);
    }


    // Modo de ediÃ§Ã£o
    async function abrirEdicaoChecklist() {

        const tarefasOriginais = tarefas.map(tarefa => ({ ...tarefa }));
        const nomeOriginal = nome;

        divCheck.replaceChildren();

        const inputNome = document.createElement("input");
        inputNome.classList.add("inputSimples");
        inputNome.value = nome;

        divCheck.appendChild(inputNome);

        const tarefasEdicao = document.createElement("div");
        tarefasEdicao.classList.add("tarefasEdicao");


        function renderizarTarefasEdicao() {

            tarefasEdicao.replaceChildren();

            tarefas.forEach((tarefa, index) => {

                const linhaTarefa = document.createElement("div");
                linhaTarefa.classList.add("linhaTarefaEdicao");

                const inputTarefa = document.createElement("input");
                inputTarefa.classList.add("inputSimples");
                inputTarefa.value = tarefa.texto;
                inputTarefa.placeholder = "Nome da tarefa";

                inputTarefa.addEventListener("input", () => {
                    tarefa.texto = inputTarefa.value;
                });

                const excluirTarefa = document.createElement("button");
                excluirTarefa.classList.add("botaoExcluirTarefa");
                excluirTarefa.textContent = "X";
                excluirTarefa.title = "Excluir tarefa";

                excluirTarefa.addEventListener("click", async () => {

                    try {

                        await excluirCampoChecklist(
                            tarefa.id_campo_checklist
                        );

                        // Remove do array principal
                        tarefas.splice(index, 1);

                        // TambÃ©m remove da cÃ³pia original.
                        // Assim, cancelar nÃ£o restaura uma tarefa
                        // que jÃ¡ foi excluÃ­da do banco.
                        const indexOriginal = tarefasOriginais.findIndex(
                            original =>
                                original.id_campo_checklist === tarefa.id_campo_checklist
                        );

                        if (indexOriginal !== -1) {
                            tarefasOriginais.splice(indexOriginal, 1);
                        }

                        renderizarTarefasEdicao();

                    } catch (erro) {
                        console.error("Erro ao excluir tarefa:", erro);
                    }
                });

                linhaTarefa.appendChild(inputTarefa);
                linhaTarefa.appendChild(excluirTarefa);

                tarefasEdicao.appendChild(linhaTarefa);
            });
        }


        renderizarTarefasEdicao();
        divCheck.appendChild(tarefasEdicao);

        const botoesEdicao = document.createElement("div");
        botoesEdicao.classList.add("botoesEdicaoChecklist");


        // Adicionar tarefa
        const adicionarTarefa = document.createElement("button");
        adicionarTarefa.classList.add("botaoSimples");
        adicionarTarefa.textContent = "+ Tarefa";

        adicionarTarefa.addEventListener("click", async () => {

            try {

                const nomeInicial = "Nova tarefa";

                const apiIdCampo = await criarCampoChecklist(
                    idChecklist,
                    nomeInicial
                );

                const idCampo = apiIdCampo.id_campo_checklist;

                if (!idCampo) return;

                tarefas.push({
                    id_campo_checklist: idCampo,
                    texto: nomeInicial,
                    nomeSalvo: nomeInicial,
                    concluida: false
                });

                renderizarTarefasEdicao();

                const inputs = tarefasEdicao.querySelectorAll("input");
                inputs[inputs.length - 1]?.focus();

            } catch (erro) {
                console.error("Erro ao criar tarefa:", erro);
            }
        });


        // Confirmar ediÃ§Ã£o
        const confirmarEdicao = document.createElement("button");
        confirmarEdicao.classList.add("botaoSimplesVerde");
        confirmarEdicao.textContent = "Confirmar";

        confirmarEdicao.addEventListener("click", async () => {

            const novoNome = inputNome.value.trim();

            if (!novoNome) {
                inputNome.focus();
                return;
            }

            try {

                if (novoNome !== nomeOriginal) {
                    await editarChecklist(idChecklist, novoNome);
                }

                nome = novoNome;

                for (const tarefa of tarefas) {

                    const nomeNovo = tarefa.texto.trim();

                    if (!nomeNovo) continue;

                    if (nomeNovo !== tarefa.nomeSalvo) {

                        await editarCampoChecklist(
                            tarefa.id_campo_checklist,
                            idChecklist,
                            nomeNovo
                        );

                        tarefa.texto = nomeNovo;
                        tarefa.nomeSalvo = nomeNovo;
                    }
                }

                tarefas = tarefas.filter(tarefa =>
                    tarefa.texto.trim() !== ""
                );

                renderizarChecklist();

            } catch (erro) {
                console.error("Erro ao editar checklist:", erro);
            }
        });


        // Cancelar ediÃ§Ã£o
        const cancelarEdicao = document.createElement("button");
        cancelarEdicao.classList.add("botaoSimples");
        cancelarEdicao.textContent = "Cancelar";

        cancelarEdicao.addEventListener("click", () => {

            nome = nomeOriginal;

            const tarefasNovas = tarefas.filter(tarefa =>
                !tarefasOriginais.some(original =>
                    original.id_campo_checklist === tarefa.id_campo_checklist
                )
            );

            tarefas = [
                ...tarefasOriginais.map(tarefa => ({ ...tarefa })),
                ...tarefasNovas.map(tarefa => ({
                    ...tarefa,
                    texto: tarefa.nomeSalvo
                }))
            ];

            renderizarChecklist();
        });


        // Excluir checklist inteiro
        const excluirCheck = document.createElement("button");
        excluirCheck.classList.add("botaoSimplesVermelho");
        excluirCheck.textContent = "Excluir Checklist";

        excluirCheck.addEventListener("click", async () => {

            try {

                await excluirChecklist(idChecklist);

                divCheck.remove();

            } catch (erro) {
                console.error("Erro ao excluir checklist:", erro);
            }
        });


        botoesEdicao.appendChild(adicionarTarefa);
        botoesEdicao.appendChild(confirmarEdicao);
        botoesEdicao.appendChild(cancelarEdicao);
        botoesEdicao.appendChild(excluirCheck);

        divCheck.appendChild(botoesEdicao);

        inputNome.focus();
    }


    // Primeira renderizaÃ§Ã£o
    renderizarChecklist();
}

