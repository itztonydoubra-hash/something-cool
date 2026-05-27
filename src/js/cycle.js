// Luna - Cycle Tracker Module
const Cycle = {
    // Default cycle data
    getDefaults() {
        return {
            cycleLength: 28,
            periodLength: 5,
            lastPeriodStart: null,
            history: [] // Array of { startDate, endDate }
        };
    },

    getData() {
        return Storage.get('cycle') || this.getDefaults();
    },

    saveData(data) {
        Storage.set('cycle', data);
    },

    // Calculate current cycle day
    getCurrentDay() {
        const data = this.getData();
        if (!data.lastPeriodStart) return null;
        const start = new Date(data.lastPeriodStart);
        const today = new Date();
        const diffTime = today - start;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return (diffDays % data.cycleLength) + 1;
    },

    // Get current phase
    getCurrentPhase() {
        const data = this.getData();
        const day = this.getCurrentDay();
        if (!day) return { name: 'Not Set', icon: '&#9790;', color: 'purple' };

        const { periodLength, cycleLength } = data;
        const ovulationDay = Math.round(cycleLength / 2) - 1;

        if (day <= periodLength) {
            return { name: 'Menstrual', icon: '&#127801;', color: 'red', day, description: 'Rest & recharge. Your body is releasing.' };
        } else if (day <= ovulationDay - 3) {
            return { name: 'Follicular', icon: '&#127793;', color: 'green', day, description: 'Rising energy! Great for new projects & socializing.' };
        } else if (day <= ovulationDay + 2) {
            return { name: 'Ovulation', icon: '&#9728;', color: 'yellow', day, description: 'Peak energy & confidence. You\'re glowing!' };
        } else {
            return { name: 'Luteal', icon: '&#127769;', color: 'purple', day, description: 'Winding down. Focus on comfort & self-care.' };
        }
    },

    // Predict next period
    getNextPeriod() {
        const data = this.getData();
        if (!data.lastPeriodStart) return null;
        const start = new Date(data.lastPeriodStart);
        const next = new Date(start);
        next.setDate(next.getDate() + data.cycleLength);

        // If next is in the past, calculate the actual next one
        const today = new Date();
        while (next < today) {
            next.setDate(next.getDate() + data.cycleLength);
        }

        const diffDays = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
        return { date: next, daysUntil: diffDays };
    },

    // Log period start
    logPeriodStart(date) {
        const data = this.getData();
        data.lastPeriodStart = date;
        data.history.push({ startDate: date, endDate: null });
        this.saveData(data);
    },

    // Render the cycle page
    render() {
        const data = this.getData();
        const phase = this.getCurrentPhase();
        const nextPeriod = this.getNextPeriod();
        const currentDay = this.getCurrentDay();

        return `
            <div class="page-header">
                <h1 class="page-title">Cycle Tracker</h1>
                <p class="page-subtitle">Understanding your rhythm</p>
            </div>

            <div class="cycle-phase-display glow-pulse">
                <div class="cycle-moon">${phase.icon}</div>
                <div class="cycle-phase-name">${phase.name} Phase</div>
                <div class="cycle-day-info">
                    ${currentDay ? `Day ${currentDay} of ${data.cycleLength}` : 'Log your period to start tracking'}
                </div>
                ${phase.description ? `<p style="margin-top: 12px; font-size: 13px; color: var(--text-secondary); position: relative;">${phase.description}</p>` : ''}
            </div>

            <div class="cycle-stats">
                <div class="cycle-stat">
                    <div class="cycle-stat-value">${currentDay || '--'}</div>
                    <div class="cycle-stat-label">Cycle Day</div>
                </div>
                <div class="cycle-stat">
                    <div class="cycle-stat-value">${nextPeriod ? nextPeriod.daysUntil : '--'}</div>
                    <div class="cycle-stat-label">Days Until Period</div>
                </div>
                <div class="cycle-stat">
                    <div class="cycle-stat-value">${data.cycleLength}</div>
                    <div class="cycle-stat-label">Cycle Length</div>
                </div>
                <div class="cycle-stat">
                    <div class="cycle-stat-value">${data.periodLength}</div>
                    <div class="cycle-stat-label">Period Length</div>
                </div>
            </div>

            <div class="card" style="margin-top: 24px;">
                <div class="card-header">
                    <h3 class="card-title">Log Period</h3>
                </div>
                <div class="input-group">
                    <label class="input-label">Period Start Date</label>
                    <input type="date" class="input" id="period-start-date" value="${Storage.today()}">
                </div>
                <button class="btn btn-primary btn-full" onclick="Cycle.handleLogPeriod()">
                    Log Period Start
                </button>
            </div>

            <div class="card" style="margin-top: 16px;">
                <div class="card-header">
                    <h3 class="card-title">Cycle Settings</h3>
                </div>
                <div class="input-group">
                    <label class="input-label">Average Cycle Length (days)</label>
                    <input type="number" class="input" id="cycle-length" value="${data.cycleLength}" min="21" max="40">
                </div>
                <div class="input-group">
                    <label class="input-label">Average Period Length (days)</label>
                    <input type="number" class="input" id="period-length" value="${data.periodLength}" min="2" max="10">
                </div>
                <button class="btn btn-secondary btn-full" onclick="Cycle.handleSaveSettings()">
                    Save Settings
                </button>
            </div>

            ${data.history.length > 0 ? `
            <div class="card" style="margin-top: 16px;">
                <div class="card-header">
                    <h3 class="card-title">History</h3>
                </div>
                <div class="mood-history">
                    ${data.history.slice(-5).reverse().map(h => `
                        <div class="mood-history-item">
                            <span class="mood-history-date">${Storage.formatDate(h.startDate)}</span>
                            <span class="mood-history-emoji">&#127801;</span>
                            <span class="mood-history-note">Period started</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        `;
    },

    handleLogPeriod() {
        const date = document.getElementById('period-start-date').value;
        if (date) {
            this.logPeriodStart(date);
            showToast('Period logged! Take care of yourself &#128156;');
            App.navigate('cycle');
        }
    },

    handleSaveSettings() {
        const cycleLength = parseInt(document.getElementById('cycle-length').value);
        const periodLength = parseInt(document.getElementById('period-length').value);
        const data = this.getData();
        data.cycleLength = cycleLength;
        data.periodLength = periodLength;
        this.saveData(data);
        showToast('Settings saved!');
        App.navigate('cycle');
    }
};
