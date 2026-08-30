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