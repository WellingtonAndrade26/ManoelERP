const entrarSistema = document.getElementById("entrarSistema")

if (entrarSistema) {
  entrarSistema.addEventListener("click", () => {
    const usuario = document.getElementById("usuario").value
    const senha = document.getElementById("senha").value

    if (usuario === "leticia" && senha === "087542") {
      localStorage.setItem("logado", "sim")
      window.location.href = "./index.html"
    } else {
      alert("Usuário ou senha inválidos")
    }
  })
}