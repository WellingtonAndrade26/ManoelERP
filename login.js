const entrarSistema = document.getElementById("entrarSistema")

function getUsuarios() {
  const usuariosSalvos = JSON.parse(localStorage.getItem("usuarios"))

  if (usuariosSalvos && usuariosSalvos.length > 0) {
    return usuariosSalvos
  }

  return [
    {
      id: 1,
      nome: "Manoel",
      login: "manoel",
      senha: "1234",
      perfil: "Admin",
      status: "Ativo",
    },
    {
      id: 2,
      nome: "Letícia",
      login: "leticia",
      senha: "087542",
      perfil: "Admin",
      status: "Ativo",
    },
  ]
}

if (entrarSistema) {
  entrarSistema.addEventListener("click", () => {
    const usuario = document.getElementById("usuario").value.trim()
    const senha = document.getElementById("senha").value.trim()

    if (!usuario || !senha) {
      alert("Preencha usuário e senha")
      return
    }

    const usuarios = getUsuarios()

    const usuarioEncontrado = usuarios.find(
      (item) =>
        item.login.toLowerCase() === usuario.toLowerCase() &&
        item.senha === senha &&
        item.status === "Ativo"
    )

    if (!usuarioEncontrado) {
      alert("Usuário ou senha inválidos")
      return
    }

    localStorage.setItem("logado", "sim")
    localStorage.setItem("usuarioLogado", usuarioEncontrado.nome)
    localStorage.setItem("perfilUsuario", usuarioEncontrado.perfil)

    window.location.href = "./index.html"
  })
}