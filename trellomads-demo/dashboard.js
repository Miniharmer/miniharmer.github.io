import * as baseHtml from "./base_html.js"

document.addEventListener("DOMContentLoaded", async function () {
    await baseHtml.chamarQuadros();
    await funcionalidades();
    await funcionalidadesGlobais();
    EndloadingScreen();

})

async function funcionalidadesGlobais() {
    let contextMenuOpen = false


    document.addEventListener("contextmenu", (rbc) => {
        rbc.preventDefault();
        // operacaoUsuario = true
        if (contextMenuOpen === true) {
            const menuAnterior = document.getElementById("context-menu");
            menuAnterior.remove()
            contextMenuOpen = false
            contextMenuOpen = false
            // operacaoUsuario = false
            return
        }
        const cElement = rbc.target;

        if (cElement.closest(".divQuadro")) {

            const divgeral = cElement.closest(".divQuadro")
            const idQuadro = divgeral.dataset.id_quadro;

            const menuEditQuadro = document.createElement("div");
            menuEditQuadro.id = "context-menu"
            menuEditQuadro.style = `display: grid; justify-content: center; background-color: #202020; display: block;  z-index: 1001; position: fixed; left: ${rbc.clientX}px; top: ${rbc.clientY}px; border-radius: 10px`;
            menuEditQuadro.classList.add("modalBase")

            document.body.appendChild(menuEditQuadro);
            contextMenuOpen = true;

            const mEEContent = document.createElement("div");
            mEEContent.style = `padding: 10px`
            mEEContent.innerHTML = `
                <div  style="width: 100%; justify-content: center; display: grid">
                    <button id="btn-editar-quadro" class="botaoSimples">Editar Quadro</button>
                </div>
            `
            menuEditQuadro.appendChild(mEEContent);

            const btnEditarQuadro = menuEditQuadro.querySelector("#btn-editar-quadro");
            btnEditarQuadro.addEventListener("click", async () => {
                await editQuadroModal(idQuadro);
                menuEditQuadro.remove();
                contextMenuOpen = false
                // operacaoUsuario = false

            });




        }

    })
}

function loadingScreen() {
    const fundoLS = document.getElementById("fundoLS");

    // Garante que a tela esteja visÃ­vel
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



async function funcionalidades() {
    const btnFormTicket = document.getElementById("btn-form-ticket");
    btnFormTicket.addEventListener("click", () => {
        window.location.href = "quadro.html"
    })



    const btnAddQuadro = document.getElementById("buttonAddHeader");



    btnAddQuadro.addEventListener("click", async () => {

        const modalBg = document.createElement("div");
        modalBg.classList.add("modalBg");
        const modalUser = document.createElement("div");
        modalUser.classList.add("modalBase")
        modalBg.appendChild(modalUser)
        modalUser.style.width = "auto"
        modalUser.style.height = "auto"

        document.body.appendChild(modalBg);


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


        const divDadosQuadro = document.createElement("div");
        divDadosQuadro.style = `width: 200px; `;





        const formTitle = document.createElement("h2");
        formTitle.style = "color: white; text-align: center; font-size: 20px;";
        formTitle.textContent = "Adicione as informaÃ§Ãµes do novo quadro";
        modalContent.appendChild(formTitle);
        modalContent.appendChild(divDadosQuadro);

        const nomeUser = document.createElement("input");
        nomeUser.placeholder = "Nome do Quadro";
        nomeUser.classList.add("inputLogin")

        divDadosQuadro.appendChild(nomeUser)

        const botaoConfirmar = document.createElement("button")
        botaoConfirmar.classList.add("botaoSimplesVerde")
        botaoConfirmar.textContent = "Confirmar"
        divDadosQuadro.appendChild(botaoConfirmar)

        botaoConfirmar.addEventListener("click", async () => {
            loadingScreen()
            botaoConfirmar.disabled = true
            if (!nomeUser.value) {
                alert("Insira um nome para o Quadro")

                EndloadingScreen();
                return
            }

            try {
                const API = await fetch("/api/endpoints/quadros/add_quadro.asp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                        "nome_quadro": nomeUser.value
                    })
                })
                const APIresponse = await API.json();

                if (API.ok) {
                    EndloadingScreen();
                    alert("Quadro criado com sucesso");
                    window.location.reload();
                }

            } catch (err) {
                EndloadingScreen();
                alert("Erro ao criar quadro");

            }
        })




    })

    const sairbtn = document.getElementById("btn-sair-header");

    sairbtn.addEventListener("click", () => {
        sessionStorage.setItem("trellomads_demo_user_id", null);
        window.location.href = "./index.html"
    })

    const editUserBtn = document.getElementById("btn-editar-usuario");
    editUserBtn.addEventListener("click", async () => {
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

            </div>
        `

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






        });

        const fecharM = document.getElementById("btnFecharModal");

        fecharM.addEventListener("click", () => {
            modalBg.remove();
        })

    })


    const btnAddUser = document.getElementById("btn-add-usuario");

    if (btnAddUser) {
        btnAddUser.addEventListener("click", () => {
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
            formTitle.textContent = "Adicione as informaÃ§Ãµes do novo usuÃ¡rio";


            const nomeUser = document.createElement("input");
            nomeUser.placeholder = "Nome e Sobrenome";
            nomeUser.classList.add("inputLogin")

            const emailUSer = document.createElement("input");
            emailUSer.placeholder = "Email";
            emailUSer.classList.add("inputLogin")

            const senhaUser = document.createElement("input");
            senhaUser.placeholder = "Senha";
            senhaUser.classList.add("inputLogin")

            const confSenhaUser = document.createElement("input");
            confSenhaUser.placeholder = "Confirmar Senha";
            confSenhaUser.classList.add("inputLogin")

            const confirmarSenha = document.createElement("button");
            confirmarSenha.textContent = "Confirmar";
            confirmarSenha.classList.add("botaoSimplesVerde");

            const select = document.createElement("select");
            select.style = `outline: 1px solid #909090  ; background-color: #101010; color: white; border: none; padding: 10px; border-radius: 5px; margin-bottom: 10px`
            select.id = "select-grupo"
            select.innerHTML = `
            <option selected disabled value="">Selecione um grupo</option>
            <option value="Analista">Analista</option>
            <option value="Usuario">UsuÃ¡rio</option>
        `

            formularioAltSenha.appendChild(formTitle);

            formularioAltSenha.appendChild(nomeUser);
            formularioAltSenha.appendChild(emailUSer);
            formularioAltSenha.appendChild(senhaUser);
            formularioAltSenha.appendChild(confSenhaUser);
            formularioAltSenha.appendChild(select);
            formularioAltSenha.appendChild(confirmarSenha);

            document.body.appendChild(modalBg);
            confirmarSenha.addEventListener("click", async (r) => {
                r.preventDefault()
                if (senhaUser.value !== confSenhaUser.value) {
                    alert("As senhas nÃ£o coincidem, insira uma senha vÃ¡lida e confirme");
                    return
                }


                try {
                    const API = await fetch("/api/endpoints/usuarios/add_usuario_sistema.asp", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                            "nome_usuario": nomeUser.value,
                            "email": emailUSer.value,
                            "senha": senhaUser.value,
                            "nivel": select.value
                        })
                    })
                    const APIresponse = await API.json();

                    if (API.ok) {
                        console.log(APIresponse);
                        window.location.reload()
                    }
                    if (!API.ok) {
                        console.warn(APIresponse)
                    }

                } catch (err) {
                    console.error(err)
                }



            })



        })
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


async function editQuadroModal(idQuadro) {

    try {
        const API = await fetch("/api/endpoints/quadros/lista_usuarios_quadro.asp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": idQuadro
            })
        })
        const APIresponse = await API.json();
        if (API.ok) {
            console.log(APIresponse)


            const modalBg = document.createElement("div");
            modalBg.classList.add("modalBg");
            modalBg.id = "editQuadro-modal"
            const modalBase = document.createElement("div");
            modalBase.classList.add("modalBase");

            const colunaUsuarios = document.createElement("div");

            modalBg.appendChild(modalBase);



            modalBase.innerHTML = `
            <div style="display: grid; width:100%;height:100%">
        
                <div style="width:100%; display:flex; top:0; justify-content:space-between; margin-bottom: 20px">

                    <button id="btnAddUsuarioQuadro" class="botaoSimplesVerde">Adicionar UsuÃ¡rio</button>
                    <button id="btnFecharEditQuadro" class="botaoSimplesVermelho"> X</button>
                </div>

                <div style="display:flex; width:100%" >
                    <div id="usuariosQuadroColuna"></div>
                    <div>-</div>
                </div>
            </div>
        `

            document.body.appendChild(modalBg)

            const btnAddUsuarioQuadro = document.getElementById(`btnAddUsuarioQuadro`);
            btnAddUsuarioQuadro.addEventListener("click", async function modalAddUsuario() {

                const grupos = await lista_grupos(sessionStorage.getItem("trellomads_demo_user_id"), idQuadro)


                const modalBg2 = document.createElement("div");
                modalBg2.classList.add("modalBg")
                modalBg2.style.zIndex = "101"

                const modalBase2 = document.createElement("div");
                modalBase2.classList.add("modalBase")

                modalBg2.appendChild(modalBase2)

                modalBase2.innerHTML = `
                    <div style="width:100%; display:flex; top:0; justify-content:right; margin-bottom: 20px"> <button id="fecharAddUQ" class="botaoSimplesVermelho">X</button></div>
                    <div style="display:flex">
                        <div id="lista-usuarios-div"></div>
                        <div id="opcao-add-usuarios-div"></div>
                    </div>
                `

                document.body.appendChild(modalBg2);
                const fecharAddUQ = document.getElementById("fecharAddUQ");
                fecharAddUQ.addEventListener("click", () => {
                    modalBg2.remove()
                })

                const todosUsuarios = await listaUsuariosForaQuadro(idQuadro);


                const listaUDiv = document.getElementById("lista-usuarios-div");
                listaUDiv.style = `margin-right: 10px;`
                const opcaoAddUDiv = document.getElementById("opcao-add-usuarios-div");
                opcaoAddUDiv.style = "display:flex; justify-content: center;   flex-direction: column"

                const usuarioSel = document.createElement("div");
                const avisoSel = document.createElement("div");
                avisoSel.style = "color: white; justify-content: center; display: flex; margin-bottom: 10px"
                avisoSel.textContent = "Selecione um usuÃ¡rio"
                usuarioSel.innerHTML = ""
                const selectCargo = document.createElement("select");
                selectCargo.style = `outline: 1px solid #909090  ; background-color: #101010; color: white; border: none; padding: 10px; border-radius: 5px; margin-bottom: 10px`
                const btnInserirUsuario = document.createElement("button");
                btnInserirUsuario.classList.add("botaoSimplesVerde")
                btnInserirUsuario.textContent = "Adicionar usuÃ¡rio ao Quadro"

                if (todosUsuarios.status_code === 400 || todosUsuarios.status_code === "400") {
                    const sa = document.createElement("div");
                    sa.textContent = "NÃ£o hÃ¡ usuÃ¡rios disponÃ­veis para adicionar neste quadro"
                    sa.style = "color: white; margin:10px"
                    opcaoAddUDiv.appendChild(sa);
                    return
                }
                opcaoAddUDiv.appendChild(usuarioSel)
                opcaoAddUDiv.appendChild(avisoSel)
                opcaoAddUDiv.appendChild(selectCargo)
                opcaoAddUDiv.appendChild(btnInserirUsuario)




                for (const grupo of grupos) {
                    const option = document.createElement("option");
                    option.innerText = grupo.nome_grupo;
                    option.value = grupo.id_grupo;

                    selectCargo.appendChild(option)

                }
                let sle
                for (const usuario of todosUsuarios) {
                    const contUser = document.createElement("div");
                    contUser.style = "background-color: #101010; border: #909090 1px solid; color:white; padding: 10px; margin-bottom: 5px; border-radius: 5px; cursor: pointer; "
                    contUser.id = usuario.id_usuario


                    const nomeUser = document.createElement("div");
                    const emailUser = document.createElement("div");
                    emailUser.textContent = usuario.email
                    nomeUser.textContent = usuario.nome_usuario


                    contUser.appendChild(nomeUser);
                    contUser.appendChild(emailUser);



                    listaUDiv.appendChild(contUser)

                    contUser.addEventListener("click", () => {
                        avisoSel.remove();
                        usuarioSel.innerHTML = "";
                        sle = contUser.cloneNode(true)
                        usuarioSel.appendChild(sle)
                    })

                }

                btnInserirUsuario.addEventListener("click", async () => {
                    if (usuarioSel.innerHTML === "" || usuarioSel === null) {
                        console.log("vaqzi")
                        alert("Selecione um UsuÃ¡rio")
                        return
                    }
                    // console.log(idQuadro, sle.id, selectCargo.value)
                    // return
                    await addMembroQuadro(idQuadro, sle.id, selectCargo.value);
                    modalBg2.remove();
                    await modalAddUsuario();
                    modalBg.remove();
                    await editQuadroModal(idQuadro);

                })



            })



            const btnFecharEditQuadro = document.getElementById(`btnFecharEditQuadro`)
            btnFecharEditQuadro.addEventListener("click", () => {
                modalBg.remove()
            })


            const usuariosQuadroColuna = document.getElementById("usuariosQuadroColuna")
            usuariosQuadroColuna.appendChild(colunaUsuarios)


            for (const usuario of APIresponse) {

                const containerUser = document.createElement("div");
                containerUser.innerHTML = `
                <div id="usuario-${usuario.id_usuario}" style=" display: flex; background-color: #101010; border: #909090 1px solid; color:white; padding: 10px; margin-bottom: 5px; border-radius: 5px">
                    <div style="display:grid; margin-right: 10px">
                        
                        <button id="btnRemoveUser-${usuario.id_usuario}" style="margin-bottom: 5px; padding:5px"  class="botaoSimplesVermelho">Remover UsuÃ¡rio</button>
                        <button id="btnEditPerm-${usuario.id_usuario}" style="padding:5px" class="botaoSimples">Editar PermissÃµes</button>

                    </div>
                    <div style="align-content: center">
                    
                        <div style="margin-bottom: 5px; font-weight: bold">${usuario.nome_usuario}</div>
                        <div style="font-style: italic; font-size: 14px">${usuario.email}</div>
                        <div style="font-size: 14px">${usuario.nome_grupo}</div>
                    </div>
                </div>
                `
                colunaUsuarios.appendChild(containerUser);

                const btnEditPerm = document.getElementById(`btnEditPerm-${usuario.id_usuario}`)


                btnEditPerm.addEventListener("click", async () => {



                    const modalBg2 = document.createElement("div");
                    modalBg2.classList.add("modalBg")
                    modalBg2.style.zIndex = "101"

                    const modalBase2 = document.createElement("div");
                    modalBase2.classList.add("modalBase")

                    modalBg2.appendChild(modalBase2)


                    const selectGrupo = document.createElement("select");
                    selectGrupo.id = "select-grupo"


                    const grupos = await lista_grupos(sessionStorage.getItem("trellomads_demo_user_id"), idQuadro)

                    for (const grupo of grupos) {

                        const option = document.createElement("option");
                        option.value = `${grupo.id_grupo}`
                        option.innerHTML = `${grupo.nome_grupo}`

                        selectGrupo.appendChild(option);


                    }
                    const barraFechar = document.createElement("div");
                    barraFechar.innerHTML = `
                    <div style="width:100%; display:flex; top:0; justify-content:right; margin-bottom: 20px">
                        <button id="btnFecharEditPerm"class="botaoSimplesVermelho"> X</button>
                    </div>

                    `

                    const attPerm = document.createElement("div");
                    attPerm.style.marginTop = `10px`
                    const btnAttPerm = document.createElement("button")
                    attPerm.appendChild(btnAttPerm);
                    btnAttPerm.classList.add("botaoSimples")
                    btnAttPerm.textContent = "Atualizar PermissÃ£o"

                    modalBase2.appendChild(barraFechar)
                    modalBase2.appendChild(selectGrupo)
                    modalBase2.appendChild(attPerm)
                    document.body.appendChild(modalBg2);


                    btnAttPerm.addEventListener("click", async () => {
                        const seletor = document.getElementById("select-grupo");
                        // console.log(seletor.value)
                        await atualizarPermissao(seletor.value, idQuadro, usuario.id_usuario)
                        modalBg2.remove()
                        modalBg.remove();
                        await editQuadroModal(idQuadro)
                    })


                    const btnFecharEditPerm = document.getElementById("btnFecharEditPerm");
                    btnFecharEditPerm.addEventListener("click", () => {
                        modalBg2.remove()
                    })
                })

                const btnRemoveUser = document.getElementById(`btnRemoveUser-${usuario.id_usuario}`);
                btnRemoveUser.addEventListener("click", async () => {
                    await removeMembro(sessionStorage.getItem("trellomads_demo_user_id"), idQuadro, usuario.id_usuario, usuario.id_grupo_quadro)
                    modalBg.remove();
                    editQuadroModal(idQuadro)
                })

            }

        }
        if (!API.ok) {
            console.warn(APIresponse)
        }



    } catch (err) {
        console.error(err)
    }




}




async function lista_grupos(idUsuario, idQuadro) {
    try {
        const API = await fetch("/api/endpoints/usuarios/lista_grupos.asp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "id_usuario": idUsuario,
                "id_quadro": idQuadro

            })
        })
        const APIresponse = await API.json()

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

async function atualizarPermissao(value, idQuadro, idUsuarioTarget) {
    try {
        const API = await fetch("/api/endpoints/quadros/edit_permissao_quadro.asp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": idQuadro,
                "id_grupo": value,
                "id_membro": idUsuarioTarget
            })
        })
        const APIresponse = await API.json()

        if (API.ok) {
            return APIresponse
        }

        if (!API.ok) {
            console.warn(APIresponse)
            alert(APIresponse.message)
        }
    } catch (err) {
        console.error(err)
    }


}

async function listaUsuariosForaQuadro(idQuadro) {
    try {
        const API = await fetch("/api/endpoints/quadros/lista_usuarios_fora_quadro.asp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": idQuadro
            })
        })
        const APIresponse = await API.json()

        if (API.ok) {
            return APIresponse
        }

        if (!API.ok) {
            console.warn(APIresponse)
            return APIresponse
        }
    } catch (err) {
        console.error(err)
    }




}
async function addMembroQuadro(idQuadro, idMembro, idGrupo) {
    // console.log(JSON.stringify({
    //             "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
    //             "id_quadro": idQuadro,
    //             "id_membro": idMembro,
    //             "id_grupo": idGrupo
    //         }))
    //         return
    try {
        const API = await fetch("/api/endpoints/quadros/add_usuario_quadro.asp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "id_usuario": sessionStorage.getItem("trellomads_demo_user_id"),
                "id_quadro": idQuadro,
                "id_membro": idMembro,
                "id_grupo": idGrupo
            })
        })
        const APIresponse = await API.json()

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


async function removeMembro(idUsuario, idQuadro, idMembro, idGrupo) {
    //     console.log(
    //        JSON.stringify({
    //                 "id_usuario": idUsuario,
    //                 "id_quadro": idQuadro,
    //                 "id_membro": idMembro,
    //                 "id_grupo": idGrupo
    //             })
    //     )
    // return
    try {
        const API = await fetch("/api/endpoints/quadros/remove_usuario_quadros.asp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "id_usuario": idUsuario,
                "id_quadro": idQuadro,
                "id_membro": idMembro,
                "id_grupo": idGrupo
            })
        })
        const APIresponse = await API.json()

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

