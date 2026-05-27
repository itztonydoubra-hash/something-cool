// Luna - Habit Streaks Dashboard + Morning Briefing + Period Notifications
const Streaks = {
    // Get streak data for all features
    getAllStreaks() {
        const today = new Date();
        const streaks = {};

        // Mood streak
        const moodData = Mood.getData();
        streaks.mood = this.calcStreak(date => moodData.entries.some(e => e.date === date));

        // Water streak
        const waterData = Water.getData();
        streaks.water = this.calcStreak(date => (waterData.logs[date] || 0) >= waterData.goal);

        // Skincare streak
        const skincareData = Skincare.getData();
        streaks.skincare = this.calcStreak(date => {
            const log = skincareData.log[date];
            return log && (log.morning.length > 0 || log.night.length > 0);
        });

        // Wins streak
        const winsData = Affirmations.getWinsData();
        streaks.wins = this.calcStreak(date => winsData.entries.some(e => e.date === date));

        return streaks;
    },

    calcStreak(checkFn) {
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 60; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            if (checkFn(dateStr)) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }
        return streak;
    },

    // Get last 30 days activity for heatmap
    getHeatmap(checkFn) {
        const days = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            days.push({ date: dateStr, active: checkFn(dateStr) });
        }
        return days;
    },

    render() {
        const streaks = this.getAllStreaks();
        const moodData = Mood.getData();
        const waterData = Water.getData();
        const skincareData = Skincare.getData();
        const winsData = Affirmations.getWinsData();

        const moodHeatmap = this.getHeatmap(date => moodData.entries.some(e => e.date === date));
        const waterHeatmap = this.getHeatmap(date => (waterData.logs[date] || 0) >= waterData.goal);
        const skincareHeatmap = this.getHeatmap(date => {
            const log = skincareData.log[date];
            return log && (log.morning.length > 0 || log.night.length > 0);
        });

        const totalStreak = Math.max(streaks.mood, streaks.water, streaks.skincare, streaks.wins);

        return `
            <div class="page-header">
                <h1 class="page-title">Habit Streaks</h1>
                <p class="page-subtitle">Your consistency, visualized</p>
            </div>

            <!-- Overall Stats -->
            <div class="grid-4" style="margin-bottom: 24px;">
                <div class="stat-card" style="text-align: center;">
                    <div class="stat-value" style="font-size: 28px;">✨</div>
                    <div style="font-size: 20px; font-weight: 700; color: var(--purple-light);">${streaks.mood}</div>
                    <div class="stat-label">Mood</div>
                </div>
                <div class="stat-card" style="text-align: center;">
                    <div class="stat-value" style="font-size: 28px;">💧</div>
                    <div style="font-size: 20px; font-weight: 700; color: var(--neon-blue);">${streaks.water}</div>
                    <div class="stat-label">Water</div>
                </div>
                <div class="stat-card" style="text-align: center;">
                    <div class="stat-value" style="font-size: 28px;">🧴</div>
                    <div style="font-size: 20px; font-weight: 700; color: var(--neon-pink);">${streaks.skincare}</div>
                    <div class="stat-label">Skincare</div>
                </div>
                <div class="stat-card" style="text-align: center;">
                    <div class="stat-value" style="font-size: 28px;">🏆</div>
                    <div style="font-size: 20px; font-weight: 700; color: var(--neon-green);">${streaks.wins}</div>
                    <div class="stat-label">Wins</div>
                </div>
            </div>

            <!-- Heatmaps -->
            <div class="card" style="margin-bottom: 16px;">
                <div class="card-header">
                    <h3 class="card-title">✨ Mood Check-ins (30 days)</h3>
                    <span class="badge badge-purple">${streaks.mood} day streak</span>
                </div>
                <div style="display: flex; gap: 3px; flex-wrap: wrap;">
                    ${moodHeatmap.map(d => `<div style="width: 16px; height: 16px; border-radius: 3px; background: ${d.active ? 'var(--purple-primary)' : 'var(--bg-input)'};" title="${Storage.formatDate(d.date)}"></div>`).join('')}
                </div>
            </div>

            <div class="card" style="margin-bottom: 16px;">
                <div class="card-header">
                    <h3 class="card-title">💧 Water Goal Met (30 days)</h3>
                    <span class="badge badge-blue">${streaks.water} day streak</span>
                </div>
                <div style="display: flex; gap: 3px; flex-wrap: wrap;">
                    ${waterHeatmap.map(d => `<div style="width: 16px; height: 16px; border-radius: 3px; background: ${d.active ? 'var(--neon-blue)' : 'var(--bg-input)'};" title="${Storage.formatDate(d.date)}"></div>`).join('')}
                </div>
            </div>

            <div class="card" style="margin-bottom: 16px;">
                <div class="card-header">
                    <h3 class="card-title">🧴 Skincare Routine (30 days)</h3>
                    <span class="badge badge-pink">${streaks.skincare} day streak</span>
                </div>
                <div style="display: flex; gap: 3px; flex-wrap: wrap;">
                    ${skincareHeatmap.map(d => `<div style="width: 16px; height: 16px; border-radius: 3px; background: ${d.active ? 'var(--neon-pink)' : 'var(--bg-input)'};" title="${Storage.formatDate(d.date)}"></div>`).join('')}
                </div>
            </div>

            <!-- Achievements -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🏅 Achievements</h3>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${this.getAchievements(streaks).map(a => `
                        <div style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: ${a.unlocked ? 'rgba(168, 85, 247, 0.05)' : 'var(--bg-input)'}; border-radius: var(--radius-md); opacity: ${a.unlocked ? 1 : 0.5};">
                            <span style="font-size: 20px;">${a.icon}</span>
                            <div style="flex: 1;">
                                <div style="font-size: 13px; font-weight: 600;">${a.name}</div>
                                <div style="font-size: 11px; color: var(--text-muted);">${a.desc}</div>
                            </div>
                            ${a.unlocked ? '<span class="badge badge-green">Unlocked!</span>' : '<span class="badge badge-purple">Locked</span>'}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    getAchievements(streaks) {
        return [
            { icon: '🌱', name: 'First Steps', desc: 'Log mood for 1 day', unlocked: streaks.mood >= 1 },
            { icon: '💧', name: 'Hydrated Queen', desc: 'Hit water goal 3 days in a row', unlocked: streaks.water >= 3 },
            { icon: '🔥', name: 'On Fire', desc: '7-day skincare streak', unlocked: streaks.skincare >= 7 },
            { icon: '⭐', name: 'Consistent', desc: '14-day mood streak', unlocked: streaks.mood >= 14 },
            { icon: '💎', name: 'Diamond Habits', desc: '30-day streak on any habit', unlocked: Math.max(streaks.mood, streaks.water, streaks.skincare) >= 30 },
            { icon: '👑', name: 'Self-Care Queen', desc: 'All streaks at 7+ days', unlocked: streaks.mood >= 7 && streaks.water >= 7 && streaks.skincare >= 7 },
        ];
    }
};

// Morning Briefing - shows on dashboard
const MorningBriefing = {
    render() {
        const phase = Cycle.getCurrentPhase();
        const nextPeriod = Cycle.getNextPeriod();
        const waterData = Water.getData();
        const meds = waterData.medications;
        const today = Storage.today();
        const medsTaken = meds.filter(m => m.taken[today]).length;
        const streaks = Streaks.getAllStreaks();
        const name = Storage.get('userName') || '';

        // Period notification
        let periodAlert = '';
        if (nextPeriod && nextPeriod.daysUntil <= 3 && nextPeriod.daysUntil > 0) {
            periodAlert = `<div style="padding: 10px 14px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: var(--radius-md); margin-bottom: 12px;">
                <div style="font-size: 13px; color: var(--neon-red); font-weight: 600;">🩸 Period Alert!</div>
                <div style="font-size: 12px; color: var(--text-secondary);">Your period is likely in ${nextPeriod.daysUntil} day${nextPeriod.daysUntil > 1 ? 's' : ''}. Stock up on supplies and plan for rest.</div>
            </div>`;
        }

        // Meds reminder
        let medsAlert = '';
        if (meds.length > 0 && medsTaken < meds.length) {
            const remaining = meds.filter(m => !m.taken[today]);
            medsAlert = `<div style="padding: 10px 14px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: var(--radius-md); margin-bottom: 12px;">
                <div style="font-size: 13px; color: var(--neon-yellow); font-weight: 600;">💊 Medication Reminder</div>
                <div style="font-size: 12px; color: var(--text-secondary);">${remaining.map(m => m.name).join(', ')} — don't forget!</div>
            </div>`;
        }

        // Best streak
        const bestStreak = Math.max(streaks.mood, streaks.water, streaks.skincare, streaks.wins);
        let streakMsg = '';
        if (bestStreak >= 7) {
            streakMsg = `<div style="padding: 10px 14px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: var(--radius-md); margin-bottom: 12px;">
                <div style="font-size: 13px; color: var(--neon-green); font-weight: 600;">🔥 ${bestStreak}-Day Streak!</div>
                <div style="font-size: 12px; color: var(--text-secondary);">Keep it going — you're building something amazing.</div>
            </div>`;
        }

        return `
            <div style="margin-bottom: 24px;">
                ${periodAlert}
                ${medsAlert}
                ${streakMsg}
            </div>
        `;
    }
};
