//
// FASE 1: Modelagem dos dados (Classe Base)
//
class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }

    // Método que calcula o subtotal do produto
    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

//
// FASE 2: Gerenciamento de Estado (Memória)
//
const listaDeProdutos = [];

// 🆕 FASE 2.2: Estado auxiliar de edição
// null  -> "Modo Cadastro" (inclusão)
// número -> "Modo Edição" (índice do produto sendo editado)
let indiceEdicao = null;

//
// FASE 2.1: Persistência com localStorage
//
const CHAVE_STORAGE = "sistema_estoque_produtos";

// 1. Função para SALVAR os dados no navegador
function salvarNoLocalStorage() {
    const listaEmTexto = JSON.stringify(listaDeProdutos);
    localStorage.setItem(CHAVE_STORAGE, listaEmTexto);
}

// 2. Função para CARREGAR os dados salvos quando a página abrir
function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (dadosSalvos) {
        const produtosObjetos = JSON.parse(dadosSalvos);

        // Reinstanciamos cada produto com "new Produto()" para que
        // os objetos recuperem o método .calcularSubtotal()
        produtosObjetos.forEach((prod) => {
            const produtoInstanciado = new Produto(prod.nome, prod.preco, prod.quantidade);
            listaDeProdutos.push(produtoInstanciado);
        });
    }
}

//
// FASE 3: Captura de Elementos do DOM
//
const formProduto = document.getElementById("produto-form");
const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");
const btnSubmit = document.querySelector(".btn-primary");

//
// FASE 4: Escuta de Eventos
//

// 1. Adicionar / Editar Produto pelo Formulário
formProduto.addEventListener("submit", function (event) {
    event.preventDefault();

    // Sanitização: .trim() remove espaços no início e no fim
    const nome = document.getElementById("nome").value.trim();
    const preco = parseFloat(document.getElementById("preco").value);
    const quantidade = parseInt(document.getElementById("quantidade").value);

    // Guard Clauses: interrompem a execução se algum dado for inválido
    if (!nome) {
        alert("Por favor, informe um nome válido para o produto.");
        return;
    }

    if (isNaN(preco) || preco <= 0 || isNaN(quantidade) || quantidade <= 0) {
        alert("O preço e a quantidade devem ser valores numéricos maiores que zero.");
        return;
    }

    // Dados válidos: cria o objeto
    const novoProduto = new Produto(nome, preco, quantidade);

    if (indiceEdicao === null) {
        // MODO INCLUSÃO: adiciona ao final do array
        listaDeProdutos.push(novoProduto);
    } else {
        // MODO EDIÇÃO: substitui o item na posição correspondente
        listaDeProdutos[indiceEdicao] = novoProduto;
    }

    salvarNoLocalStorage();

    // Restauração de estado
    sairDoModoEdicao();

    atualizarInterface();
    formProduto.reset();
});

// 2. Limpar toda a tabela
btnLimparTudo.addEventListener("click", function () {
    if (listaDeProdutos.length === 0) {
        alert("A tabela já está vazia!");
        return;
    }

    if (confirm("Tem certeza que deseja remover todos os produtos?")) {
        listaDeProdutos.length = 0;
        localStorage.removeItem(CHAVE_STORAGE);

        // Se estava editando, o índice deixou de existir
        sairDoModoEdicao();
        formProduto.reset();

        atualizarInterface();
    }
});

//
// FASE 5: Funções de Atualização e Renderização da Interface
//

// 🆕 Preenche o formulário com os dados do produto e ativa o Modo Edição
function prepararEdicao(index) {
    const produto = listaDeProdutos[index];

    // 1. Preenche os campos do formulário com os dados existentes
    document.getElementById("nome").value = produto.nome;
    document.getElementById("preco").value = produto.preco;
    document.getElementById("quantidade").value = produto.quantidade;

    // 2. Transfere o estado para Modo Edição e atualiza a interface
    indiceEdicao = index;
    btnSubmit.textContent = "Salvar Alterações";
}

// 🆕 Volta ao Modo Inclusão (indiceEdicao = null e texto original do botão)
function sairDoModoEdicao() {
    indiceEdicao = null;
    btnSubmit.textContent = "Adicionar Produto";
}

// Função responsável por remover um único produto pelo índice
function removerProduto(index) {
    listaDeProdutos.splice(index, 1);
    salvarNoLocalStorage();

    // Evita editar o item errado após a remoção (os índices mudam)
    if (indiceEdicao !== null) {
        sairDoModoEdicao();
        formProduto.reset();
    }

    atualizarInterface();
}

// Função responsável por calcular e renderizar o total geral em estoque
function atualizarTotalEstoque() {
    const total = listaDeProdutos.reduce((acc, produto) => {
        return acc + produto.calcularSubtotal();
    }, 0);

    totalEstoqueEl.textContent = `Total em Estoque: R$ ${total.toFixed(2)}`;
}

// Função responsável por re-desenhar a tabela
function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");

    tabelaBody.innerHTML = "";

    listaDeProdutos.forEach((produto, index) => {
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

        // 🆕 Botão Editar chama prepararEdicao(index)
        const btnEditar = linha.querySelector(".btn-editar");
        btnEditar.addEventListener("click", () => prepararEdicao(index));

        const btnRemover = linha.querySelector(".btn-remover");
        btnRemover.addEventListener("click", () => removerProduto(index));

        tabelaBody.appendChild(linha);
    });
}

// Função principal que sincroniza a tela com os dados
function atualizarInterface() {
    renderizarTabela();
    atualizarTotalEstoque();
}

//
// FASE 6: Inicialização da Aplicação
//
carregarDoLocalStorage();
atualizarInterface();
