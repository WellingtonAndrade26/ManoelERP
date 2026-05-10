/* =====================================================
   MANOELERP - SCRIPT.JS LIMPO E ORGANIZADO
===================================================== */

/* =========================
   HELPERS
========================= */

function getStorage(chave, fallback = []) {
  try {
    const dados = localStorage.getItem(chave)
    return dados ? JSON.parse(dados) : fallback
  } catch (erro) {
    console.warn(`Erro ao ler localStorage: ${chave}`, erro)
    return fallback
  }
}

function setStorage(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor))
}

function formatarMoeda(valor) {
  return `R$ ${Number(valor || 0).toFixed(2)}`
}

function dataAtual() {
  return new Date().toLocaleDateString("pt-BR")
}

/* =========================
   LOGIN / SAIR
========================= */

const estaNoLogin = window.location.pathname.includes("login.html")

if (!estaNoLogin && localStorage.getItem("logado") !== "sim") {
  const caminhoLogin = window.location.pathname.includes("/pages/")
    ? "../login.html"
    : "./login.html"

  window.location.href = caminhoLogin
}

const sairSistema = document.getElementById("sairSistema")

if (sairSistema) {
  sairSistema.addEventListener("click", () => {
    localStorage.removeItem("logado")

    const caminhoLogin = window.location.pathname.includes("/pages/")
      ? "../login.html"
      : "./login.html"

    window.location.href = caminhoLogin
  })
}

/* =========================
   BASES SEGURAS
========================= */

const produtosBase = typeof produtos !== "undefined" ? produtos : []
const vendasBase = typeof vendas !== "undefined" ? vendas : []
const materiasBase = typeof materiasPrimas !== "undefined" ? materiasPrimas : []
const fabricacoesBase = typeof fabricacoes !== "undefined" ? fabricacoes : []
const receitasBase = typeof receitas !== "undefined" ? receitas : []
const financeiroBase = typeof financeiro !== "undefined" ? financeiro : []

let produtosSalvos = getStorage("produtos", produtosBase)
let vendasSalvas = getStorage("vendas", vendasBase)
let materiasSalvas = getStorage("materiasPrimas", materiasBase)
let fabricacoesSalvas = getStorage("fabricacoes", fabricacoesBase)
let receitasSalvas = getStorage("receitas", receitasBase)
let clientesSalvos = getStorage("clientes", [])
let financeiroSalvo = getStorage("financeiro", financeiroBase)
let ingredientesReceita = []

/* =========================
   PRODUTOS
========================= */

const modal = document.getElementById("modal")
const abrirModal = document.getElementById("abrirModal")
const fecharModal = document.getElementById("fecharModal")
const salvarProduto = document.getElementById("salvarProduto")
const tabelaProdutos = document.getElementById("tabelaProdutos")

function salvarLocalStorage() {
  setStorage("produtos", produtosSalvos)
}

function carregarProdutos() {
  if (!tabelaProdutos) return

  tabelaProdutos.innerHTML = ""

  produtosSalvos.forEach((produto) => {
    const custoTotal = produto.custo * produto.estoque

    tabelaProdutos.innerHTML += `
      <tr>
        <td>
          <strong>${produto.nome}</strong>
          <small>Código: ${produto.id}</small>
        </td>
        <td>${produto.categoria}</td>
        <td>${formatarMoeda(produto.custo)}</td>
        <td>${formatarMoeda(custoTotal)}</td>
        <td class="green">${formatarMoeda(produto.venda)}</td>
        <td class="orange">${produto.estoque} un.</td>
        <td>
          <button>Editar</button>
          <button onclick="excluirProduto(${produto.id})">Excluir</button>
        </td>
      </tr>
    `
  })
}

function atualizarDashboard() {
  const totalProdutosEl = document.getElementById("totalProdutos")
  const valorEstoqueEl = document.getElementById("valorEstoque")
  const lucroEstimadoEl = document.getElementById("lucroEstimado")
  const baixoEstoqueEl = document.getElementById("baixoEstoque")

  if (!totalProdutosEl) return

  let valorEstoque = 0
  let lucroEstimado = 0
  let baixoEstoque = 0

  produtosSalvos.forEach((produto) => {
    valorEstoque += produto.custo * produto.estoque
    lucroEstimado += (produto.venda - produto.custo) * produto.estoque

    if (produto.estoque <= 10) baixoEstoque++
  })

  totalProdutosEl.innerText = produtosSalvos.length
  valorEstoqueEl.innerText = formatarMoeda(valorEstoque)
  lucroEstimadoEl.innerText = formatarMoeda(lucroEstimado)
  baixoEstoqueEl.innerText = baixoEstoque
}

function atualizarResumo() {
  const faturamentoEl = document.getElementById("resumoFaturamento")
  const custosEl = document.getElementById("resumoCustos")
  const lucroEl = document.getElementById("resumoLucro")
  const estoqueEl = document.getElementById("resumoEstoque")

  if (!faturamentoEl) return

  let faturamento = 0
  let custos = 0
  let lucro = 0
  let estoque = 0

  produtosSalvos.forEach((produto) => {
    faturamento += produto.venda * produto.estoque
    custos += produto.custo * produto.estoque
    lucro += (produto.venda - produto.custo) * produto.estoque
    estoque += produto.estoque
  })

  faturamentoEl.innerText = formatarMoeda(faturamento)
  custosEl.innerText = formatarMoeda(custos)
  lucroEl.innerText = formatarMoeda(lucro)
  estoqueEl.innerText = estoque
}

function excluirProduto(id) {
  produtosSalvos = produtosSalvos.filter((produto) => produto.id !== id)
  salvarLocalStorage()
  carregarProdutos()
  atualizarDashboard()
  atualizarResumo()
  carregarProdutosNaVenda()
  carregarProdutosEntrada()
  carregarProdutosSaida()
  carregarEstoque()
  carregarAlertasDashboard()
}

if (abrirModal) abrirModal.addEventListener("click", () => modal?.classList.add("active"))
if (fecharModal) fecharModal.addEventListener("click", () => modal?.classList.remove("active"))

if (salvarProduto) {
  salvarProduto.addEventListener("click", () => {
    const nome = document.getElementById("nome").value
    const categoria = document.getElementById("categoria").value
    const custo = Number(document.getElementById("custo").value)
    const venda = Number(document.getElementById("venda").value)
    const estoque = Number(document.getElementById("estoque").value)

    if (!nome || !categoria || !custo || !venda || !estoque) {
      alert("Preencha todos os campos")
      return
    }

    produtosSalvos.push({ id: Date.now(), nome, categoria, custo, venda, estoque })
    salvarLocalStorage()
    carregarProdutos()
    atualizarDashboard()
    atualizarResumo()
    carregarProdutosNaVenda()
    carregarProdutosEntrada()
    carregarProdutosSaida()
    carregarEstoque()

    modal?.classList.remove("active")
    document.getElementById("nome").value = ""
    document.getElementById("categoria").value = ""
    document.getElementById("custo").value = ""
    document.getElementById("venda").value = ""
    document.getElementById("estoque").value = ""
  })
}

/* =========================
   VENDAS / FIADO
========================= */

const modalVenda = document.getElementById("modalVenda")
const abrirModalVenda = document.getElementById("abrirModalVenda")
const fecharModalVenda = document.getElementById("fecharModalVenda")
const salvarVenda = document.getElementById("salvarVenda")
const produtoVenda = document.getElementById("produtoVenda")
const tabelaVendas = document.getElementById("tabelaVendas")

function salvarVendasLocalStorage() {
  setStorage("vendas", vendasSalvas)
}

function statusVenda(venda) {
  return venda.status || (venda.pagamento === "Fiado" ? "Pendente" : "Pago")
}

function carregarProdutosNaVenda() {
  if (!produtoVenda) return
  produtoVenda.innerHTML = `<option value="">Selecione o produto</option>`

  produtosSalvos.forEach((produto) => {
    produtoVenda.innerHTML += `
      <option value="${produto.id}">
        ${produto.nome} - ${formatarMoeda(produto.venda)}
      </option>
    `
  })
}

function carregarVendas() {
  if (!tabelaVendas) return
  tabelaVendas.innerHTML = ""

  vendasSalvas.forEach((venda) => {
    const status = statusVenda(venda)

    tabelaVendas.innerHTML += `
      <tr>
        <td>${venda.cliente}</td>
        <td>${venda.produto}</td>
        <td>${venda.quantidade}</td>
        <td>${venda.pagamento}</td>
        <td class="green">${formatarMoeda(venda.total)}</td>
        <td class="${status === "Pendente" ? "orange" : "green"}">${status}</td>
        <td>
          ${status === "Pendente" ? `<button onclick="window.receberFiado(${venda.id})">Receber</button>` : ""}
          <button onclick="excluirVenda(${venda.id})">Excluir</button>
        </td>
      </tr>
    `
  })
}

function excluirVenda(id) {
  const venda = vendasSalvas.find((venda) => venda.id === id)

  if (venda) {
    const produto = produtosSalvos.find((produto) => produto.id === venda.produtoId)
    if (produto) produto.estoque += venda.quantidade
  }

  vendasSalvas = vendasSalvas.filter((venda) => venda.id !== id)
  financeiroSalvo = financeiroSalvo.filter((movimentacao) => movimentacao.vendaId !== id)

  salvarVendasLocalStorage()
  salvarFinanceiroLocalStorage()
  salvarLocalStorage()

  carregarVendas()
  carregarProdutos()
  atualizarDashboard()
  atualizarResumo()
  atualizarDashboardVendas()
  carregarFinanceiro()
  atualizarDashboardFinanceiro()
  carregarRelatorios()
  carregarEstoque()
  carregarAlertasDashboard()
}

window.receberFiado = function (id) {
  const venda = vendasSalvas.find((venda) => venda.id === id)

  if (!venda) {
    alert("Venda não encontrada")
    return
  }

  if (statusVenda(venda) === "Pago") {
    alert("Essa venda já está paga")
    return
  }

  venda.status = "Pago"

  financeiroSalvo.push({
    id: Date.now() + 30,
    vendaId: venda.id,
    descricao: `Recebimento fiado de ${venda.cliente}`,
    tipo: "Entrada",
    categoria: "Recebimento de fiado",
    valor: venda.total,
    data: dataAtual(),
  })

  salvarVendasLocalStorage()
  salvarFinanceiroLocalStorage()

  carregarVendas()
  atualizarDashboardVendas()
  carregarFinanceiro()
  atualizarDashboardFinanceiro()
  carregarRelatorios()
  carregarAlertasDashboard()

  alert("Pagamento recebido com sucesso!")
}

if (abrirModalVenda) {
  abrirModalVenda.addEventListener("click", () => {
    carregarProdutosNaVenda()
    modalVenda?.classList.add("active")
  })
}

if (fecharModalVenda) fecharModalVenda.addEventListener("click", () => modalVenda?.classList.remove("active"))

if (salvarVenda) {
  salvarVenda.addEventListener("click", () => {
    const cliente = document.getElementById("clienteVenda").value
    const produtoId = Number(document.getElementById("produtoVenda").value)
    const quantidade = Number(document.getElementById("quantidadeVenda").value)
    const pagamento = document.getElementById("pagamentoVenda").value

    if (!cliente || !produtoId || !quantidade || !pagamento) {
      alert("Preencha todos os campos da venda")
      return
    }

    const produto = produtosSalvos.find((item) => item.id === produtoId)
    if (!produto) {
      alert("Produto não encontrado")
      return
    }

    if (quantidade > produto.estoque) {
      alert("Estoque insuficiente para essa venda")
      return
    }

    const novaVenda = {
      id: Date.now(),
      cliente,
      produto: produto.nome,
      produtoId: produto.id,
      quantidade,
      pagamento,
      total: produto.venda * quantidade,
      lucro: (produto.venda - produto.custo) * quantidade,
      status: pagamento === "Fiado" ? "Pendente" : "Pago",
    }

    vendasSalvas.push(novaVenda)
    produto.estoque -= quantidade

    registrarVendaNoFinanceiro(novaVenda)

    salvarVendasLocalStorage()
    salvarLocalStorage()

    carregarVendas()
    carregarProdutos()
    atualizarDashboard()
    atualizarResumo()
    atualizarDashboardVendas()
    carregarEstoque()
    carregarProdutosEntrada()
    carregarProdutosSaida()
    carregarRelatorios()
    carregarAlertasDashboard()

    modalVenda?.classList.remove("active")

    document.getElementById("clienteVenda").value = ""
    document.getElementById("produtoVenda").value = ""
    document.getElementById("quantidadeVenda").value = ""
    document.getElementById("pagamentoVenda").value = ""
  })
}

function atualizarDashboardVendas() {
  const vendasTotalEl = document.getElementById("vendasTotal")
  const vendasPedidosEl = document.getElementById("vendasPedidos")
  const vendasLucroEl = document.getElementById("vendasLucro")
  const vendasFiadoEl = document.getElementById("vendasFiado")

  if (!vendasTotalEl) return

  let total = 0
  let lucro = 0
  let fiado = 0

  vendasSalvas.forEach((venda) => {
    total += venda.total
    lucro += venda.lucro
    if (statusVenda(venda) === "Pendente") fiado += venda.total
  })

  vendasTotalEl.innerText = formatarMoeda(total)
  vendasPedidosEl.innerText = vendasSalvas.length
  vendasLucroEl.innerText = formatarMoeda(lucro)
  vendasFiadoEl.innerText = formatarMoeda(fiado)
}

/* =========================
   MATÉRIA-PRIMA
========================= */

const modalMateria = document.getElementById("modalMateria")
const abrirModalMateria = document.getElementById("abrirModalMateria")
const fecharModalMateria = document.getElementById("fecharModalMateria")
const salvarMateria = document.getElementById("salvarMateria")
const tabelaMateria = document.getElementById("tabelaMateria")

function salvarMateriasLocalStorage() {
  setStorage("materiasPrimas", materiasSalvas)
}

function carregarMaterias() {
  if (!tabelaMateria) return
  tabelaMateria.innerHTML = ""

  materiasSalvas.forEach((materia) => {
    const custoUnidade = materia.valorPago / materia.quantidade

    tabelaMateria.innerHTML += `
      <tr>
        <td>${materia.nome}</td>
        <td>${materia.quantidade}</td>
        <td>${materia.unidade}</td>
        <td>${formatarMoeda(materia.valorPago)}</td>
        <td>${formatarMoeda(custoUnidade)}</td>
        <td class="orange">${materia.estoque} ${materia.unidade}</td>
        <td class="${materia.estoque <= 2 ? "red" : "green"}">
          ${materia.estoque <= 2 ? "Baixo" : "Disponível"}
        </td>
        <td><button onclick="excluirMateria(${materia.id})">Excluir</button></td>
      </tr>
    `
  })
}

function atualizarDashboardMateria() {
  const totalEl = document.getElementById("materiaTotalItens")
  const investidoEl = document.getElementById("materiaInvestido")
  const criticoEl = document.getElementById("materiaCritico")
  const custoMedioEl = document.getElementById("materiaCustoMedio")

  if (!totalEl) return

  let investido = 0
  let critico = 0

  materiasSalvas.forEach((materia) => {
    investido += materia.valorPago
    if (materia.estoque <= 2) critico++
  })

  const custoMedio = materiasSalvas.length ? investido / materiasSalvas.length : 0

  totalEl.innerText = materiasSalvas.length
  investidoEl.innerText = formatarMoeda(investido)
  criticoEl.innerText = critico
  custoMedioEl.innerText = formatarMoeda(custoMedio)
}

function excluirMateria(id) {
  materiasSalvas = materiasSalvas.filter((materia) => materia.id !== id)
  financeiroSalvo = financeiroSalvo.filter((movimentacao) => movimentacao.materiaId !== id)

  salvarMateriasLocalStorage()
  salvarFinanceiroLocalStorage()

  carregarMaterias()
  atualizarDashboardMateria()
  carregarFinanceiro()
  atualizarDashboardFinanceiro()
  carregarAlertasDashboard()
}

if (abrirModalMateria) abrirModalMateria.addEventListener("click", () => modalMateria?.classList.add("active"))
if (fecharModalMateria) fecharModalMateria.addEventListener("click", () => modalMateria?.classList.remove("active"))

if (salvarMateria) {
  salvarMateria.addEventListener("click", () => {
    const nome = document.getElementById("materiaNome").value
    const quantidade = Number(document.getElementById("materiaQuantidade").value)
    const unidade = document.getElementById("materiaUnidade").value
        const valorPago = Number(document.getElementById("materiaValorPago").value)
    const estoque = Number(document.getElementById("materiaEstoque").value)

    if (!nome || !quantidade || !unidade || !valorPago || !estoque) {
      alert("Preencha todos os campos")
      return
    }

    const novaMateria = {
      id: Date.now(),
      nome,
      quantidade,
      unidade,
      valorPago,
      estoque,
    }

    materiasSalvas.push(novaMateria)

    financeiroSalvo.push({
      id: Date.now() + 20,
      materiaId: novaMateria.id,
      descricao: `Compra de matéria-prima: ${novaMateria.nome}`,
      tipo: "Saída",
      categoria: "Matéria-prima",
      valor: novaMateria.valorPago,
      data: dataAtual(),
    })

    salvarMateriasLocalStorage()
    salvarFinanceiroLocalStorage()

    carregarMaterias()
    atualizarDashboardMateria()
    carregarFinanceiro()
    atualizarDashboardFinanceiro()
    carregarAlertasDashboard()

    modalMateria?.classList.remove("active")

    document.getElementById("materiaNome").value = ""
    document.getElementById("materiaQuantidade").value = ""
    document.getElementById("materiaUnidade").value = ""
    document.getElementById("materiaValorPago").value = ""
    document.getElementById("materiaEstoque").value = ""
  })
}

/* =========================
   FABRICAÇÃO
========================= */

const modalFabricacao = document.getElementById("modalFabricacao")
const abrirModalFabricacao = document.getElementById("abrirModalFabricacao")
const fecharModalFabricacao = document.getElementById("fecharModalFabricacao")
const salvarFabricacao = document.getElementById("salvarFabricacao")
const fabricacaoReceita = document.getElementById("fabricacaoReceita")
const tabelaFabricacao = document.getElementById("tabelaFabricacao")

function salvarFabricacoesLocalStorage() {
  setStorage("fabricacoes", fabricacoesSalvas)
}

function carregarReceitasFabricacao() {
  if (!fabricacaoReceita) return

  fabricacaoReceita.innerHTML = `<option value="">Selecione a receita</option>`

  receitasSalvas.forEach((receita) => {
    fabricacaoReceita.innerHTML += `
      <option value="${receita.id}">${receita.nome}</option>
    `
  })
}

function carregarFabricacoes() {
  if (!tabelaFabricacao) return

  tabelaFabricacao.innerHTML = ""

  fabricacoesSalvas.forEach((fabricacao) => {
    tabelaFabricacao.innerHTML += `
      <tr>
        <td>${fabricacao.produto}</td>
        <td>${fabricacao.quantidade} kg</td>
        <td>${formatarMoeda(fabricacao.custoTotal)}</td>
        <td>${formatarMoeda(fabricacao.custoKg)}</td>
        <td>${fabricacao.data}</td>
        <td>
          <button onclick="excluirFabricacao(${fabricacao.id})">Excluir</button>
        </td>
      </tr>
    `
  })
}

function atualizarDashboardFabricacao() {
  const totalEl = document.getElementById("fabricacaoTotal")
  const custoEl = document.getElementById("fabricacaoCusto")
  const kgEl = document.getElementById("fabricacaoKg")
  const custoKgEl = document.getElementById("fabricacaoCustoKg")

  if (!totalEl) return

  let custoTotal = 0
  let kgTotal = 0

  fabricacoesSalvas.forEach((fabricacao) => {
    custoTotal += fabricacao.custoTotal
    kgTotal += fabricacao.quantidade
  })

  const custoMedioKg = kgTotal ? custoTotal / kgTotal : 0

  totalEl.innerText = fabricacoesSalvas.length
  custoEl.innerText = formatarMoeda(custoTotal)
  kgEl.innerText = `${kgTotal} kg`
  custoKgEl.innerText = formatarMoeda(custoMedioKg)
}

function excluirFabricacao(id) {
  fabricacoesSalvas = fabricacoesSalvas.filter(
    (fabricacao) => fabricacao.id !== id
  )

  salvarFabricacoesLocalStorage()
  carregarFabricacoes()
  atualizarDashboardFabricacao()
}

if (abrirModalFabricacao) {
  abrirModalFabricacao.addEventListener("click", () => {
    carregarReceitasFabricacao()
    modalFabricacao?.classList.add("active")
  })
}

if (fecharModalFabricacao) {
  fecharModalFabricacao.addEventListener("click", () => {
    modalFabricacao?.classList.remove("active")
  })
}

if (salvarFabricacao) {
  salvarFabricacao.addEventListener("click", () => {
    const receitaId = Number(document.getElementById("fabricacaoReceita").value)
    const receita = receitasSalvas.find((item) => item.id === receitaId)

    if (!receita) {
      alert("Selecione uma receita")
      return
    }

    const produto = receita.nome
    const quantidade = Number(document.getElementById("fabricacaoQuantidade").value)
    const vendaKg = Number(document.getElementById("fabricacaoVendaKg").value)

    if (!quantidade || !vendaKg) {
      alert("Preencha quantidade e preço de venda")
      return
    }

    let custoCalculado = 0

    for (const ingrediente of receita.ingredientes) {
      const materia = materiasSalvas.find(
        (item) => item.id === ingrediente.materiaId
      )

      if (!materia) {
        alert(`Matéria-prima não encontrada: ${ingrediente.nome}`)
        return
      }

      const quantidadeUsada = ingrediente.quantidade * quantidade

      if (materia.estoque < quantidadeUsada) {
        alert(`Estoque insuficiente de ${materia.nome}`)
        return
      }

      const custoUnidade = materia.valorPago / materia.quantidade
      custoCalculado += custoUnidade * quantidadeUsada
    }

    const custoTotalReal = custoCalculado
    const custoKg = custoTotalReal / quantidade

    const novaFabricacao = {
      id: Date.now(),
      produto,
      quantidade,
      custoTotal: custoTotalReal,
      custoKg,
      vendaKg,
      data: dataAtual(),
    }

    fabricacoesSalvas.push(novaFabricacao)

    receita.ingredientes.forEach((ingrediente) => {
      const materia = materiasSalvas.find(
        (item) => item.id === ingrediente.materiaId
      )

      if (materia) {
        materia.estoque -= ingrediente.quantidade * quantidade
      }
    })

    produtosSalvos.push({
      id: Date.now() + 1,
      nome: produto,
      categoria: "Produto final",
      custo: custoKg,
      venda: vendaKg,
      estoque: quantidade,
    })

    salvarFabricacoesLocalStorage()
    salvarLocalStorage()
    salvarMateriasLocalStorage()

    carregarFabricacoes()
    atualizarDashboardFabricacao()
    carregarProdutos()
    atualizarDashboard()
    atualizarResumo()
    carregarMaterias()
    atualizarDashboardMateria()
    carregarEstoque()
    carregarAlertasDashboard()

    modalFabricacao?.classList.remove("active")

    document.getElementById("fabricacaoReceita").value = ""
    document.getElementById("fabricacaoQuantidade").value = ""
    document.getElementById("fabricacaoVendaKg").value = ""

    const custoTotalInput = document.getElementById("fabricacaoCustoTotal")
    if (custoTotalInput) custoTotalInput.value = ""
  })
}

/* =========================
   RECEITAS
========================= */

const modalReceita = document.getElementById("modalReceita")
const abrirModalReceita = document.getElementById("abrirModalReceita")
const fecharModalReceita = document.getElementById("fecharModalReceita")
const salvarReceita = document.getElementById("salvarReceita")
const receitaMateria = document.getElementById("receitaMateria")
const adicionarIngrediente = document.getElementById("adicionarIngrediente")
const listaIngredientes = document.getElementById("listaIngredientes")
const tabelaReceitas = document.getElementById("tabelaReceitas")

function salvarReceitasLocalStorage() {
  setStorage("receitas", receitasSalvas)
}

function carregarMateriasReceita() {
  if (!receitaMateria) return

  receitaMateria.innerHTML = `<option value="">Selecione uma matéria-prima</option>`

  materiasSalvas.forEach((materia) => {
    receitaMateria.innerHTML += `
      <option value="${materia.id}">${materia.nome}</option>
    `
  })
}

function renderizarIngredientes() {
  if (!listaIngredientes) return

  listaIngredientes.innerHTML = ""

  ingredientesReceita.forEach((ingrediente, index) => {
    listaIngredientes.innerHTML += `
      <div class="ingrediente-item">
        <div>
          <strong>${ingrediente.nome}</strong>
          <span>${ingrediente.quantidade} ${ingrediente.unidade}</span>
        </div>

        <button onclick="removerIngrediente(${index})">X</button>
      </div>
    `
  })
}

function removerIngrediente(index) {
  ingredientesReceita.splice(index, 1)
  renderizarIngredientes()
}

if (abrirModalReceita) {
  abrirModalReceita.addEventListener("click", () => {
    carregarMateriasReceita()
    modalReceita?.classList.add("active")
  })
}

if (fecharModalReceita) {
  fecharModalReceita.addEventListener("click", () => {
    modalReceita?.classList.remove("active")
  })
}

if (adicionarIngrediente) {
  adicionarIngrediente.addEventListener("click", () => {
    const materiaId = Number(receitaMateria.value)
    const quantidade = Number(document.getElementById("receitaQuantidade").value)

    if (!materiaId || !quantidade) {
      alert("Selecione ingrediente e quantidade")
      return
    }

    const materia = materiasSalvas.find((item) => item.id === materiaId)
    if (!materia) return

    ingredientesReceita.push({
      materiaId: materia.id,
      nome: materia.nome,
      quantidade,
      unidade: materia.unidade,
      custo: (materia.valorPago / materia.quantidade) * quantidade,
    })

    renderizarIngredientes()

    receitaMateria.value = ""
    document.getElementById("receitaQuantidade").value = ""
  })
}

function carregarReceitas() {
  if (!tabelaReceitas) return

  tabelaReceitas.innerHTML = ""

  receitasSalvas.forEach((receita) => {
    const custoTotal = receita.ingredientes.reduce(
      (total, ingrediente) => total + ingrediente.custo,
      0
    )

    const custoKg = custoTotal / receita.rendimentoKg

    tabelaReceitas.innerHTML += `
      <tr>
        <td>${receita.nome}</td>
        <td>${receita.rendimentoKg} kg</td>
        <td>${receita.ingredientes.length}</td>
        <td>${formatarMoeda(custoTotal)}</td>
        <td class="green">${formatarMoeda(custoKg)}</td>
        <td>
          <button onclick="excluirReceita(${receita.id})">Excluir</button>
        </td>
      </tr>
    `
  })
}

function atualizarDashboardReceitas() {
  const totalEl = document.getElementById("receitasTotal")
  const custoMedioEl = document.getElementById("receitasCustoMedio")
  const ingredientesEl = document.getElementById("receitasIngredientes")
  const maiorCustoEl = document.getElementById("receitasMaiorCusto")

  if (!totalEl) return

  let custoTotal = 0
  let ingredientesTotal = 0
  let maiorCusto = 0

  receitasSalvas.forEach((receita) => {
    const custo = receita.ingredientes.reduce(
      (total, ingrediente) => total + ingrediente.custo,
      0
    )

    custoTotal += custo
    ingredientesTotal += receita.ingredientes.length

    if (custo > maiorCusto) maiorCusto = custo
  })

  const custoMedio = receitasSalvas.length ? custoTotal / receitasSalvas.length : 0

  totalEl.innerText = receitasSalvas.length
  custoMedioEl.innerText = formatarMoeda(custoMedio)
  ingredientesEl.innerText = ingredientesTotal
  maiorCustoEl.innerText = formatarMoeda(maiorCusto)
}

function excluirReceita(id) {
  receitasSalvas = receitasSalvas.filter((receita) => receita.id !== id)

  salvarReceitasLocalStorage()
  carregarReceitas()
  atualizarDashboardReceitas()
  carregarReceitasFabricacao()
}

if (salvarReceita) {
  salvarReceita.addEventListener("click", () => {
    const nome = document.getElementById("receitaNome").value
    const rendimentoKg = Number(document.getElementById("receitaRendimento").value)

    if (!nome || !rendimentoKg) {
      alert("Preencha nome e rendimento")
      return
    }

    if (ingredientesReceita.length === 0) {
      alert("Adicione ingredientes")
      return
    }

    receitasSalvas.push({
      id: Date.now(),
      nome,
      rendimentoKg,
      ingredientes: ingredientesReceita,
    })

    salvarReceitasLocalStorage()
    carregarReceitas()
    atualizarDashboardReceitas()
    carregarReceitasFabricacao()

    modalReceita?.classList.remove("active")

    document.getElementById("receitaNome").value = ""
    document.getElementById("receitaRendimento").value = ""
    ingredientesReceita = []
    renderizarIngredientes()
  })
}

/* =========================
   ESTOQUE
========================= */

const modalEntrada = document.getElementById("modalEntrada")
const abrirModalEntrada = document.getElementById("abrirModalEntrada")
const fecharModalEntrada = document.getElementById("fecharModalEntrada")
const salvarEntrada = document.getElementById("salvarEntrada")
const produtoEntrada = document.getElementById("produtoEntrada")
const tabelaEstoque = document.getElementById("tabelaEstoque")

function carregarProdutosEntrada() {
  if (!produtoEntrada) return

  produtoEntrada.innerHTML = `<option value="">Selecione o produto</option>`

  produtosSalvos.forEach((produto) => {
    produtoEntrada.innerHTML += `
      <option value="${produto.id}">
        ${produto.nome} - Estoque: ${produto.estoque}
      </option>
    `
  })
}

function carregarEstoque() {
  if (!tabelaEstoque) return

  tabelaEstoque.innerHTML = ""

  produtosSalvos.forEach((produto) => {
    tabelaEstoque.innerHTML += `
      <tr>
        <td>${produto.nome}</td>
        <td class="${produto.estoque <= 5 ? "red" : "orange"}">
          ${produto.estoque} un.
        </td>
        <td>10</td>
        <td>${dataAtual()}</td>
        <td class="${produto.estoque <= 5 ? "red" : "green"}">
          ${produto.estoque <= 5 ? "Baixo estoque" : "Disponível"}
        </td>
        <td>
          <button onclick="abrirEntradaRapida(${produto.id})">Entrada</button>
          <button onclick="abrirSaidaRapida(${produto.id})">Saída</button>
        </td>
      </tr>
    `
  })
}

function abrirEntradaRapida(id) {
  carregarProdutosEntrada()

  if (produtoEntrada) produtoEntrada.value = id

  modalEntrada?.classList.add("active")
}

if (abrirModalEntrada) {
  abrirModalEntrada.addEventListener("click", () => {
    carregarProdutosEntrada()
    modalEntrada?.classList.add("active")
  })
}

if (fecharModalEntrada) {
  fecharModalEntrada.addEventListener("click", () => {
    modalEntrada?.classList.remove("active")
  })
}

if (salvarEntrada) {
  salvarEntrada.addEventListener("click", () => {
    const produtoId = Number(produtoEntrada.value)
    const quantidade = Number(document.getElementById("quantidadeEntrada").value)

    if (!produtoId || !quantidade) {
      alert("Selecione o produto e informe a quantidade")
      return
    }

    const produto = produtosSalvos.find((item) => item.id === produtoId)
    if (!produto) return

    produto.estoque += quantidade

    salvarLocalStorage()

    carregarProdutos()
    carregarEstoque()
    atualizarDashboard()
    atualizarResumo()
    carregarProdutosEntrada()
    carregarProdutosSaida()
    carregarAlertasDashboard()

    modalEntrada?.classList.remove("active")

    produtoEntrada.value = ""
    document.getElementById("quantidadeEntrada").value = ""
  })
}

const modalSaida = document.getElementById("modalSaida")
const fecharModalSaida = document.getElementById("fecharModalSaida")
const salvarSaida = document.getElementById("salvarSaida")
const produtoSaida = document.getElementById("produtoSaida")

function carregarProdutosSaida() {
  if (!produtoSaida) return

  produtoSaida.innerHTML = `<option value="">Selecione o produto</option>`

  produtosSalvos.forEach((produto) => {
    produtoSaida.innerHTML += `
      <option value="${produto.id}">
        ${produto.nome} - Estoque: ${produto.estoque}
      </option>
    `
  })
}

function abrirSaidaRapida(id) {
  carregarProdutosSaida()

  if (produtoSaida) produtoSaida.value = id

  modalSaida?.classList.add("active")
}

if (fecharModalSaida) {
  fecharModalSaida.addEventListener("click", () => {
    modalSaida?.classList.remove("active")
  })
}

if (salvarSaida) {
  salvarSaida.addEventListener("click", () => {
    const produtoId = Number(produtoSaida.value)
    const quantidade = Number(document.getElementById("quantidadeSaida").value)

    if (!produtoId || !quantidade) {
      alert("Selecione o produto e informe a quantidade")
      return
    }

    const produto = produtosSalvos.find((item) => item.id === produtoId)
    if (!produto) return

    if (quantidade > produto.estoque) {
      alert("Estoque insuficiente")
      return
    }

    produto.estoque -= quantidade

    salvarLocalStorage()

    carregarProdutos()
    carregarEstoque()
    atualizarDashboard()
    atualizarResumo()
    carregarProdutosEntrada()
    carregarProdutosSaida()
    carregarAlertasDashboard()

    modalSaida?.classList.remove("active")

    produtoSaida.value = ""
    document.getElementById("quantidadeSaida").value = ""
  })
}

/* =========================
   CLIENTES
========================= */

const modalCliente = document.getElementById("modalCliente")
const abrirModalCliente = document.getElementById("abrirModalCliente")
const fecharModalCliente = document.getElementById("fecharModalCliente")
const salvarCliente = document.getElementById("salvarCliente")
const tabelaClientes = document.getElementById("tabelaClientes")

function salvarClientesLocalStorage() {
  setStorage("clientes", clientesSalvos)
}

function carregarClientes() {
  if (!tabelaClientes) return

  tabelaClientes.innerHTML = ""

  clientesSalvos.forEach((cliente) => {
    tabelaClientes.innerHTML += `
      <tr>
        <td>${cliente.nome}</td>
        <td>${cliente.telefone}</td>
        <td>${cliente.endereco || "-"}</td>
        <td>${cliente.observacao || "-"}</td>
        <td class="green">Ativo</td>
        <td>
          <button onclick="excluirCliente(${cliente.id})">Excluir</button>
        </td>
      </tr>
    `
  })
}

function atualizarDashboardClientes() {
  const totalEl = document.getElementById("clientesTotal")
  const ativosEl = document.getElementById("clientesAtivos")
  const pendentesEl = document.getElementById("clientesPendentes")
  const recebimentosEl = document.getElementById("clientesRecebimentos")

  if (!totalEl) return

  const fiadosPendentes = vendasSalvas
    .filter((venda) => statusVenda(venda) === "Pendente")
    .reduce((total, venda) => total + venda.total, 0)

  totalEl.innerText = clientesSalvos.length
  ativosEl.innerText = clientesSalvos.length
  pendentesEl.innerText = formatarMoeda(fiadosPendentes)
  recebimentosEl.innerText = formatarMoeda(0)
}

function excluirCliente(id) {
  clientesSalvos = clientesSalvos.filter((cliente) => cliente.id !== id)

  salvarClientesLocalStorage()
  carregarClientes()
  atualizarDashboardClientes()
}

if (abrirModalCliente) {
  abrirModalCliente.addEventListener("click", () => {
    modalCliente?.classList.add("active")
  })
}

if (fecharModalCliente) {
  fecharModalCliente.addEventListener("click", () => {
    modalCliente?.classList.remove("active")
  })
}

if (salvarCliente) {
  salvarCliente.addEventListener("click", () => {
    const nome = document.getElementById("clienteNome").value
    const telefone = document.getElementById("clienteTelefone").value
    const endereco = document.getElementById("clienteEndereco").value
    const observacao = document.getElementById("clienteObservacao").value

    if (!nome || !telefone) {
      alert("Preencha pelo menos nome e telefone")
      return
    }

    clientesSalvos.push({
      id: Date.now(),
      nome,
      telefone,
      endereco,
      observacao,
    })

    salvarClientesLocalStorage()
    carregarClientes()
    atualizarDashboardClientes()

    modalCliente?.classList.remove("active")

    document.getElementById("clienteNome").value = ""
    document.getElementById("clienteTelefone").value = ""
    document.getElementById("clienteEndereco").value = ""
    document.getElementById("clienteObservacao").value = ""
  })
}

/* =========================
   FINANCEIRO
========================= */

const modalFinanceiro = document.getElementById("modalFinanceiro")
const abrirModalFinanceiro = document.getElementById("abrirModalFinanceiro")
const fecharModalFinanceiro = document.getElementById("fecharModalFinanceiro")
const salvarFinanceiro = document.getElementById("salvarFinanceiro")
const tabelaFinanceiro = document.getElementById("tabelaFinanceiro")

function salvarFinanceiroLocalStorage() {
  setStorage("financeiro", financeiroSalvo)
}

function registrarVendaNoFinanceiro(venda) {
  if (venda.pagamento === "Fiado") return

  financeiroSalvo.push({
    id: Date.now() + 10,
    vendaId: venda.id,
    descricao: `Venda para ${venda.cliente}`,
    tipo: "Entrada",
    categoria: `Venda - ${venda.pagamento}`,
    valor: venda.total,
    data: dataAtual(),
  })

  salvarFinanceiroLocalStorage()
  carregarFinanceiro()
  atualizarDashboardFinanceiro()
}

function carregarFinanceiro() {
  if (!tabelaFinanceiro) return

  tabelaFinanceiro.innerHTML = ""

  financeiroSalvo.forEach((movimentacao) => {
    tabelaFinanceiro.innerHTML += `
      <tr>
        <td>${movimentacao.descricao}</td>

        <td class="${movimentacao.tipo === "Entrada" ? "green" : "red"}">
          ${movimentacao.tipo}
        </td>

        <td>${movimentacao.categoria}</td>

        <td class="${movimentacao.tipo === "Entrada" ? "green" : "red"}">
          ${formatarMoeda(movimentacao.valor)}
        </td>

        <td>${movimentacao.data}</td>

        <td>
          <button onclick="excluirFinanceiro(${movimentacao.id})">Excluir</button>
        </td>
      </tr>
    `
  })
}

function atualizarDashboardFinanceiro() {
  const entradasEl = document.getElementById("financeiroEntradas")
  const saidasEl = document.getElementById("financeiroSaidas")
  const saldoEl = document.getElementById("financeiroSaldo")
  const totalEl = document.getElementById("financeiroTotal")

  if (!entradasEl) return

  let entradas = 0
  let saidas = 0

  financeiroSalvo.forEach((movimentacao) => {
    if (movimentacao.tipo === "Entrada") {
      entradas += movimentacao.valor
    } else {
      saidas += movimentacao.valor
    }
  })

  const saldo = entradas - saidas

  entradasEl.innerText = formatarMoeda(entradas)
  saidasEl.innerText = formatarMoeda(saidas)
  saldoEl.innerText = formatarMoeda(saldo)
  totalEl.innerText = financeiroSalvo.length

  if (saldo < 0) {
    saldoEl.classList.add("red")
    saldoEl.classList.remove("green")
  } else {
    saldoEl.classList.add("green")
    saldoEl.classList.remove("red")
  }
}

function excluirFinanceiro(id) {
  financeiroSalvo = financeiroSalvo.filter(
    (movimentacao) => movimentacao.id !== id
  )

  salvarFinanceiroLocalStorage()
  carregarFinanceiro()
  atualizarDashboardFinanceiro()
  carregarRelatorios()
}

if (abrirModalFinanceiro) {
  abrirModalFinanceiro.addEventListener("click", () => {
    modalFinanceiro?.classList.add("active")
  })
}

if (fecharModalFinanceiro) {
  fecharModalFinanceiro.addEventListener("click", () => {
    modalFinanceiro?.classList.remove("active")
  })
}

if (salvarFinanceiro) {
  salvarFinanceiro.addEventListener("click", () => {
    const descricao = document.getElementById("financeiroDescricao").value
    const tipo = document.getElementById("financeiroTipo").value
    const categoria = document.getElementById("financeiroCategoria").value
    const valor = Number(document.getElementById("financeiroValor").value)

    if (!descricao || !tipo || !categoria || !valor) {
      alert("Preencha todos os campos")
      return
    }

    financeiroSalvo.push({
      id: Date.now(),
      descricao,
      tipo,
      categoria,
      valor,
      data: dataAtual(),
    })

    salvarFinanceiroLocalStorage()
    carregarFinanceiro()
    atualizarDashboardFinanceiro()
    carregarRelatorios()

    modalFinanceiro?.classList.remove("active")

    document.getElementById("financeiroDescricao").value = ""
    document.getElementById("financeiroTipo").value = ""
    document.getElementById("financeiroCategoria").value = ""
    document.getElementById("financeiroValor").value = ""
  })
}

/* =========================
   RELATÓRIOS
========================= */

const tabelaRelatorios = document.getElementById("tabelaRelatorios")
const gerarRelatorio = document.getElementById("gerarRelatorio")
const imprimirRelatorio = document.getElementById("imprimirRelatorio")

function carregarRelatorios() {
  if (!tabelaRelatorios) return

  const faturamentoEl = document.getElementById("relatorioFaturamento")
  const lucroEl = document.getElementById("relatorioLucro")
  const pedidosEl = document.getElementById("relatorioProdutos")
  const maisVendidoEl = document.getElementById("relatorioMaisVendido")

  tabelaRelatorios.innerHTML = ""

  let faturamento = 0
  let lucro = 0
  const produtosVendidos = {}

  vendasSalvas.forEach((venda) => {
    faturamento += venda.total
    lucro += venda.lucro

    if (!produtosVendidos[venda.produto]) {
      produtosVendidos[venda.produto] = 0
    }

    produtosVendidos[venda.produto] += venda.quantidade

    tabelaRelatorios.innerHTML += `
      <tr>
        <td>${venda.cliente}</td>
        <td>${venda.produto}</td>
        <td>${venda.quantidade}</td>
        <td>${venda.pagamento}</td>
        <td class="green">${formatarMoeda(venda.total)}</td>
        <td>${statusVenda(venda)}</td>
      </tr>
    `
  })

  if (faturamentoEl) faturamentoEl.innerText = formatarMoeda(faturamento)
  if (lucroEl) lucroEl.innerText = formatarMoeda(lucro)
  if (pedidosEl) pedidosEl.innerText = vendasSalvas.length

  let maisVendido = "Nenhum"
  let maiorQuantidade = 0

  for (const produto in produtosVendidos) {
    if (produtosVendidos[produto] > maiorQuantidade) {
      maiorQuantidade = produtosVendidos[produto]
      maisVendido = produto
    }
  }

  if (maisVendidoEl) maisVendidoEl.innerText = maisVendido
}

if (gerarRelatorio) {
  gerarRelatorio.addEventListener("click", () => {
    carregarRelatorios()
  })
}

if (imprimirRelatorio) {
  imprimirRelatorio.addEventListener("click", () => {
    window.print()
  })
}

/* =========================
   GRÁFICOS / ALERTAS
========================= */

let graficoVendasInstancia = null
let graficoEstoqueInstancia = null

function carregarGraficosDashboard() {
  const graficoVendas = document.getElementById("graficoVendas")
  const graficoEstoque = document.getElementById("graficoEstoque")

  if (!graficoVendas || !graficoEstoque) return
  if (typeof Chart === "undefined") return

  if (graficoVendasInstancia) graficoVendasInstancia.destroy()
  if (graficoEstoqueInstancia) graficoEstoqueInstancia.destroy()

  const totalVendas = vendasSalvas.reduce(
    (total, venda) => total + venda.total,
    0
  )

  const totalLucro = vendasSalvas.reduce(
    (total, venda) => total + venda.lucro,
    0
  )

  graficoVendasInstancia = new Chart(graficoVendas, {
    type: "bar",
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
    data: {
      labels: ["Faturamento", "Lucro"],
      datasets: [
        {
          label: "Valores em R$",
          data: [totalVendas, totalLucro],
        },
      ],
    },
  })

  graficoEstoqueInstancia = new Chart(graficoEstoque, {
    type: "doughnut",
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
    data: {
      labels: produtosSalvos.map((produto) => produto.nome),
      datasets: [
        {
          label: "Estoque",
          data: produtosSalvos.map((produto) => produto.estoque),
        },
      ],
    },
  })
}

function carregarAlertasDashboard() {
  const listaAlertas = document.getElementById("listaAlertas")

  if (!listaAlertas) return

  listaAlertas.innerHTML = ""

  const alertas = []

  produtosSalvos.forEach((produto) => {
    if (produto.estoque <= 5) {
      alertas.push({
        texto: `Estoque baixo: ${produto.nome} com ${produto.estoque} un.`,
        tipo: "red",
      })
    }
  })

  materiasSalvas.forEach((materia) => {
    if (materia.estoque <= 2) {
      alertas.push({
        texto: `Matéria-prima baixa: ${materia.nome} com ${materia.estoque} ${materia.unidade}.`,
        tipo: "red",
      })
    }
  })

  const fiados = vendasSalvas.filter(
    (venda) => statusVenda(venda) === "Pendente"
  )

  if (fiados.length > 0) {
    alertas.push({
      texto: `Existem ${fiados.length} venda(s) fiado pendente(s).`,
      tipo: "orange",
    })
  }

  if (alertas.length === 0) {
    alertas.push({
      texto: "Tudo certo por enquanto. Nenhum alerta importante.",
      tipo: "green",
    })
  }

  alertas.forEach((alerta) => {
    listaAlertas.innerHTML += `
      <div class="alert-item ${alerta.tipo}">
        ${alerta.texto}
      </div>
    `
  })
}

/* =========================
   DARK MODE
========================= */

const toggleDark = document.getElementById("toggleDark")

function aplicarTextoDarkMode() {
  if (!toggleDark) return

  if (localStorage.getItem("tema") === "dark") {
    toggleDark.innerText = "☀️ Light mode"
  } else {
    toggleDark.innerText = "🌙 Dark mode"
  }
}

if (localStorage.getItem("tema") === "dark") {
  document.documentElement.classList.add("dark")
  document.body.classList.add("dark")
}

aplicarTextoDarkMode()

if (toggleDark) {
  toggleDark.addEventListener("click", () => {
    const darkAtivo = !document.documentElement.classList.contains("dark")

    document.documentElement.classList.toggle("dark", darkAtivo)
    document.body.classList.toggle("dark", darkAtivo)

    localStorage.setItem("tema", darkAtivo ? "dark" : "light")

    aplicarTextoDarkMode()
  })
}

/* =========================
   MENU MOBILE
========================= */

const abrirMenuMobile = document.getElementById("abrirMenuMobile")
const overlayMenu = document.getElementById("overlayMenu")
const sidebar = document.querySelector(".sidebar")

if (abrirMenuMobile && sidebar && overlayMenu) {
  abrirMenuMobile.addEventListener("click", () => {
    sidebar.classList.add("active")
    overlayMenu.classList.add("active")
  })

  overlayMenu.addEventListener("click", () => {
    sidebar.classList.remove("active")
    overlayMenu.classList.remove("active")
  })

  const linksMenu = sidebar.querySelectorAll("a")

  linksMenu.forEach((link) => {
    link.addEventListener("click", () => {
      sidebar.classList.remove("active")
      overlayMenu.classList.remove("active")
    })
  })
}

/* =========================
   SERVICE WORKER
========================= */

if ("serviceWorker" in navigator) {
  const caminhoSW = window.location.pathname.includes("/pages/")
    ? "../service-worker.js"
    : "./service-worker.js"

  navigator.serviceWorker.register(caminhoSW)
}

/* =========================
   USUÁRIOS
========================= */

const modalUsuario = document.getElementById("modalUsuario")
const abrirModalUsuario = document.getElementById("abrirModalUsuario")
const fecharModalUsuario = document.getElementById("fecharModalUsuario")
const salvarUsuario = document.getElementById("salvarUsuario")
const tabelaUsuarios = document.getElementById("tabelaUsuarios")

let usuariosSalvos = getStorage("usuarios", [
  {
    id: 1,
    nome: "Manoel",
    login: "manoel",
    senha: "1234",
    perfil: "Admin",
    status: "Ativo",
  },
])

function salvarUsuariosLocalStorage() {
  setStorage("usuarios", usuariosSalvos)
}

function carregarUsuarios() {
  if (!tabelaUsuarios) return

  tabelaUsuarios.innerHTML = ""

  usuariosSalvos.forEach((usuario) => {
    tabelaUsuarios.innerHTML += `
      <tr>
        <td>${usuario.nome}</td>
        <td>${usuario.login}</td>
        <td>${usuario.perfil}</td>
        <td class="green">${usuario.status || "Ativo"}</td>
        <td>
          <button onclick="excluirUsuario(${usuario.id})">Excluir</button>
        </td>
      </tr>
    `
  })
}

function atualizarDashboardUsuarios() {
  const totalEl = document.getElementById("usuariosTotal")
  const adminsEl = document.getElementById("usuariosAdmins")
  const funcionariosEl = document.getElementById("usuariosFuncionarios")

  if (!totalEl) return

  const admins = usuariosSalvos.filter(
    (usuario) => usuario.perfil === "Admin"
  ).length

  const funcionarios = usuariosSalvos.filter(
    (usuario) => usuario.perfil === "Funcionário"
  ).length

  totalEl.innerText = usuariosSalvos.length
  adminsEl.innerText = admins
  funcionariosEl.innerText = funcionarios
}

function excluirUsuario(id) {
  if (usuariosSalvos.length === 1) {
    alert("Não é possível excluir o único usuário do sistema")
    return
  }

  usuariosSalvos = usuariosSalvos.filter((usuario) => usuario.id !== id)

  salvarUsuariosLocalStorage()
  carregarUsuarios()
  atualizarDashboardUsuarios()
}

if (abrirModalUsuario) {
  abrirModalUsuario.addEventListener("click", () => {
    modalUsuario?.classList.add("active")
  })
}

if (fecharModalUsuario) {
  fecharModalUsuario.addEventListener("click", () => {
    modalUsuario?.classList.remove("active")
  })
}

if (salvarUsuario) {
  salvarUsuario.addEventListener("click", () => {
    const nome = document.getElementById("usuarioNome").value
    const login = document.getElementById("usuarioLogin").value
    const senha = document.getElementById("usuarioSenha").value
    const perfil = document.getElementById("usuarioPerfil").value

    if (!nome || !login || !senha || !perfil) {
      alert("Preencha todos os campos")
      return
    }

    const usuarioExiste = usuariosSalvos.some(
      (usuario) => usuario.login.toLowerCase() === login.toLowerCase()
    )

    if (usuarioExiste) {
      alert("Esse usuário já existe")
      return
    }

    usuariosSalvos.push({
      id: Date.now(),
      nome,
      login,
      senha,
      perfil,
      status: "Ativo",
    })

    salvarUsuariosLocalStorage()
    carregarUsuarios()
    atualizarDashboardUsuarios()

    modalUsuario?.classList.remove("active")

    document.getElementById("usuarioNome").value = ""
    document.getElementById("usuarioLogin").value = ""
    document.getElementById("usuarioSenha").value = ""
    document.getElementById("usuarioPerfil").value = ""
  })
}

/* =========================
   USUÁRIO LOGADO / PERMISSÕES
========================= */

function aplicarUsuarioLogado() {
  const nomeUsuario = localStorage.getItem("usuarioLogado") || "Usuário"
  const perfilUsuario = localStorage.getItem("perfilUsuario") || "Funcionário"

  const usuarioNomeSidebar = document.getElementById("usuarioNomeSidebar")
  const usuarioPerfilSidebar = document.getElementById("usuarioPerfilSidebar")
  const avatarUsuario = document.getElementById("avatarUsuario")

  if (usuarioNomeSidebar) {
    usuarioNomeSidebar.innerText = nomeUsuario
  }

  if (usuarioPerfilSidebar) {
    usuarioPerfilSidebar.innerText = perfilUsuario
  }

  if (avatarUsuario) {
    avatarUsuario.innerText = nomeUsuario.charAt(0).toUpperCase()
  }
}

function aplicarPermissoes() {
  const perfilUsuario = localStorage.getItem("perfilUsuario") || "Funcionário"

  const itensAdmin = document.querySelectorAll("[data-admin='true']")

  if (perfilUsuario !== "Admin") {
    itensAdmin.forEach((item) => {
      item.style.display = "none"
    })

    const paginaAtual = window.location.pathname

    const paginasBloqueadas = [
      "usuarios.html",
      "financeiro.html",
    ]

    const estaEmPaginaBloqueada = paginasBloqueadas.some((pagina) =>
      paginaAtual.includes(pagina)
    )

    if (estaEmPaginaBloqueada) {
      alert("Você não tem permissão para acessar esta página")

      const caminhoResumo = window.location.pathname.includes("/pages/")
        ? "../index.html"
        : "./index.html"

      window.location.href = caminhoResumo
    }
  }
}

/* =========================
   INICIALIZAÇÃO
========================= */

function iniciarSistema() {
  carregarClientes()
  carregarProdutosSaida()
  carregarProdutosEntrada()
  carregarMateriasReceita()
  carregarReceitas()
  atualizarDashboardReceitas()
  carregarFabricacoes()
  atualizarDashboardFabricacao()
  carregarReceitasFabricacao()
  carregarMaterias()
  atualizarDashboardMateria()
  carregarProdutosNaVenda()
  carregarVendas()
  carregarProdutos()
  atualizarDashboard()
  atualizarResumo()
  atualizarDashboardVendas()
  carregarGraficosDashboard()
  carregarAlertasDashboard()
  carregarEstoque()
  atualizarDashboardClientes()
  carregarRelatorios()
  carregarFinanceiro()
  atualizarDashboardFinanceiro()
  carregarUsuarios()
  atualizarDashboardUsuarios()
  aplicarUsuarioLogado()
  aplicarPermissoes()
}

window.addEventListener("load", () => {
  document.body.classList.add("loaded")
  iniciarSistema()
})