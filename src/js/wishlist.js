// Luna - Wishlist Module (integrates with Should I Buy This)
const Wishlist = {
    getData() {
        return Storage.get('wishlist') || { items: [] };
    },

    saveData(data) {
        Storage.set('wishlist', data);
    },

    addItem(name, price, reason, date = null) {
        const data = this.getData();
        data.items.push({
            id: Date.now(),
            name,
            price: parseFloat(price),
            reason,
            addedDate: date || Storage.today(),
            bought: false,
            boughtDate: null,
            stillWant: null
        });
        this.saveData(data);
    },

    removeItem(id) {
        const data = this.getData();
        data.items = data.items.filter(i => i.id !== id);
        this.saveData(data);
        App.navigate('wishlist');
    },

    markBought(id) {
        const data = this.getData();
        const item = data.items.find(i => i.id === id);
        if (item) {
            item.bought = true;
            item.boughtDate = Storage.today();
            // Also log as expense
            Budget.addTransaction(item.name, item.price, 'expense', 'Shopping');
        }
        this.saveData(data);
        showToast('Logged as purchased! 🛍️');
        App.navigate('wishlist');
    },

    markDontWant(id) {
        const data = this.getData();
        data.items = data.items.filter(i => i.id !== id);
        this.saveData(data);
        showToast('Removed — you don\'t need it! 💪');
        App.navigate('wishlist');
    },

    getActiveItems() {
        return this.getData().items.filter(i => !i.bought);
    },

    getDaysSinceAdded(dateStr) {
        const added = new Date(dateStr);
        const now = new Date();
        return Math.floor((now - added) / (1000 * 60 * 60 * 24));
    },

    render() {
        const data = this.getData();
        const activeItems = data.items.filter(i => !i.bought);
        const boughtItems = data.items.filter(i => i.bought);
        const totalSaved = activeItems.reduce((sum, i) => sum + i.price, 0);

        return `
            <div class="page-header">
                <h1 class="page-title">Wishlist</h1>
                <p class="page-subtitle">Things you're thinking about buying</p>
            </div>

            <!-- Stats -->
            <div class="grid-3" style="margin-bottom: 24px;">
                <div class="stat-card">
                    <div class="stat-value">${activeItems.length}</div>
                    <div class="stat-label">Waiting On</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="font-size: 20px;">₦${totalSaved.toFixed(0)}</div>
                    <div class="stat-label">Total Value</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${boughtItems.length}</div>
                    <div class="stat-label">Bought</div>
                </div>
            </div>

            <!-- Add Item -->
            <div class="card" style="margin-bottom: 20px;">
                <div class="card-header">
                    <h3 class="card-title">➕ Add to Wishlist</h3>
                </div>
                <div class="grid-2">
                    <div class="input-group">
                        <label class="input-label">What do you want?</label>
                        <input type="text" class="input" id="wish-name" placeholder="e.g., New bag, AirPods">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Price (₦)</label>
                        <input type="number" class="input" id="wish-price" placeholder="0" min="0">
                    </div>
                </div>
                <div class="input-group">
                    <label class="input-label">Why do you want it?</label>
                    <input type="text" class="input" id="wish-reason" placeholder="e.g., Mine broke, saw it on IG, been wanting it forever">
                </div>
                <button class="btn btn-primary btn-full" onclick="Wishlist.handleAdd()">Add to Wishlist</button>
            </div>

            <!-- Active Wishlist -->
            ${activeItems.length > 0 ? `
            <div class="card" style="margin-bottom: 20px;">
                <div class="card-header">
                    <h3 class="card-title">🛍️ Still Wanting</h3>
                    <span style="font-size: 12px; color: var(--text-muted);">Wait 48hrs before buying</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${activeItems.map(item => {
                        const days = this.getDaysSinceAdded(item.addedDate);
                        const canBuy = days >= 2;
                        return `
                        <div style="padding: 14px; background: var(--bg-input); border-radius: var(--radius-md); border-left: 3px solid ${canBuy ? 'var(--neon-green)' : 'var(--neon-yellow)'};">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px;">
                                <div>
                                    <div style="font-size: 14px; font-weight: 600;">${item.name}</div>
                                    <div style="font-size: 12px; color: var(--text-muted);">${item.reason || 'No reason given'}</div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 14px; font-weight: 700; color: var(--neon-pink);">₦${item.price.toFixed(0)}</div>
                                    <div style="font-size: 11px; color: var(--text-muted);">${days} day${days !== 1 ? 's' : ''} ago</div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 6px; margin-top: 8px;">
                                ${canBuy ? `
                                    <button class="btn btn-primary btn-sm" onclick="Wishlist.markBought(${item.id})">🛒 Buy it</button>
                                ` : `
                                    <span class="badge badge-yellow">⏳ Wait ${2 - days} more day${2 - days !== 1 ? 's' : ''}</span>
                                `}
                                <button class="btn btn-ghost btn-sm" onclick="Wishlist.markDontWant(${item.id})" style="color: var(--text-muted);">Don't want anymore</button>
                            </div>
                        </div>
                    `}).join('')}
                </div>
            </div>
            ` : `
            <div class="card" style="margin-bottom: 20px;">
                <div class="empty-state" style="padding: 32px;">
                    <div class="empty-state-icon">🛍️</div>
                    <p class="empty-state-text">Your wishlist is empty!<br>Add items you're thinking about buying.</p>
                </div>
            </div>
            `}

            <!-- Bought History -->
            ${boughtItems.length > 0 ? `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">✅ Already Bought</h3>
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    ${boughtItems.slice(-5).reverse().map(item => `
                        <div style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: rgba(16, 185, 129, 0.05); border-radius: var(--radius-sm);">
                            <span style="font-size: 14px;">✓</span>
                            <span style="flex: 1; font-size: 13px; text-decoration: line-through; color: var(--text-muted);">${item.name}</span>
                            <span style="font-size: 12px; color: var(--text-muted);">₦${item.price.toFixed(0)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        `;
    },

    handleAdd() {
        const name = document.getElementById('wish-name').value.trim();
        const price = document.getElementById('wish-price').value;
        const reason = document.getElementById('wish-reason').value.trim();

        if (!name) {
            showToast('What do you want to add?');
            return;
        }

        this.addItem(name, price || 0, reason);
        showToast('Added to wishlist! Wait 48hrs before deciding 🤔');
        App.navigate('wishlist');
    }
};
