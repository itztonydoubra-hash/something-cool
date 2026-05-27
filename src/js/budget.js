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
                    <div class="budget-stat-amount income">₦${stats.income.toFixed(2)}</div>
                    <div class="budget-stat-label">Income This Month</div>
                </div>
                <div class="budget-stat">
                    <div class="budget-stat-amount expense">₦${stats.expenses.toFixed(2)}</div>
                    <div class="budget-stat-label">Spent This Month</div>
                </div>
                <div class="budget-stat">
                    <div class="budget-stat-amount balance" style="color: ${stats.balance >= 0 ? 'var(--neon-green)' : 'var(--danger)'};">₦${stats.balance.toFixed(2)}</div>
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
                        <label class="input-label">Amount (₦)</label>
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
                                    <span style="font-size: 13px; color: var(--neon-pink);">₦${amount.toFixed(2)}</span>
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

            <!-- Should I Buy This? -->
            <div class="card" style="margin-top: 16px; border-color: rgba(168, 85, 247, 0.2); background: linear-gradient(135deg, var(--bg-card), rgba(168, 85, 247, 0.03));">
                <div class="card-header">
                    <h3 class="card-title">🤔 Should I Buy This?</h3>
                </div>
                <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">Thinking about a purchase? Let's figure it out together.</p>
                <div class="grid-2">
                    <div class="input-group">
                        <label class="input-label">What is it?</label>
                        <input type="text" class="input" id="buy-item" placeholder="e.g., New headphones">
                    </div>
                    <div class="input-group">
                        <label class="input-label">How much? (₦)</label>
                        <input type="number" class="input" id="buy-price" placeholder="0.00" step="0.01" min="0">
                    </div>
                </div>
                <div class="input-group">
                    <label class="input-label">Why do you want it?</label>
                    <select class="input" id="buy-reason">
                        <option value="need">I genuinely need it</option>
                        <option value="want">I want it (treat yourself)</option>
                        <option value="impulse">Impulse — saw it and want it now</option>
                        <option value="replacement">Replacing something broken/old</option>
                        <option value="investment">Investment in myself</option>
                    </select>
                </div>
                <button class="btn btn-primary btn-full" onclick="Budget.shouldIBuy()">Give Me the Verdict 🔮</button>
                <div id="buy-verdict" style="margin-top: 16px; display: none;"></div>
            </div>

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
                                <div class="transaction-amount ${t.type}">${t.type === 'income' ? '+' : '-'}₦${t.amount.toFixed(2)}</div>
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
    },


    // "Should I Buy This?" Logic Engine
    shouldIBuy() {
        const item = document.getElementById('buy-item').value.trim();
        const price = parseFloat(document.getElementById('buy-price').value);
        const reason = document.getElementById('buy-reason').value;

        if (!item || !price) {
            showToast('Fill in what it is and how much!');
            return;
        }

        const stats = this.getMonthlyStats();
        const verdict = this.generateVerdict(item, price, reason, stats);
        
        const verdictEl = document.getElementById('buy-verdict');
        verdictEl.style.display = 'block';
        verdictEl.innerHTML = verdict;
    },

    generateVerdict(item, price, reason, stats) {
        const balance = stats.income - stats.expenses;
        const percentOfBalance = balance > 0 ? (price / balance * 100) : 100;
        const percentOfIncome = stats.income > 0 ? (price / stats.income * 100) : 100;

        // Score system (higher = more likely should buy)
        let score = 50;
        let reasons = [];
        let warnings = [];

        // Price vs. balance
        if (balance <= 0) {
            score -= 30;
            warnings.push("You're over budget this month. This would dig deeper.");
        } else if (percentOfBalance > 50) {
            score -= 20;
            warnings.push(`This is ${percentOfBalance.toFixed(0)}% of your remaining balance.`);
        } else if (percentOfBalance < 10) {
            score += 15;
            reasons.push("It's a small percentage of your remaining budget.");
        }

        // Price vs. income
        if (percentOfIncome > 20) {
            score -= 15;
            warnings.push("This is a significant portion of your monthly income.");
        } else if (percentOfIncome < 5) {
            score += 10;
            reasons.push("It's less than 5% of your income — very manageable.");
        }

        // Reason-based adjustments
        switch (reason) {
            case 'need':
                score += 20;
                reasons.push("You said you genuinely need it. Trust yourself.");
                break;
            case 'replacement':
                score += 15;
                reasons.push("Replacing something broken is responsible spending.");
                break;
            case 'investment':
                score += 10;
                reasons.push("Investing in yourself usually pays off.");
                break;
            case 'want':
                score += 0;
                reasons.push("Wanting things is valid! Just make sure it's not a pattern.");
                break;
            case 'impulse':
                score -= 20;
                warnings.push("Impulse purchases have a high regret rate. Try waiting 48 hours.");
                break;
        }

        // Check if affordable
        if (price <= 5000) {
            score += 10;
            reasons.push("It's under ₦5,000 — life's too short to stress about this.");
        } else if (price > 100000) {
            score -= 5;
            warnings.push("For purchases over ₦100,000, sleeping on it is always wise.");
        }

        // If no income tracked, adjust
        if (stats.income === 0 && stats.expenses === 0) {
            score = 50;
            reasons = ["I don't have enough budget data to give a strong verdict yet. Start tracking to get better advice!"];
            warnings = [];
        }

        // Generate verdict
        let verdictEmoji, verdictTitle, verdictColor;
        if (score >= 70) {
            verdictEmoji = '✅';
            verdictTitle = 'Go for it!';
            verdictColor = 'var(--neon-green)';
        } else if (score >= 45) {
            verdictEmoji = '🤔';
            verdictTitle = 'Maybe... but think about it';
            verdictColor = 'var(--neon-yellow)';
        } else {
            verdictEmoji = '🚫';
            verdictTitle = 'Hold off for now';
            verdictColor = 'var(--neon-pink)';
        }

        return `
            <div style="padding: 20px; background: var(--bg-input); border-radius: var(--radius-lg); border: 1px solid ${verdictColor}30;">
                <div style="text-align: center; margin-bottom: 16px;">
                    <div style="font-size: 36px; margin-bottom: 8px;">${verdictEmoji}</div>
                    <div style="font-size: 18px; font-weight: 700; color: ${verdictColor};">${verdictTitle}</div>
                    <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">${item} — ₦${price.toFixed(2)}</div>
                </div>
                ${reasons.length > 0 ? `
                    <div style="margin-bottom: 12px;">
                        ${reasons.map(r => `<div style="font-size: 13px; color: var(--neon-green); margin-bottom: 4px;">✓ ${r}</div>`).join('')}
                    </div>
                ` : ''}
                ${warnings.length > 0 ? `
                    <div>
                        ${warnings.map(w => `<div style="font-size: 13px; color: var(--neon-pink); margin-bottom: 4px;">⚠ ${w}</div>`).join('')}
                    </div>
                ` : ''}
                ${reason === 'impulse' ? `
                    <div style="margin-top: 12px; padding: 10px; background: rgba(245, 158, 11, 0.1); border-radius: var(--radius-sm); border: 1px solid rgba(245, 158, 11, 0.2);">
                        <p style="font-size: 12px; color: var(--neon-yellow);">💡 Pro tip: Add it to a wishlist. If you still want it in 48 hours, revisit this decision then.</p>
                    </div>
                ` : ''}
                ${score >= 70 && price > 2000 ? `
                    <div style="margin-top: 12px; text-align: center;">
                        <button class="btn btn-secondary btn-sm" onclick="Budget.addTransaction('${item.replace(/'/g, "\\'")}', ${price}, 'expense', 'Shopping'); App.navigate('budget');">Log this purchase →</button>
                    </div>
                ` : ''}
            </div>
        `;
    }
};