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

/* ===================================
   RENDERIZAÇÃO
=================================== */

// Formata números como moeda brasileira (R$)
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

// Rótulos legíveis para o tipo do lançamento
const typeLabels = {
    income: 'Receita',
    expense: 'Despesa'
};

// Rótulos legíveis para as categorias (valores usados nos <option> do HTML)
const categoryLabels = {
    salario: 'Salário',
    alimentacao: 'Alimentação',
    lazer: 'Lazer',
    transporte: 'Transporte',
    saude: 'Saúde',
    outros: 'Outros'
};

/**
 * Cria o elemento HTML correspondente a um único lançamento.
 * @param {{id: number, description: string, amount: number, type: string, category: string}} transaction
 * @returns {HTMLElement}
 */
function createTransactionElement(transaction) {
    const isIncome = transaction.type === 'income';

    // Elemento raiz do lançamento (a cor/estilo muda via classe, ver style.css)
    const item = document.createElement('div');
    item.className = isIncome ? 'transaction-income' : 'transaction-expense';
    item.dataset.id = transaction.id;

    // Bloco de informações (descrição + tipo/categoria)
    const info = document.createElement('div');
    info.className = 'transaction-info';

    const title = document.createElement('span');
    title.className = 'transaction-title';
    title.textContent = transaction.description;

    const meta = document.createElement('span');
    meta.className = 'transaction-date';
    const categoryLabel = categoryLabels[transaction.category] || transaction.category;
    meta.textContent = `${typeLabels[transaction.type] || transaction.type} · ${categoryLabel}`;

    info.appendChild(title);
    info.appendChild(meta);

    // Valor formatado em moeda, com sinal indicando receita (+) ou despesa (-)
    const amount = document.createElement('span');
    amount.className = `transaction-amount ${isIncome ? 'income' : 'expense'}`;
    const sign = isIncome ? '+ ' : '- ';
    amount.textContent = sign + currencyFormatter.format(transaction.amount);

    // Botão de remoção do lançamento
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-remove';
    removeBtn.dataset.id = transaction.id;
    removeBtn.setAttribute('aria-label', `Remover lançamento: ${transaction.description}`);
    removeBtn.textContent = '×';

    item.appendChild(info);
    item.appendChild(amount);
    item.appendChild(removeBtn);

    return item;
}

/**
 * Retorna um NOVO array com o subconjunto de `transactions` que
 * corresponde aos filtros selecionados (tipo e categoria).
 * Não altera `transactions` em nenhum momento — apenas lê os valores
 * dos <select> de filtro e devolve uma cópia filtrada.
 * @returns {Array} lançamentos filtrados para exibição
 */
function getFilteredTransactions() {
    const selectedType = filterType.value;
    const selectedCategory = filterCategory.value;

    return transactions.filter((transaction) => {
        // 'all' significa "não filtrar por este campo"
        const matchesType = selectedType === 'all' || transaction.type === selectedType;
        const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;

        return matchesType && matchesCategory;
    });
}

/**
 * Renderiza dentro de #transactions apenas o subconjunto de
 * lançamentos que passa pelos filtros ativos (tipo e categoria),
 * substituindo o conteúdo anterior para evitar duplicações.
 * O array `transactions` original nunca é modificado aqui.
 */
function renderTransactions() {
    // Limpa o container antes de renderizar novamente (evita duplicação)
    transactionsContainer.innerHTML = '';

    // Usa a lista filtrada apenas para exibição
    const filteredTransactions = getFilteredTransactions();

    filteredTransactions.forEach((transaction) => {
        const element = createTransactionElement(transaction);
        transactionsContainer.appendChild(element);
    });
}

/**
 * Recalcula os totais de receitas, despesas e saldo com base em
 * `transactions` e atualiza os cards do resumo financeiro na tela.
 */
function updateSummary() {
    // Soma apenas os lançamentos do tipo 'income'
    const incomeTotal = transactions
        .filter(transaction => transaction.type === 'income')
        .reduce((total, transaction) => total + transaction.amount, 0);

    // Soma apenas os lançamentos do tipo 'expense'
    const expenseTotal = transactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((total, transaction) => total + transaction.amount, 0);

    // Saldo = receitas - despesas
    const balance = incomeTotal - expenseTotal;

    // Atualiza os elementos na tela já formatados como moeda
    balanceEl.textContent = currencyFormatter.format(balance);
    incomeTotalEl.textContent = currencyFormatter.format(incomeTotal);
    expenseTotalEl.textContent = currencyFormatter.format(expenseTotal);
}

/* ===================================
   REMOVER LANÇAMENTO
=================================== */

/**
 * Remove um lançamento do array `transactions` com base no seu `id`.
 * @param {number} id - identificador único do lançamento a ser removido
 */
function removeTransaction(id) {
    // Mantém no array apenas os lançamentos cujo id é diferente do informado
    transactions = transactions.filter(transaction => transaction.id !== id);

    // Atualiza a interface (renderização + resumo + persistência)
    updateInterface();
}

/* ===================================
   PERSISTÊNCIA DO ESTADO
=================================== */

// Chave usada para salvar os lançamentos no localStorage
const STORAGE_KEY = 'transactions';

/**
 * Salva o array `transactions` no localStorage, garantindo que o
 * estado da aplicação não se perca ao recarregar a página.
 */
function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

/**
 * Carrega os lançamentos previamente salvos no localStorage (se
 * existirem) e os coloca no array `transactions`.
 */
function loadState() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    transactions = storedData ? JSON.parse(storedData) : [];
}

/**
 * Atualiza a interface com base no estado atual de `transactions`
 * (lista de lançamentos e totais de receitas/despesas/saldo).
 */
function updateInterface() {
    renderTransactions();  // 1 e 2. re-renderiza a lista com o array atualizado
    updateSummary();       // 3. recalcula e exibe o resumo financeiro
    saveState();            // 4. salva o estado atual no localStorage
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

// Delegação de evento: um único listener no container cuida do clique
// de remoção de qualquer lançamento, mesmo os criados dinamicamente.
transactionsContainer.addEventListener('click', (event) => {
    const removeBtn = event.target.closest('.btn-remove');
    if (!removeBtn) return; // clique fora de um botão de remover é ignorado

    // Converte o id salvo no dataset (sempre string) de volta para número
    const id = Number(removeBtn.dataset.id);
    removeTransaction(id);
});

// Trocar o filtro de tipo (todos/receita/despesa) apenas re-renderiza
// a lista exibida; o array `transactions` e o resumo não são afetados.
filterType.addEventListener('change', renderTransactions);

// Trocar o filtro de categoria apenas re-renderiza a lista exibida;
// o array `transactions` e o resumo não são afetados.
filterCategory.addEventListener('change', renderTransactions);

/* ===================================
   INICIALIZAÇÃO
=================================== */

// Ao carregar a página, recupera lançamentos salvos anteriormente
// (se houver) e já exibe a lista e o resumo atualizados.
loadState();
updateInterface();