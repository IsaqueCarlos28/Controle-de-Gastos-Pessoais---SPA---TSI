/* ===================================
   REFERÊNCIAS DO DOM
=================================== */

const formAdd = document.getElementById('form-add');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeSelect = document.getElementById('type');
const categorySelect = document.getElementById('category');
const btnAdd = document.getElementById('btn-add');

const filterType = document.getElementById('filter-type');
const filterCategory = document.getElementById('filter-category');

const balanceEl = document.getElementById('balance');
const incomeTotalEl = document.getElementById('income-total');
const expenseTotalEl = document.getElementById('expense-total');

const transactionsContainer = document.getElementById('transactions');

/* ===================================
   ESTADO DA APLICAÇÃO
=================================== */

// Lançamentos: { id, description, amount, type: 'income'|'expense', category }
let transactions = [];

/**
 * Gera um id único combinando timestamp e um número aleatório,
 * evitando colisão entre lançamentos criados no mesmo milissegundo.
 */
function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * Monta um objeto de lançamento pronto para ser armazenado.
 */
function createTransaction(description, amount, type, category) {
    return {
        id: generateId(),
        description,
        amount: Number(amount),
        type,
        category
    };
}

/* ===================================
   ADICIONAR LANÇAMENTO
=================================== */

/**
 * Lê e valida os dados do formulário; se válidos, cria e adiciona
 * um novo lançamento ao array `transactions`.
 */
function addTransaction() {
    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeSelect.value;
    const category = categorySelect.value;

    if (!description || !amount || amount <= 0 || !type || !category) {
        return;
    }

    const transaction = createTransaction(description, amount, type, category);
    transactions.push(transaction);

    formAdd.reset();
    updateInterface();
}

/* ===================================
   RENDERIZAÇÃO
=================================== */

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

const typeLabels = {
    income: 'Receita',
    expense: 'Despesa'
};

const categoryLabels = {
    salario: 'Salário',
    alimentacao: 'Alimentação',
    lazer: 'Lazer',
    transporte: 'Transporte',
    saude: 'Saúde',
    outros: 'Outros'
};

/**
 * Cria o elemento HTML de um lançamento (linha da lista).
 */
function createTransactionElement(transaction) {
    const isIncome = transaction.type === 'income';

    const item = document.createElement('div');
    item.className = isIncome ? 'transaction-income' : 'transaction-expense';
    item.dataset.id = transaction.id;

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

    const amount = document.createElement('span');
    amount.className = `transaction-amount ${isIncome ? 'income' : 'expense'}`;
    const sign = isIncome ? '+ ' : '- ';
    amount.textContent = sign + currencyFormatter.format(transaction.amount);

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
 * Retorna um novo array com os lançamentos que passam pelos filtros
 * de tipo e categoria selecionados. Não modifica `transactions`.
 */
function getFilteredTransactions() {
    const selectedType = filterType.value;
    const selectedCategory = filterCategory.value;

    return transactions.filter((transaction) => {
        const matchesType = selectedType === 'all' || transaction.type === selectedType;
        const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
        return matchesType && matchesCategory;
    });
}

/**
 * Renderiza em #transactions apenas os lançamentos filtrados,
 * substituindo o conteúdo anterior.
 */
function renderTransactions() {
    transactionsContainer.innerHTML = '';

    getFilteredTransactions().forEach((transaction) => {
        const element = createTransactionElement(transaction);
        transactionsContainer.appendChild(element);
    });
}

/* ===================================
   RESUMO FINANCEIRO
=================================== */

/**
 * Calcula receitas, despesas e saldo com base em TODOS os
 * lançamentos (ignora filtros) e atualiza os cards na tela.
 */
function updateSummary() {
    const incomeTotal = transactions
        .filter(transaction => transaction.type === 'income')
        .reduce((total, transaction) => total + transaction.amount, 0);

    const expenseTotal = transactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((total, transaction) => total + transaction.amount, 0);

    const balance = incomeTotal - expenseTotal;

    balanceEl.textContent = currencyFormatter.format(balance);
    incomeTotalEl.textContent = currencyFormatter.format(incomeTotal);
    expenseTotalEl.textContent = currencyFormatter.format(expenseTotal);
}

/* ===================================
   REMOVER LANÇAMENTO
=================================== */

/**
 * Remove do array `transactions` o lançamento com o `id` informado.
 */
function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateInterface();
}

/* ===================================
   PERSISTÊNCIA DO ESTADO
=================================== */

const STORAGE_KEY = 'transactions';

/**
 * Salva `transactions` no localStorage.
 */
function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

/**
 * Carrega lançamentos salvos anteriormente no localStorage, se houver.
 */
function loadState() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    transactions = storedData ? JSON.parse(storedData) : [];
}

/**
 * Reflete o estado atual na interface: renderiza a lista, recalcula
 * o resumo financeiro e persiste os dados.
 */
function updateInterface() {
    renderTransactions();
    updateSummary();
    saveState();
}

/* ===================================
   EVENTOS
=================================== */

formAdd.addEventListener('submit', (event) => {
    event.preventDefault();
    addTransaction();
});

// Delegação de evento: captura o clique em qualquer botão de
// remoção, incluindo os criados dinamicamente.
transactionsContainer.addEventListener('click', (event) => {
    const removeBtn = event.target.closest('.btn-remove');
    if (!removeBtn) return;

    const id = Number(removeBtn.dataset.id);
    removeTransaction(id);
});

// Troca de filtro só re-renderiza a lista exibida; não afeta
// `transactions` nem o resumo financeiro.
filterType.addEventListener('change', renderTransactions);
filterCategory.addEventListener('change', renderTransactions);

/* ===================================
   INICIALIZAÇÃO
=================================== */

loadState();
updateInterface();