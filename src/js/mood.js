// Luna - Mood & Energy Tracker Module
const Mood = {
    moods: [
        { emoji: '&#128525;', label: 'Amazing', value: 5 },
        { emoji: '&#128522;', label: 'Good', value: 4 },
        { emoji: '&#128528;', label: 'Okay', value: 3 },
        { emoji: '&#128533;', label: 'Low', value: 2 },
        { emoji: '&#128557;', label: 'Awful', value: 1 }
    ],

    getData() {
        return Storage.get('mood') || { entries: [] };
    },

    saveData(data) {
        Storage.set('mood', data);
    },

    getTodayEntry() {
        const data = this.getData();
        return data.entries.find(e => e.date === Storage.today());
    },

    logMood(moodValue, energy, note = '') {
        const data = this.getData();
        const today = Storage.today();
        const existingIndex = data.entries.findIndex(e => e.date === today);

        const entry = {
            date: today,
            mood: moodValue,
            energy: energy,
            note: note,
            cycleDay: Cycle.getCurrentDay(),
            cyclePhase: Cycle.getCurrentPhase().name
        };

        if (existingIndex >= 0) {
            data.entries[existingIndex] = entry;
        } else {
            data.entries.push(entry);
        }

        this.saveData(data);
    },

    // Get mood trend for last 7 days
    getWeekTrend() {
        const data = this.getData();
        const last7 = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const entry = data.entries.find(e => e.date === dateStr);
            last7.push({
                date: dateStr,
                day: Storage.getDayOfWeek(dateStr),
                mood: entry ? entry.mood : null,
                energy: entry ? entry.energy : null
            });
        }
        return last7;
    },

    render() {
        const todayEntry = this.getTodayEntry();
        const data = this.getData();
        const weekTrend = this.getWeekTrend();

        return `
            <div class="page-header">
                <h1 class="page-title">Mood & Energy</h1>
                <p class="page-subtitle">How are you feeling today?</p>
            </div>

            <div class="mood-today">
                <div class="mood-question">What's your vibe today?</div>
                <div class="mood-options">
                    ${this.moods.map(m => `
                        <div class="mood-option ${todayEntry && todayEntry.mood === m.value ? 'selected' : ''}"
                             onclick="Mood.selectMood(${m.value})"
                             title="${m.label}">
                            ${m.emoji}
                        </div>
                    `).join('')}
                </div>

                <div class="energy-slider-container">
                    <div class="energy-slider-label">
                        <span>Energy Level</span>
                        <span id="energy-value">${todayEntry ? todayEntry.energy : 5}/10</span>
                    </div>
                    <input type="range" class="energy-slider" id="energy-slider"
                           min="1" max="10" value="${todayEntry ? todayEntry.energy : 5}"
                           oninput="document.getElementById('energy-value').textContent = this.value + '/10'">
                </div>

                <div class="input-group" style="margin-top: 16px; margin-bottom: 0;">
                    <textarea class="input" id="mood-note" placeholder="Any thoughts? (optional)"
                              rows="2">${todayEntry ? todayEntry.note || '' : ''}</textarea>
                </div>

                <button class="btn btn-primary btn-full" style="margin-top: 16px;" onclick="Mood.handleSave()">
                    ${todayEntry ? 'Update Today\'s Check-in' : 'Save Check-in'}
                </button>
            </div>

            <!-- Week Overview -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">This Week</h3>
                </div>
                <div style="display: flex; gap: 8px; justify-content: space-between;">
                    ${weekTrend.map(d => `
                        <div style="text-align: center; flex: 1;">
                            <div style="font-size: 10px; color: var(--text-muted); margin-bottom: 4px;">${d.day}</div>
                            <div style="font-size: 20px; height: 30px; display: flex; align-items: center; justify-content: center;">
                                ${d.mood ? this.moods.find(m => m.value === d.mood)?.emoji || '--' : '<span style="color: var(--text-muted);">-</span>'}
                            </div>
                            <div style="margin-top: 4px;">
                                <div style="height: ${d.energy ? d.energy * 4 : 0}px; width: 20px; margin: 0 auto; background: linear-gradient(to top, var(--purple-secondary), var(--purple-light)); border-radius: 4px; opacity: ${d.energy ? 0.8 : 0.2}; min-height: 4px;"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- History -->
            ${data.entries.length > 0 ? `
            <div class="card" style="margin-top: 16px;">
                <div class="card-header">
                    <h3 class="card-title">Recent Check-ins</h3>
                </div>
                <div class="mood-history">
                    ${data.entries.slice(-10).reverse().map(entry => `
                        <div class="mood-history-item">
                            <span class="mood-history-date">${Storage.formatDate(entry.date)}</span>
                            <span class="mood-history-emoji">${this.moods.find(m => m.value === entry.mood)?.emoji || ''}</span>
                            <div class="mood-history-energy">
                                <div class="progress-bar" style="height: 4px;">
                                    <div class="progress-fill" style="width: ${entry.energy * 10}%;"></div>
                                </div>
                            </div>
                            <span class="mood-history-note">${entry.note || ''}</span>
                            ${entry.cyclePhase ? `<span class="badge badge-purple" style="font-size: 9px;">${entry.cyclePhase}</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        `;
    },

    selectedMood: null,

    selectMood(value) {
        this.selectedMood = value;
        document.querySelectorAll('.mood-option').forEach(el => el.classList.remove('selected'));
        event.currentTarget.classList.add('selected');
    },

    handleSave() {
        const mood = this.selectedMood || (this.getTodayEntry()?.mood);
        const energy = parseInt(document.getElementById('energy-slider').value);
        const note = document.getElementById('mood-note').value;

        if (!mood) {
            showToast('Pick a mood first!');
            return;
        }

        this.logMood(mood, energy, note);
        showToast('Check-in saved! You\'re doing great &#10024;');
        App.navigate('mood');
    }
};
