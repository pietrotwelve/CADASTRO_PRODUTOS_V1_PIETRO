class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }

    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

const listaDeProdutos = [];
let indiceEdicao = null;
let acaoConfirmadaCallback = null;

const CHAVE_STORAGE = "sistema_estoque_produtos";

function salvarNoLocalStorage() {
    const listaEmTexto = JSON.stringify(listaDeProdutos);
    localStorage.setItem(CHAVE_STORAGE, listaEmTexto);
}

function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (dadosSalvos) {
        const produtosObjetos = JSON.parse(dadosSalvos);

        produtosObjetos.forEach((prod) => {
            const produtoInstanciado = new Produto(prod.nome, prod.preco, prod.quantidade);
            listaDeProdutos.push(produtoInstanciado);
        });
    }
}

const formProduto = document.getElementById("produto-form");
const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");
const btnSubmit = document.querySelector(".btn-primary");
const inputBusca = document.getElementById("busca");
const mensagemVazia = document.getElementById("mensagem-vazia");
const mensagemErroEl = document.getElementById("mensagem-erro");

const modalConfirmacao = document.getElementById("modal-confirmacao");
const modalTextoConfirmacao = document.getElementById("modal-texto-confirmacao");
const modalBtnConfirmar = document.getElementById("modal-btn-confirmar");
const modalBtnCancelar = document.getElementById("modal-btn-cancelar");

const modalBootstrap = document.getElementById("modal-bootstrap");
const btnConceitoBootstrap = document.getElementById("btn-conceito-bootstrap");
const modalBootstrapFechar = document.getElementById("modal-bootstrap-fechar");

function exibirErroInline(mensagem) {
    mensagemErroEl.textContent = mensagem;
    mensagemErroEl.style.display = "block";
}

function limparErroInline() {
    mensagemErroEl.textContent = "";
    mensagemErroEl.style.display = "none";
}

function abrirModalConfirmacao(texto, callback) {
    modalTextoConfirmacao.textContent = texto;
    acaoConfirmadaCallback = callback;
    modalConfirmacao.style.display = "flex";
}

function fecharModalConfirmacao() {
    modalConfirmacao.style.display = "none";
    acaoConfirmadaCallback = null;
}

modalBtnConfirmar.addEventListener("click", function() {
    if (acaoConfirmadaCallback) {
        acaoConfirmadaCallback();
    }
    fecharModalConfirmacao();
});

modalBtnCancelar.addEventListener("click", fecharModalConfirmacao);

btnConceitoBootstrap.addEventListener("click", function() {
    modalBootstrap.style.display = "flex";
});

modalBootstrapFechar.addEventListener("click", function() {
    modalBootstrap.style.display = "none";
});

formProduto.addEventListener("submit", function (event) {
    event.preventDefault();
    limparErroInline();

    const nome = document.getElementById("nome").value.trim();
    const preco = parseFloat(document.getElementById("preco").value);
    const quantidade = parseInt(document.getElementById("quantidade").value);

    if (!nome) {
        exibirErroInline("Por favor, informe um nome válido para o produto.");
        return;
    }

    if (isNaN(preco) || preco <= 0 || isNaN(quantidade) || quantidade <= 0) {
        exibirErroInline("O preço e a quantidade devem ser valores numéricos maiores que zero.");
        return;
    }

    const novoProduto = new Produto(nome, preco, quantity = quantidade);

    if (indiceEdicao === null) {
        listaDeProdutos.push(novoProduto);
    } else {
        listaDeProdutos[indiceEdicao] = novoProduto;
    }

    salvarNoLocalStorage();
    sairDoModoEdicao();
    atualizarInterface();
    formProduto.reset();
});

btnLimparTudo.addEventListener("click", function () {
    if (listaDeProdutos.length === 0) {
        exibirErroInline("A tabela já está vazia!");
        return;
    }

    abrirModalConfirmacao("Tem certeza que deseja remover todos os produtos?", function() {
        listaDeProdutos.length = 0;
        localStorage.removeItem(CHAVE_STORAGE);
    
        sairDoModoEdicao();
        formProduto.reset();
        atualizarInterface();
    });
});

inputBusca.addEventListener("input", function () {
    atualizarInterface();
});

function prepararEdicao(indexReal) {
    limparErroInline();
    const produto = listaDeProdutos[indexReal];

    document.getElementById("nome").value = produto.nome;
    document.getElementById("preco").value = produto.preco;
    document.getElementById("quantidade").value = produto.quantidade;

    indiceEdicao = indexReal;
    btnSubmit.textContent = "Salvar Alterações";
}

function sairDoModoEdicao() {
    indiceEdicao = null;
    btnSubmit.textContent = "Adicionar Produto";
}

function removerProduto(indexReal) {
    abrirModalConfirmacao("Tem certeza que deseja remover este produto?", function() {
        listaDeProdutos.splice(indexReal, 1);
        salvarNoLocalStorage();

        if (indiceEdicao !== null) {
            sairDoModoEdicao();
            formProduto.reset();
        }

        atualizarInterface();
    });
}

function obterProdutosFiltrados() {
    const termo = inputBusca.value.toLowerCase();
    return listaDeProdutos.filter(produto => produto.nome.toLowerCase().includes(termo));
}

function atualizarTotalEstoque() {
    const produtosFiltrados = obterProdutosFiltrados();
    const total = produtosFiltrados.reduce((acc, produto) => {
        return acc + produto.calcularSubtotal();
    }, 0);

    totalEstoqueEl.textContent = `Total em Estoque: R$ ${total.toFixed(2)}`;
}

function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");
    tabelaBody.innerHTML = "";

    const produtosFiltrados = obterProdutosFiltrados();

    if (produtosFiltrados.length === 0) {
        mensagemVazia.style.display = "block";
    } else {
        mensagemVazia.style.display = "none";
    }

    produtosFiltrados.forEach((produto) => {
        const indexReal = listaDeProdutos.indexOf(produto);
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.calcularSubtotal().toFixed(2)}</td>
            <td>
                <button class="btn-editar">Editar</button>
                <button class="btn-remover">Remover</button>
            </td>
        `;

        const btnEditar = linha.querySelector(".btn-editar");
        btnEditar.addEventListener("click", () => prepararEdicao(indexReal));

        const btnRemover = linha.querySelector(".btn-remover");
        btnRemover.addEventListener("click", () => removerProduto(indexReal));

        tabelaBody.appendChild(linha);
    });
}

function atualizarInterface() {
    renderizarTabela();
    atualizarTotalEstoque();
}

carregarDoLocalStorage();
atualizarInterface();
