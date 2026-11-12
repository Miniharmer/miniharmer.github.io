


export async function chamarQuadros() {
    try {
        const API = await fetch("/api/endpoints/quadros/lista_quadros.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
            })
        })

        const APIresponse = await API.json()

        if (API.ok) {
            console.log(APIresponse);
            await gerarDashboard(APIresponse);

        }
        if (!API.ok) {
            await gerarDashboard(APIresponse);

        }
    } catch (err) {
        await gerarDashboard();


    }


}

async function gerarDashboard(quadros) {




    const mainContent = document.getElementById("main-content")



    async function gummersindo() {
        try {
            const API = await fetch("/api/endpoints/usuarios/grupo.asp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "id_usuario": sessionStorage.getItem("trellomads_demo_user_id")
                })
            })

            const APIres = await API.json()

            if (API.ok) {
                mainContent.innerHTML = `
                    <header id="headerDashboard">
                        <div id="contentHeader">
                            <div id="homeHeader">TrelloMads <span style="font-size:12px;margin-left:10px">DEMONSTRAÇÃO · Kanban básico</span></div>
                            <div id="addHeader">
                                
                                <button class="botaoSimples" id="btn-form-ticket">FormulÃ¡rio de Ticket</button>
                                <button style="margin-left: 10px" class="botaoSimples" id="btn-add-usuario">Adicionar UsuÃ¡rio</button>
                                <button style="margin-left: 10px" class="botaoSimples" id="btn-editar-usuario">Editar UsuÃ¡rio</button>
                                <button style="margin-left: 10px" class="botaoSimples" id="buttonAddHeader">Adicionar novo Quadro</button>
                                <button style="margin-left: 10px" class="botaoSimplesVermelho" id="btn-sair-header">Sair</button>
                            </div>
                        
                        </div>
                    </header>
                    <div id="corpoDashboard">
                        <div id=containerPrimario>
                            <div id="containerQuadros">

                            </div>
                        </div>

                    </div>
                        `
            }
            if (!API.ok) {
                mainContent.innerHTML = `
        <header id="headerDashboard">
            <div id="contentHeader">
                <div id="homeHeader">TrelloMads <span style="font-size:12px;margin-left:10px">DEMONSTRAÇÃO · Kanban básico</span></div>
                <div id="addHeader">
                                <button style="margin-left: 10px" class="botaoSimples" id="btn-form-ticket">FormulÃ¡rio de Ticket</button>
                                <button style="margin-left: 10px" class="botaoSimples" id="btn-editar-usuario">Editar UsuÃ¡rio</button>
                                <button style="margin-left: 10px" class="botaoSimples" id="buttonAddHeader">Adicionar novo Quadro</button>
                                <button style="margin-left: 10px" class="botaoSimplesVermelho" id="btn-sair-header">Sair</button>
                </div>
                
            </div>
        </header>
        <div id="corpoDashboard">
            <div id=containerPrimario>
                <div id="containerQuadros">

                </div>
            </div>

        </div>

    `
            }
        } catch (err) {
            console.error(err)
        }
    }

    await gummersindo()






    const containerQuadros = document.getElementById("containerQuadros")

    const quadroTicket = document.createElement("div");
    quadroTicket.classList.add("divQuadro");
    quadroTicket.innerHTML = `
            <div class="tituloQuadroDiv"><div class="tituloQuadro">Seus Tickets<div></div>
        `

    quadroTicket.addEventListener("click", () => {
        // sessionStorage.setItem("trellomads_demo_board_id", idQuadro)
        sessionStorage.setItem("trellomads_demo_board_id", "1")
        sessionStorage.setItem("trellomads_demo_board_name", "Fluxo de trabalho")
        window.location.href = "quadro.html"
    })
    containerQuadros.appendChild(quadroTicket);

    if (quadros) {
        quadros.forEach(quadro => {
            const idQuadro = quadro.id_quadro;
            const nomeQuadro = quadro.nome_quadro;

            const divQuadro = document.createElement("div")
            divQuadro.classList.add("divQuadro");

            divQuadro.dataset.id_quadro = `${idQuadro}`

            divQuadro.innerHTML = `
            <div class="tituloQuadroDiv"><div class="tituloQuadro">${nomeQuadro}<div></div>
        `

            divQuadro.addEventListener("click", () => {
                sessionStorage.setItem("trellomads_demo_board_id", idQuadro)
                sessionStorage.setItem("trellomads_demo_board_name", nomeQuadro)
                window.location.href = "quadro.html"
            })
            containerQuadros.appendChild(divQuadro);
        })
    }

    const homeHeader = document.getElementById("homeHeader");
    homeHeader.addEventListener("click", () => {
        window.location.href = "dashboard.html"
    })

}


export async function gerarQuadro() {

    if (sessionStorage.getItem("trellomads_demo_user_id") === null || sessionStorage.getItem("trellomads_demo_board_id") === null) {
        window.location.href = "./index.html"
    }
    const mainContent = document.getElementById("main-content")

    mainContent.innerHTML = `

        <header id="headerDashboard">
            <div id="contentHeader">
                <div id="homeHeader">TrelloMads <span style="font-size:12px;margin-left:10px">DEMONSTRAÇÃO · Kanban básico</span></div>
                <div style="display:flex; gap 20px; align-items:center">
                    <div style="margin-right:20px; position:relative" id="notificationDiv"><img id="notificationImg" src="../assets/icons/notification.svg" width="30" height="30"></div>
                    <div id="avatarDiv"></div>
                </div
                
              
            </div>
        </header>
        <div id="corpoDashboard">
            <div id="container-coluna"></div>
        </div>

    `
    const homeHeader = document.getElementById("homeHeader");
    const avatarHeader = document.getElementById("avatarDiv");
    avatarHeader.style = `position: relative;cursor: pointer; border-radius: 50%; background-color: var(--azul-claro); width:60px; height: 60px;`
    homeHeader.addEventListener("click", () => {
        window.location.href = "dashboard.html"
    })
    const avatar_img = await chamaAvatar();
    if (!avatar_img) {
        avatarHeader.innerHTML = `<img src="/assets/icons/circle-user.svg" alt="Avatar" style="border-radius: 50%; width: 100%; height: 100%; display: block;object-fit: cover">`;
    } else {
        avatarHeader.innerHTML = `<img src="${avatar_img}" alt="Avatar" style="border-radius: 50%;width: 100%; height: 100%; display: block;object-fit: cover">`;
    }


    let menuAberto = false;


    avatarHeader.addEventListener("click", (e) => {
        e.stopPropagation();
        if (menuAberto) {
            const menuAvatar = document.querySelector("#menuAvatarDiv");
            menuAvatar.remove()
            menuAberto = false;
        } else {

            const menuAvatarDiv = document.createElement("div");
            menuAvatarDiv.id = "menuAvatarDiv"
            avatarHeader.appendChild(menuAvatarDiv);
            menuAvatarDiv.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 5px; box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.5); left: -100px; z-index: 5; padding: 20px 10px 10px 10px; border-radius: 5px 0 5px 5px; position: absolute; width: 100px; background-color: #303030; color:white" class="menuAvatar">
                    <button id="editAvatarBtn" class="botaoSimplesVerde">Editar Avatar</button>
                    <button id="editProfileBtn" class="botaoSimples">Editar Perfil</button>
                    <button id="sairProfileBtn" class="botaoSimplesVermelho">Sair</button>
                </div>
                `;


            const sairProfileBtn = document.getElementById("sairProfileBtn")
            sairProfileBtn.addEventListener("click", () => {
                e.stopPropagation()
                sessionStorage.setItem("trellomads_demo_user_id", null)
                window.location.href = "./index.html"
            })

            const editProfileBtn = menuAvatarDiv.querySelector("#editProfileBtn");
            editProfileBtn.addEventListener("click", () => {
                const modalBg = document.createElement("div");
                modalBg.classList.add("modalBg");
                const modalUser = document.createElement("div");
                modalUser.classList.add("modalBase")
                modalBg.appendChild(modalUser)
                modalUser.style.width = "auto"
                modalUser.style.height = "auto"

                const modalContent = document.createElement("div");
                const barraFM = document.createElement("div")
                modalContent.appendChild(barraFM)
                barraFM.style = `width:100%; display:flex; justify-content:right;`
                const btnFM = document.createElement("button")
                btnFM.classList.add("botaoSimplesVermelho")
                btnFM.textContent = "X"
                barraFM.appendChild(btnFM)

                btnFM.addEventListener("click", () => {
                    modalBg.remove();
                })
                modalUser.appendChild(modalContent);

                const formularioAltSenha = document.createElement("form");
                formularioAltSenha.style = `width: 200px`;
                modalContent.appendChild(formularioAltSenha);




                const formTitle = document.createElement("h2");
                formTitle.style = "color: white; text-align: center; font-size: 20px;";
                formTitle.textContent = "Alterar Senha";


                const senhaAnterior = document.createElement("input");
                senhaAnterior.placeholder = "Nova Senha";
                senhaAnterior.classList.add("inputLogin")

                const senhaNova = document.createElement("input");
                senhaNova.placeholder = "Confirmar Nova Senha";
                senhaNova.classList.add("inputLogin")

                const confirmarSenha = document.createElement("button");
                confirmarSenha.textContent = "Confirmar";
                confirmarSenha.classList.add("botaoSimplesVerde");

                formularioAltSenha.appendChild(formTitle);

                formularioAltSenha.appendChild(senhaAnterior);
                formularioAltSenha.appendChild(senhaNova);
                formularioAltSenha.appendChild(confirmarSenha);

                document.body.appendChild(modalBg);


                confirmarSenha.addEventListener("click", async (e) => {
                    e.preventDefault();
                    try {
                        const API = await fetch("/api/endpoints/usuarios/alterar_senha.asp", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                                "senha_nova": senhaNova.value
                            })
                        })

                        const APIresponse = await API.json();

                        if (API.ok) {
                            console.log(APIresponse);
                            alert("Senha alterada com sucesso!");
                            modalBg.remove();
                            window.location.href = "./index.html"
                        } if (!API.ok) {
                            console.log(APIresponse)
                        }
                    } catch (err) {
                        console.error(err)
                    }
                })
            })



            const editAvatarBtn = document.getElementById("editAvatarBtn");
            editAvatarBtn.addEventListener("click", () => {
                const modalBg = document.createElement("div");
                modalBg.classList.add("modalBg");
                const modalUser = document.createElement("div");
                modalUser.classList.add("modalBase")
                modalBg.appendChild(modalUser)
                modalUser.style.width = "auto"
                modalUser.style.height = "auto"

                document.body.appendChild(modalBg);

                modalUser.innerHTML = `
            
            <div style="top: 0; display: flex; justify-content: right; margin-bottom: 20px;"><button id="btnFecharModal" style="" class="botaoSimplesVermelho">X</button></div>
                <div>
                    
                    <div id="divInputFoto" style="display: grid; ">


                        <input style="margin-bottom: 20px; outline: 1px solid #909090; background-color: #404040; border-radius: 5px; padding: 5px; color: white" name="fileInputFoto" type="file" id="fileInputFoto">
                        <button id="botaoEnviarInput" class="botaoSimplesVerde">Enviar foto de perfil</button>

                    </div>

                </div>

            </div> `

                const botaoEnviarInput = document.getElementById("botaoEnviarInput")
                const inputAvatar = document.getElementById("fileInputFoto");

                botaoEnviarInput.addEventListener("click", async function () {

                    const arquivo = inputAvatar.files[0];

                    if (!arquivo) {
                        return;
                    }
                    let base64;
                    const reader = new FileReader();

                    reader.onload = async function () {

                        base64 = reader.result.split(",")[1];

                        console.log(base64);
                        await enviarAvatar(base64);
                    };

                    reader.readAsDataURL(arquivo);


                    modalBg.remove();
                    window.location.reload();


                });

                const fecharM = document.getElementById("btnFecharModal");

                fecharM.addEventListener("click", () => {
                    modalBg.remove();
                })

            })

            menuAberto = true;
        }
    })
}

async function chamaAvatar() {
    try {
        const API = await fetch("/api/endpoints/usuarios/avatar.asp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
            })
        })
        const response = await API.json()
        return response.avatar_img ? `data:image/jpeg;base64,${response.avatar_img}` : null
        console.log(`data:image/jpeg;base64,${response.avatar_img}`)
    } catch (error) {
        // console.error("Erro ao chamar o avatar:", error)
        return null
    }
}

async function enviarAvatar(base64) {


    try {
        const API = await fetch("/api/endpoints/usuarios/enviar_avatar.asp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "avatar_img": base64
            })
        })
        const APIresponse = await API.json();

        if (API.ok) {
            console.log(APIresponse);

        }
        if (!API.ok) {
            console.warn(APIresponse)
        }

    } catch (err) {
        console.error(err)
    }


}

