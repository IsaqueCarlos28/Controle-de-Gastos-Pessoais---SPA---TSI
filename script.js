/* ===================================
   REFERÊNCIAS DOS ELEMENTOS DO DOM
=================================== */

// Formulário de cadastro
const formAdd = document.getElementById('form-add');

// Campos do formulário
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeSelect = document.getElementById('type');
const categorySelect = document.getElementById('category');

// Botão de adicionar
const btnAdd = document.getElementById('btn-add');

// Filtros de visualização
const filterType = document.getElementById('filter-type');
const filterCategory = document.getElementById('filter-category');

// Cards de resumo financeiro
const balanceEl = document.getElementById('balance');
const incomeTotalEl = document.getElementById('income-total');
const expenseTotalEl = document.getElementById('expense-total');

// Container onde os lançamentos são exibidos
const transactionsContainer = document.getElementById('transactions');

/* ===================================
   ESTADO DA APLICAÇÃO
=================================== */

/**
 * Armazena todos os lançamentos durante a execução da aplicação.
 * Cada item segue a estrutura:
 * {
 *   id: number,          // identificador único do lançamento
 *   description: string, // descrição digitada pelo usuário
 *   amount: number,      // valor sempre armazenado como número (nunca string)
 *   type: 'income' | 'expense', // apenas esses dois valores são aceitos
 *   category: string     // categoria selecionada (ex.: 'salario', 'alimentacao')
 * }
 */
let transactions = [];

/**
 * Gera um identificador único para um novo lançamento.
 * Usa Date.now() como base pedida no requisito; se dois lançamentos
 * forem criados no mesmo milissegundo, um pequeno número aleatório
 * é somado para evitar colisão de IDs.
 * @returns {number} identificador único
 */
function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * Cria um novo objeto de lançamento já validado e pronto para
 * ser adicionado ao array `transactions`.
 * @param {string} description - descrição do lançamento
 * @param {number|string} amount - valor do lançamento (será convertido para número)
 * @param {'income'|'expense'} type - tipo do lançamento
 * @param {string} category - categoria do lançamento
 * @returns {{id: number, description: string, amount: number, type: string, category: string}}
 */
function createTransaction(description, amount, type, category) {
    return {
        id: generateId(),
        description,
        amount: Number(amount), // garante que amount seja sempre número
        type,                   // 'income' ou 'expense'
        category
    };
}

/* ===================================
   ADICIONAR LANÇAMENTO
=================================== */

/**
 * Lê os dados do formulário, valida os campos e, se estiverem
 * corretos, cria um novo lançamento e adiciona ao array `transactions`.
 */
function addTransaction() {
    // 1. Ler descrição, valor, tipo e categoria
    const description = descriptionInput.value.trim(); // 2. remove espaços extras
    const amount = Number(amountInput.value);           // 3. converte o valor para número
    const type = typeSelect.value;
    const category = categorySelect.value;

    // 4. Validar os campos
    if (!description || !amount || amount <= 0 || !type || !category) {
        return;
    }

    // 5. Criar o objeto do lançamento
    const transaction = createTransaction(description, amount, type, category);

    // 6. Adicionar o objeto ao array de lançamentos
    transactions.push(transaction);

    // 7. Limpar o formulário
    formAdd.reset();

    // 8. Atualizar a interface
    updateInterface();
}

/**
 * Atualiza a interface com base no estado atual de `transactions`
 * (lista de lançamentos e totais de receitas/despesas/saldo).
 * Implementação completa será feita na próxima etapa.
 */
function updateInterface() {
    // TODO: renderizar a lista em #transactions e recalcular os totais
}

/* ===================================
   EVENTOS
=================================== */

// Ao enviar o formulário, evita o recarregamento da página e
// executa a lógica de adicionar um novo lançamento.
formAdd.addEventListener('submit', (event) => {
    event.preventDefault();
    addTransaction();
});