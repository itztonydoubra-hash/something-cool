// Luna - Skincare Routine Tracker Module
const Skincare = {
    getData() {
        return Storage.get('skincare') || {
            morning: [],
            night: [],
            products: [],
            log: {} // { date: { morning: [completedIds], night: [completedIds] } }
        };
    },

    saveData(data) {
        Storage.set('skincare', data);
    },

    getTodayLog() {
        const data = this.getData();
        return data.log[Storage.today()] || { morning: [], night: [] };
    },

    toggleStep(routine, stepId) {
        const data = this.getData();
        const today = Storage.today();
        if (!data.log[today]) {
            data.log[today] = { morning: [], night: [] };
        }

        const index = data.log[today][routine].indexOf(stepId);
        if (index >= 0) {
            data.log[today][routine].splice(index, 1);
        } else {
            data.log[today][routine].push(stepId);
        }

        this.saveData(data);
        App.navigate('skincare');
    },

    addProduct(name, routine, notes = '') {
        const data = this.getData();
        const product = {
            id: Date.now(),
            name,
            routine, // 'morning', 'night', or 'both'
            notes,
            addedDate: Storage.today()
        };

        if (routine === 'morning' || routine === 'both') {
            data.morning.push({ id: product.id, name, notes });
        }
        if (routine === 'night' || routine === 'both') {
            data.night.push({ id: product.id + 1, name, notes });
        }
        data.products.push(product);
        this.saveData(data);
    },

    removeProduct(id, routine) {
        const data = this.getData();
        if (routine === 'morning') {
            data.morning = data.morning.filter(p => p.id !== id);
        } else {
            data.night = data.night.filter(p => p.id !== id);
        }
        this.saveData(data);
        App.navigate('skincare');
    },

    getStreak() {
        const data = this.getData();
        let streak = 0;
        const today = new Date();

        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const log = data.log[dateStr];

            if (log && (log.morning.length > 0 || log.night.length > 0)) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }
        return streak;
    },

    render() {
        const data = this.getData();
        const todayLog = this.getTodayLog();
        const streak = this.getStreak();
        const morningProgress = data.morning.length > 0 ? Math.round((todayLog.morning.length / data.morning.length) * 100) : 0;
        const nightProgress = data.night.length > 0 ? Math.round((todayLog.night.length / data.night.length) * 100) : 0;

        return `
            <div class="page-header">
                <h1 class="page-title">Skincare</h1>
                <p class="page-subtitle">Glow from within</p>
            </div>

            <!-- Stats -->
            <div class="grid-3" style="margin-bottom: 24px;">
                <div class="stat-card">
                    <div class="stat-value">${streak}</div>
                    <div class="stat-label">Day Streak</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="font-size: 22px;">${morningProgress}%</div>
                    <div class="stat-label">Morning Done</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="font-size: 22px;">${nightProgress}%</div>
                    <div class="stat-label">Night Done</div>
                </div>
            </div>

            <!-- Morning Routine -->
            <div class="routine-section">
                <div class="card">
                    <div class="routine-header">
                        <h3 class="routine-title">&#9728;&#65039; Morning Routine</h3>
                        <button class="btn btn-ghost btn-sm" onclick="Skincare.showAddModal('morning')">+ Add</button>
                    </div>
                    ${data.morning.length === 0 ? `
                        <div class="empty-state" style="padding: 24px;">
                            <p class="empty-state-text">No morning products yet. Add your routine!</p>
                        </div>
                    ` : `
                        <div class="routine-items">
                            ${data.morning.map(product => `
                                <div class="checkbox-item ${todayLog.morning.includes(product.id) ? 'completed' : ''}"
                                     onclick="Skincare.toggleStep('morning', ${product.id})">
                                    <div class="checkbox ${todayLog.morning.includes(product.id) ? 'checked' : ''}"></div>
                                    <div style="flex: 1;">
                                        <div class="checkbox-label">${product.name}</div>
                                        ${product.notes ? `<div style="font-size: 11px; color: var(--text-muted);">${product.notes}</div>` : ''}
                                    </div>
                                    <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); Skincare.removeProduct(${product.id}, 'morning')" style="color: var(--danger); font-size: 12px;">&#10005;</button>
                                </div>
                            `).join('')}
                        </div>
                    `}
                    ${data.morning.length > 0 ? `
                        <div class="progress-bar" style="margin-top: 12px;">
                            <div class="progress-fill ${morningProgress >= 100 ? 'success' : ''}" style="width: ${morningProgress}%;"></div>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- Night Routine -->
            <div class="routine-section">
                <div class="card">
                    <div class="routine-header">
                        <h3 class="routine-title">&#127769; Night Routine</h3>
                        <button class="btn btn-ghost btn-sm" onclick="Skincare.showAddModal('night')">+ Add</button>
                    </div>
                    ${data.night.length === 0 ? `
                        <div class="empty-state" style="padding: 24px;">
                            <p class="empty-state-text">No night products yet. Add your routine!</p>
                        </div>
                    ` : `
                        <div class="routine-items">
                            ${data.night.map(product => `
                                <div class="checkbox-item ${todayLog.night.includes(product.id) ? 'completed' : ''}"
                                     onclick="Skincare.toggleStep('night', ${product.id})">
                                    <div class="checkbox ${todayLog.night.includes(product.id) ? 'checked' : ''}"></div>
                                    <div style="flex: 1;">
                                        <div class="checkbox-label">${product.name}</div>
                                        ${product.notes ? `<div style="font-size: 11px; color: var(--text-muted);">${product.notes}</div>` : ''}
                                    </div>
                                    <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); Skincare.removeProduct(${product.id}, 'night')" style="color: var(--danger); font-size: 12px;">&#10005;</button>
                                </div>
                            `).join('')}
                        </div>
                    `}
                    ${data.night.length > 0 ? `
                        <div class="progress-bar" style="margin-top: 12px;">
                            <div class="progress-fill ${nightProgress >= 100 ? 'success' : ''}" style="width: ${nightProgress}%;"></div>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- Add Product Modal -->
            <div class="modal-overlay" id="skincare-modal">
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title">Add Product</h3>
                        <button class="modal-close" onclick="Skincare.hideAddModal()">&times;</button>
                    </div>
                    <div class="input-group">
                        <label class="input-label">Product Name</label>
                        <input type="text" class="input" id="product-name" placeholder="e.g., CeraVe Cleanser">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Routine</label>
                        <select class="input" id="product-routine">
                            <option value="morning">Morning</option>
                            <option value="night">Night</option>
                            <option value="both">Both</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label class="input-label">Notes (optional)</label>
                        <input type="text" class="input" id="product-notes" placeholder="e.g., Wait 2 min before next step">
                    </div>
                    <button class="btn btn-primary btn-full" onclick="Skincare.handleAddProduct()">Add to Routine</button>
                </div>
            </div>
        `;
    },

    showAddModal(routine) {
        document.getElementById('skincare-modal').classList.add('active');
        if (routine) {
            setTimeout(() => {
                document.getElementById('product-routine').value = routine;
            }, 10);
        }
    },

    hideAddModal() {
        document.getElementById('skincare-modal').classList.remove('active');
    },

    handleAddProduct() {
        const name = document.getElementById('product-name').value.trim();
        const routine = document.getElementById('product-routine').value;
        const notes = document.getElementById('product-notes').value.trim();

        if (!name) {
            showToast('Please enter a product name');
            return;
        }

        this.addProduct(name, routine, notes);
        this.hideAddModal();
        showToast(`${name} added to your routine!`);
        App.navigate('skincare');
    }
};
