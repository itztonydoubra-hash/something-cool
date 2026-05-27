// Luna - Soft Life Budget Tracker Module
const Budget = {
    categories: {
        income: ['Salary', 'Freelance', 'Gift', 'Refund', 'Other Income'],
        expense: ['Food & Drinks', 'Shopping', 'Beauty & Skincare', 'Hair', 'Health', 'Transport', 'Entertainment', 'Home', 'Subscriptions', 'Self-Care', 'Gifts', 'Other']
    },

    categoryEmojis: {
        'Salary': '&#128176;',
        'Freelance': '&#128187;',
        'Gift': '&#127873;',
        'Refund': '&#128260;',
        'Other Income': '&#10024;',
        'Food & Drinks': '&#127837;',
        'Shopping': '&#128717;',
        'Beauty & Skincare': '&#129526;',
        'Hair': '&#128135;',
        'Health': '&#128154;',
        'Transport': '&#128663;',
        'Entertainment': '&#127916;',
        'Home': '&#127968;',
        'Subscriptions': '&#128241;',
        'Self-Care': '&#128134;',
        'Gifts': '&#127873;',
        'Other': '&#10024;'
    },

    getData() {
        return Storage.get('budget') || {
            transactions: [],
            monthlyBudget: 0,
            savingsGoal: { name: '', target: 0, saved: 0 }
        };
    },

    saveData(data) {
        Storage.set('budget', data);
    },

    addTransaction(name, amount, type, category, date = null) {
        const data = this.getData();
        data.transactions.push({
            id: Date.now(),
            name,
            amount: parseFloat(amount),
            type, // 'income' or 'expense'
            category,
            date: date || Storage.today()
        });
        this.saveData(data);
    },

    removeTransaction(id) {
        const data = this.getData();
        data.transactions = data.transactions.filter(t => t.id !== id);
        this.saveData(data);
        App.navigate('budget');
    },

    // Get this month's totals
    getMonthlyStats() {
        const data = this.getData();
        const now = new Date();
        const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

        const monthTransactions = data.transactions.filter(t => t.date >= monthStart);
        const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        return { income, expenses, balance: income - expenses, transactions: monthTransactions };
    },

    // Get spending by category
    getCategoryBreakdown() {
        const { transactions } = this.getMonthlyStats();
        const breakdown = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
        });
        return Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
    },

    render() {
        const data = this.getData();
        const stats = this.getMonthlyStats();
        const breakdown = this.getCategoryBreakdown();
        const recentTransactions = data.transactions.slice(-15).reverse();

        return `
            <div class="page-header">
                <h1 class="page-title">Budget</h1>
                <p class="page-subtitle">Your soft life finances</p>
            </div>

            <!-- Overview Cards -->
            <div class="budget-overview">
                <div class="budget-stat">
                    <div class="budget-stat-amount income">$${stats.income.toFixed(2)}</div>
                    <div class="budget-stat-label">Income This Month</div>
                </div>
                <div class="budget-stat">
                    <div class="budget-stat-amount expense">$${stats.expenses.toFixed(2)}</div>
                    <div class="budget-stat-label">Spent This Month</div>
                </div>
                <div class="budget-stat">
                    <div class="budget-stat-amount balance" style="color: ${stats.balance >= 0 ? 'var(--neon-green)' : 'var(--danger)'};">$${stats.balance.toFixed(2)}</div>
                    <div class="budget-stat-label">Balance</div>
                </div>
            </div>

            <!-- Quick Add -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Add Transaction</h3>
                </div>
                <div class="grid-2">
                    <div class="input-group">
                        <label class="input-label">What</label>
                        <input type="text" class="input" id="txn-name" placeholder="e.g., Coffee, Paycheck">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Amount ($)</label>
                        <input type="number" class="input" id="txn-amount" placeholder="0.00" step="0.01" min="0">
                    </div>
                </div>
                <div class="grid-2">
                    <div class="input-group">
                        <label class="input-label">Type</label>
                        <select class="input" id="txn-type" onchange="Budget.updateCategories()">
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label class="input-label">Category</label>
                        <select class="input" id="txn-category">
                            ${this.categories.expense.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <button class="btn btn-primary btn-full" onclick="Budget.handleAdd()">Add Transaction</button>
            </div>

            <!-- Spending Breakdown -->
            ${breakdown.length > 0 ? `
            <div class="card" style="margin-top: 16px;">
                <div class="card-header">
                    <h3 class="card-title">Where It's Going</h3>
                </div>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${breakdown.slice(0, 6).map(([category, amount]) => `
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 18px; width: 28px;">${this.categoryEmojis[category] || '&#10024;'}</span>
                            <div style="flex: 1;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                    <span style="font-size: 13px;">${category}</span>
                                    <span style="font-size: 13px; color: var(--neon-pink);">$${amount.toFixed(2)}</span>
                                </div>
                                <div class="progress-bar" style="height: 6px;">
                                    <div class="progress-fill" style="width: ${(amount / stats.expenses * 100)}%; background: linear-gradient(90deg, var(--neon-pink), var(--purple-primary));"></div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Recent Transactions -->
            <div class="card" style="margin-top: 16px;">
                <div class="card-header">
                    <h3 class="card-title">Recent Transactions</h3>
                </div>
                ${recentTransactions.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-state-icon">&#128176;</div>
                        <p class="empty-state-text">No transactions yet.<br>Start tracking your spending!</p>
                    </div>
                ` : `
                    <div class="transaction-list">
                        ${recentTransactions.map(t => `
                            <div class="transaction-item">
                                <div class="transaction-icon">${this.categoryEmojis[t.category] || '&#10024;'}</div>
                                <div class="transaction-details">
                                    <div class="transaction-name">${t.name}</div>
                                    <div class="transaction-category">${t.category} &middot; ${Storage.formatDate(t.date)}</div>
                                </div>
                                <div class="transaction-amount ${t.type}">${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}</div>
                                <button class="btn btn-ghost btn-sm" onclick="Budget.removeTransaction(${t.id})" style="color: var(--text-muted); font-size: 11px;">&#10005;</button>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
    },

    updateCategories() {
        const type = document.getElementById('txn-type').value;
        const categorySelect = document.getElementById('txn-category');
        const categories = this.categories[type];
        categorySelect.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
    },

    handleAdd() {
        const name = document.getElementById('txn-name').value.trim();
        const amount = document.getElementById('txn-amount').value;
        const type = document.getElementById('txn-type').value;
        const category = document.getElementById('txn-category').value;

        if (!name || !amount) {
            showToast('Please fill in name and amount');
            return;
        }

        this.addTransaction(name, amount, type, category);
        showToast(`${type === 'income' ? 'Income' : 'Expense'} added!`);
        App.navigate('budget');
    }
};
