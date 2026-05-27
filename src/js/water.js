// Luna - Water & Medication Tracker Module
const Water = {
    getData() {
        return Storage.get('water') || {
            goal: 8,
            logs: {},
            medications: []
        };
    },

    saveData(data) {
        Storage.set('water', data);
    },

    getTodayCount() {
        const data = this.getData();
        return data.logs[Storage.today()] || 0;
    },

    addGlass() {
        const data = this.getData();
        const today = Storage.today();
        data.logs[today] = (data.logs[today] || 0) + 1;
        this.saveData(data);
        this.updateDisplay();

        if (data.logs[today] >= data.goal) {
            showToast('Goal reached! You\'re glowing from the inside &#128167;');
        }
    },

    removeGlass() {
        const data = this.getData();
        const today = Storage.today();
        if (data.logs[today] && data.logs[today] > 0) {
            data.logs[today]--;
            this.saveData(data);
            this.updateDisplay();
        }
    },

    updateDisplay() {
        const count = this.getTodayCount();
        const data = this.getData();
        const percentage = Math.min((count / data.goal) * 100, 100);

        const countEl = document.getElementById('water-count');
        const goalEl = document.getElementById('water-goal-text');
        const progressEl = document.getElementById('water-progress');
        const circleEl = document.querySelector('.water-circle');

        if (countEl) countEl.textContent = count;
        if (goalEl) goalEl.textContent = `of ${data.goal} glasses`;
        if (progressEl) progressEl.style.width = `${percentage}%`;
        if (circleEl) {
            circleEl.style.background = `linear-gradient(to top, rgba(6, 182, 212, ${percentage / 300}) ${percentage}%, var(--bg-input) ${percentage}%)`;
        }
    },

    // Medication functions
    addMedication(name, time, frequency) {
        const data = this.getData();
        data.medications.push({
            id: Date.now(),
            name,
            time,
            frequency,
            taken: {}
        });
        this.saveData(data);
    },

    toggleMedication(id) {
        const data = this.getData();
        const med = data.medications.find(m => m.id === id);
        if (med) {
            const today = Storage.today();
            med.taken[today] = !med.taken[today];
            this.saveData(data);
            App.navigate('water');
        }
    },

    removeMedication(id) {
        const data = this.getData();
        data.medications = data.medications.filter(m => m.id !== id);
        this.saveData(data);
        App.navigate('water');
    },

    // Get week history
    getWeekHistory() {
        const data = this.getData();
        const week = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            week.push({
                day: Storage.getDayOfWeek(dateStr),
                count: data.logs[dateStr] || 0,
                goal: data.goal
            });
        }
        return week;
    },

    render() {
        const data = this.getData();
        const todayCount = this.getTodayCount();
        const percentage = Math.min((todayCount / data.goal) * 100, 100);
        const weekHistory = this.getWeekHistory();

        return `
            <div class="page-header">
                <h1 class="page-title">Hydration & Meds</h1>
                <p class="page-subtitle">Nourish your body</p>
            </div>

            <!-- Water Tracker -->
            <div class="water-display">
                <div class="water-circle" style="background: linear-gradient(to top, rgba(6, 182, 212, ${percentage / 300}) ${percentage}%, var(--bg-input) ${percentage}%);">
                    <div class="water-count" id="water-count">${todayCount}</div>
                    <div class="water-goal" id="water-goal-text">of ${data.goal} glasses</div>
                </div>
                <div class="progress-bar" style="margin-bottom: 24px; max-width: 300px; margin-left: auto; margin-right: auto;">
                    <div class="progress-fill ${percentage >= 100 ? 'success' : ''}" id="water-progress" style="width: ${percentage}%;"></div>
                </div>
                <div class="water-buttons">
                    <button class="water-btn minus" onclick="Water.removeGlass()">-</button>
                    <button class="water-btn" onclick="Water.addGlass()">+</button>
                </div>
            </div>

            <!-- Week Overview -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">This Week</h3>
                </div>
                <div style="display: flex; gap: 8px; justify-content: space-between; align-items: flex-end; height: 100px; padding-top: 20px;">
                    ${weekHistory.map(d => `
                        <div style="flex: 1; text-align: center;">
                            <div style="height: ${Math.max(d.count / d.goal * 60, 4)}px; background: linear-gradient(to top, var(--neon-blue), rgba(6, 182, 212, 0.5)); border-radius: 4px; margin: 0 auto; width: 24px; transition: height 0.3s;"></div>
                            <div style="font-size: 10px; color: var(--text-muted); margin-top: 6px;">${d.day}</div>
                            <div style="font-size: 10px; color: ${d.count >= d.goal ? 'var(--neon-green)' : 'var(--text-muted)'};">${d.count}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Medications -->
            <div class="card" style="margin-top: 16px;">
                <div class="card-header">
                    <h3 class="card-title">Medications & Supplements</h3>
                    <button class="btn btn-ghost btn-sm" onclick="Water.showAddMedModal()">+ Add</button>
                </div>
                ${data.medications.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-state-icon">&#128138;</div>
                        <p class="empty-state-text">No medications added yet.<br>Tap + Add to track your pills & supplements.</p>
                    </div>
                ` : `
                    <div class="routine-items">
                        ${data.medications.map(med => `
                            <div class="checkbox-item ${med.taken[Storage.today()] ? 'completed' : ''}" onclick="Water.toggleMedication(${med.id})">
                                <div class="checkbox ${med.taken[Storage.today()] ? 'checked' : ''}"></div>
                                <div style="flex: 1;">
                                    <div class="checkbox-label">${med.name}</div>
                                    <div style="font-size: 11px; color: var(--text-muted);">${med.time} &middot; ${med.frequency}</div>
                                </div>
                                <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); Water.removeMedication(${med.id})" style="color: var(--danger);">&#10005;</button>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>

            <!-- Settings -->
            <div class="card" style="margin-top: 16px;">
                <div class="card-header">
                    <h3 class="card-title">Water Goal</h3>
                </div>
                <div class="input-group" style="margin-bottom: 0;">
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <input type="number" class="input" id="water-goal-input" value="${data.goal}" min="1" max="20" style="width: 80px;">
                        <span style="color: var(--text-secondary); font-size: 14px;">glasses per day</span>
                        <button class="btn btn-secondary btn-sm" onclick="Water.saveGoal()">Save</button>
                    </div>
                </div>
            </div>

            <!-- Add Medication Modal -->
            <div class="modal-overlay" id="med-modal">
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title">Add Medication</h3>
                        <button class="modal-close" onclick="Water.hideAddMedModal()">&times;</button>
                    </div>
                    <div class="input-group">
                        <label class="input-label">Name</label>
                        <input type="text" class="input" id="med-name" placeholder="e.g., Birth Control, Vitamin D">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Time</label>
                        <input type="time" class="input" id="med-time" value="09:00">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Frequency</label>
                        <select class="input" id="med-frequency">
                            <option value="Daily">Daily</option>
                            <option value="Twice daily">Twice daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="As needed">As needed</option>
                        </select>
                    </div>
                    <button class="btn btn-primary btn-full" onclick="Water.handleAddMed()">Add Medication</button>
                </div>
            </div>
        `;
    },

    showAddMedModal() {
        document.getElementById('med-modal').classList.add('active');
    },

    hideAddMedModal() {
        document.getElementById('med-modal').classList.remove('active');
    },

    handleAddMed() {
        const name = document.getElementById('med-name').value.trim();
        const time = document.getElementById('med-time').value;
        const frequency = document.getElementById('med-frequency').value;

        if (!name) {
            showToast('Please enter a medication name');
            return;
        }

        this.addMedication(name, time, frequency);
        this.hideAddMedModal();
        showToast(`${name} added!`);
        App.navigate('water');
    },

    saveGoal() {
        const goal = parseInt(document.getElementById('water-goal-input').value);
        if (goal > 0) {
            const data = this.getData();
            data.goal = goal;
            this.saveData(data);
            showToast('Goal updated!');
            App.navigate('water');
        }
    }
};
