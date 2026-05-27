// Luna - Monthly Insights & Analytics Module
const Insights = {
    getMonthData(monthOffset = 0) {
        const now = new Date();
        const targetMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
        const monthStart = targetMonth.toISOString().split('T')[0];
        const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).toISOString().split('T')[0];
        const monthName = targetMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        return { monthStart, monthEnd, monthName, targetMonth };
    },

    getMoodInsights(monthStart, monthEnd) {
        const moodData = Mood.getData();
        const entries = moodData.entries.filter(e => e.date >= monthStart && e.date <= monthEnd);
        
        if (entries.length === 0) return null;

        const avgMood = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
        const avgEnergy = entries.reduce((sum, e) => sum + e.energy, 0) / entries.length;
        const daysLogged = entries.length;
        
        // Best and worst days
        const bestDay = entries.reduce((best, e) => e.mood > best.mood ? e : best, entries[0]);
        const worstDay = entries.reduce((worst, e) => e.mood < worst.mood ? e : worst, entries[0]);

        // Mood by cycle phase
        const phaseBreakdown = {};
        entries.forEach(e => {
            if (e.cyclePhase) {
                if (!phaseBreakdown[e.cyclePhase]) phaseBreakdown[e.cyclePhase] = { moods: [], energies: [] };
                phaseBreakdown[e.cyclePhase].moods.push(e.mood);
                phaseBreakdown[e.cyclePhase].energies.push(e.energy);
            }
        });

        const phaseAverages = {};
        Object.entries(phaseBreakdown).forEach(([phase, data]) => {
            phaseAverages[phase] = {
                mood: (data.moods.reduce((a, b) => a + b, 0) / data.moods.length).toFixed(1),
                energy: (data.energies.reduce((a, b) => a + b, 0) / data.energies.length).toFixed(1),
                days: data.moods.length
            };
        });

        return { avgMood, avgEnergy, daysLogged, bestDay, worstDay, phaseAverages };
    },

    getWaterInsights(monthStart, monthEnd) {
        const waterData = Water.getData();
        const days = [];
        let current = new Date(monthStart);
        const end = new Date(monthEnd);

        while (current <= end) {
            const dateStr = current.toISOString().split('T')[0];
            days.push({ date: dateStr, count: waterData.logs[dateStr] || 0 });
            current.setDate(current.getDate() + 1);
        }

        const daysWithWater = days.filter(d => d.count > 0);
        const totalGlasses = days.reduce((sum, d) => sum + d.count, 0);
        const avgPerDay = daysWithWater.length > 0 ? totalGlasses / daysWithWater.length : 0;
        const goalMetDays = days.filter(d => d.count >= waterData.goal).length;
        const totalDays = days.length;
        const consistency = totalDays > 0 ? Math.round((goalMetDays / totalDays) * 100) : 0;

        return { totalGlasses, avgPerDay, goalMetDays, totalDays, consistency, days };
    },

    getBudgetInsights(monthStart, monthEnd) {
        const budgetData = Budget.getData();
        const transactions = budgetData.transactions.filter(t => t.date >= monthStart && t.date <= monthEnd);

        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const savings = income - expenses;
        const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;

        // Category breakdown
        const categories = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            categories[t.category] = (categories[t.category] || 0) + t.amount;
        });
        const topCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 5);

        // Daily spending pattern
        const dailySpending = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            const day = new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' });
            dailySpending[day] = (dailySpending[day] || 0) + t.amount;
        });

        return { income, expenses, savings, savingsRate, topCategories, dailySpending, transactionCount: transactions.length };
    },

    getSkincareInsights(monthStart, monthEnd) {
        const skincareData = Skincare.getData();
        let daysCompleted = 0;
        let totalDays = 0;
        let current = new Date(monthStart);
        const end = new Date(monthEnd);

        while (current <= end && current <= new Date()) {
            const dateStr = current.toISOString().split('T')[0];
            totalDays++;
            const log = skincareData.log[dateStr];
            if (log && (log.morning.length > 0 || log.night.length > 0)) {
                daysCompleted++;
            }
            current.setDate(current.getDate() + 1);
        }

        const consistency = totalDays > 0 ? Math.round((daysCompleted / totalDays) * 100) : 0;
        return { daysCompleted, totalDays, consistency };
    },

    currentMonthOffset: 0,

    render() {
        const { monthStart, monthEnd, monthName } = this.getMonthData(this.currentMonthOffset);
        const moodInsights = this.getMoodInsights(monthStart, monthEnd);
        const waterInsights = this.getWaterInsights(monthStart, monthEnd);
        const budgetInsights = this.getBudgetInsights(monthStart, monthEnd);
        const skincareInsights = this.getSkincareInsights(monthStart, monthEnd);

        return `
            <div class="page-header">
                <h1 class="page-title">Monthly Insights</h1>
                <p class="page-subtitle">Your patterns, visualized</p>
            </div>

            <!-- Month Selector -->
            <div class="card" style="margin-bottom: 24px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <button class="btn btn-ghost" onclick="Insights.changeMonth(1)">← Previous</button>
                    <h3 style="font-size: 18px; font-weight: 600;">${monthName}</h3>
                    <button class="btn btn-ghost" onclick="Insights.changeMonth(-1)" ${this.currentMonthOffset === 0 ? 'disabled style="opacity: 0.3; pointer-events: none;"' : ''}>Next →</button>
                </div>
            </div>

            <!-- Overview Stats -->
            <div class="grid-4" style="margin-bottom: 24px;">
                <div class="stat-card">
                    <div class="stat-value" style="font-size: 22px;">${moodInsights ? moodInsights.avgMood.toFixed(1) : '--'}<span style="font-size: 14px; color: var(--text-muted);">/5</span></div>
                    <div class="stat-label">Avg Mood</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="font-size: 22px;">${waterInsights.consistency}%</div>
                    <div class="stat-label">Hydration Goal</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="font-size: 22px;">${skincareInsights.consistency}%</div>
                    <div class="stat-label">Skincare Streak</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="font-size: 22px; color: ${budgetInsights.savings >= 0 ? 'var(--neon-green)' : 'var(--neon-pink)'};">₦${Math.abs(budgetInsights.savings).toFixed(0)}</div>
                    <div class="stat-label">${budgetInsights.savings >= 0 ? 'Saved' : 'Over Budget'}</div>
                </div>
            </div>

            <!-- Mood Insights -->
            ${moodInsights ? `
            <div class="card" style="margin-bottom: 16px;">
                <div class="card-header">
                    <h3 class="card-title">🧠 Mood & Energy</h3>
                    <span class="badge badge-purple">${moodInsights.daysLogged} days logged</span>
                </div>
                
                <div style="display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 120px; padding: 12px; background: var(--bg-input); border-radius: var(--radius-md); text-align: center;">
                        <div style="font-size: 24px; margin-bottom: 4px;">${Mood.moods.find(m => m.value === Math.round(moodInsights.avgMood))?.emoji || '😐'}</div>
                        <div style="font-size: 11px; color: var(--text-muted);">Average Mood</div>
                    </div>
                    <div style="flex: 1; min-width: 120px; padding: 12px; background: var(--bg-input); border-radius: var(--radius-md); text-align: center;">
                        <div style="font-size: 20px; font-weight: 700; color: var(--purple-light);">${moodInsights.avgEnergy.toFixed(1)}/10</div>
                        <div style="font-size: 11px; color: var(--text-muted);">Average Energy</div>
                    </div>
                </div>

                ${Object.keys(moodInsights.phaseAverages).length > 0 ? `
                    <div style="margin-top: 12px;">
                        <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">Mood by Cycle Phase:</div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            ${Object.entries(moodInsights.phaseAverages).map(([phase, data]) => `
                                <div style="display: flex; align-items: center; gap: 12px; padding: 8px 12px; background: var(--bg-input); border-radius: var(--radius-sm);">
                                    <span style="font-size: 12px; font-weight: 600; min-width: 80px; color: var(--text-secondary);">${phase}</span>
                                    <div style="flex: 1;">
                                        <div class="progress-bar" style="height: 6px;">
                                            <div class="progress-fill" style="width: ${(data.mood / 5) * 100}%;"></div>
                                        </div>
                                    </div>
                                    <span style="font-size: 12px; color: var(--text-muted);">Mood: ${data.mood} | Energy: ${data.energy}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
            ` : `
            <div class="card" style="margin-bottom: 16px;">
                <div class="card-header">
                    <h3 class="card-title">🧠 Mood & Energy</h3>
                </div>
                <div class="empty-state" style="padding: 24px;">
                    <p class="empty-state-text">No mood data for this month yet. Start logging to see patterns!</p>
                </div>
            </div>
            `}

            <!-- Water Insights -->
            <div class="card" style="margin-bottom: 16px;">
                <div class="card-header">
                    <h3 class="card-title">💧 Hydration</h3>
                    <span class="badge badge-blue">${waterInsights.goalMetDays}/${waterInsights.totalDays} days</span>
                </div>
                <div style="display: flex; gap: 12px; margin-bottom: 12px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 100px; text-align: center; padding: 12px; background: var(--bg-input); border-radius: var(--radius-md);">
                        <div style="font-size: 20px; font-weight: 700; color: var(--neon-blue);">${waterInsights.totalGlasses}</div>
                        <div style="font-size: 11px; color: var(--text-muted);">Total Glasses</div>
                    </div>
                    <div style="flex: 1; min-width: 100px; text-align: center; padding: 12px; background: var(--bg-input); border-radius: var(--radius-md);">
                        <div style="font-size: 20px; font-weight: 700; color: var(--neon-blue);">${waterInsights.avgPerDay.toFixed(1)}</div>
                        <div style="font-size: 11px; color: var(--text-muted);">Avg/Day</div>
                    </div>
                    <div style="flex: 1; min-width: 100px; text-align: center; padding: 12px; background: var(--bg-input); border-radius: var(--radius-md);">
                        <div style="font-size: 20px; font-weight: 700; color: ${waterInsights.consistency >= 70 ? 'var(--neon-green)' : 'var(--neon-yellow)'};">${waterInsights.consistency}%</div>
                        <div style="font-size: 11px; color: var(--text-muted);">Consistency</div>
                    </div>
                </div>
                <!-- Mini chart -->
                <div style="display: flex; gap: 2px; align-items: flex-end; height: 50px; padding-top: 10px;">
                    ${waterInsights.days.slice(-28).map(d => `
                        <div style="flex: 1; background: ${d.count >= Water.getData().goal ? 'var(--neon-blue)' : d.count > 0 ? 'rgba(6, 182, 212, 0.3)' : 'var(--bg-input)'}; height: ${Math.max(d.count / Water.getData().goal * 40, 3)}px; border-radius: 2px; min-width: 4px;" title="${Storage.formatDate(d.date)}: ${d.count} glasses"></div>
                    `).join('')}
                </div>
            </div>

            <!-- Budget Insights -->
            <div class="card" style="margin-bottom: 16px;">
                <div class="card-header">
                    <h3 class="card-title">💰 Budget</h3>
                    <span class="badge ${budgetInsights.savings >= 0 ? 'badge-green' : 'badge-pink'}">${budgetInsights.savingsRate}% saved</span>
                </div>
                ${budgetInsights.transactionCount > 0 ? `
                    <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 100px; text-align: center; padding: 12px; background: var(--bg-input); border-radius: var(--radius-md);">
                            <div style="font-size: 18px; font-weight: 700; color: var(--neon-green);">₦${budgetInsights.income.toFixed(0)}</div>
                            <div style="font-size: 11px; color: var(--text-muted);">Income</div>
                        </div>
                        <div style="flex: 1; min-width: 100px; text-align: center; padding: 12px; background: var(--bg-input); border-radius: var(--radius-md);">
                            <div style="font-size: 18px; font-weight: 700; color: var(--neon-pink);">₦${budgetInsights.expenses.toFixed(0)}</div>
                            <div style="font-size: 11px; color: var(--text-muted);">Spent</div>
                        </div>
                        <div style="flex: 1; min-width: 100px; text-align: center; padding: 12px; background: var(--bg-input); border-radius: var(--radius-md);">
                            <div style="font-size: 18px; font-weight: 700; color: ${budgetInsights.savings >= 0 ? 'var(--neon-green)' : 'var(--neon-pink)'};">₦${Math.abs(budgetInsights.savings).toFixed(0)}</div>
                            <div style="font-size: 11px; color: var(--text-muted);">${budgetInsights.savings >= 0 ? 'Saved' : 'Over'}</div>
                        </div>
                    </div>
                    ${budgetInsights.topCategories.length > 0 ? `
                        <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">Top Spending:</div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            ${budgetInsights.topCategories.map(([cat, amount]) => `
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 12px; min-width: 100px; color: var(--text-secondary);">${cat}</span>
                                    <div class="progress-bar" style="flex: 1; height: 6px;">
                                        <div class="progress-fill" style="width: ${(amount / budgetInsights.expenses * 100)}%; background: linear-gradient(90deg, var(--neon-pink), var(--purple-primary));"></div>
                                    </div>
                                    <span style="font-size: 12px; color: var(--neon-pink); min-width: 50px; text-align: right;">₦${amount.toFixed(0)}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                ` : `
                    <div class="empty-state" style="padding: 24px;">
                        <p class="empty-state-text">No transactions this month. Start tracking to see insights!</p>
                    </div>
                `}
            </div>

            <!-- Skincare Insights -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🧴 Skincare Consistency</h3>
                    <span class="badge badge-purple">${skincareInsights.daysCompleted}/${skincareInsights.totalDays} days</span>
                </div>
                <div class="progress-bar" style="height: 12px; margin-bottom: 8px;">
                    <div class="progress-fill ${skincareInsights.consistency >= 80 ? 'success' : skincareInsights.consistency >= 50 ? '' : 'warning'}" style="width: ${skincareInsights.consistency}%;"></div>
                </div>
                <p style="font-size: 13px; color: var(--text-secondary);">
                    ${skincareInsights.consistency >= 80 ? '🌟 Amazing consistency! Your skin thanks you.' :
                      skincareInsights.consistency >= 50 ? '👍 Good effort! A little more consistency will show results.' :
                      skincareInsights.consistency >= 20 ? '💪 Room to grow — try setting a reminder for your routine.' :
                      '🌱 Start logging your skincare to see your consistency grow!'}
                </p>
            </div>
        `;
    },

    changeMonth(direction) {
        this.currentMonthOffset += direction;
        if (this.currentMonthOffset < 0) this.currentMonthOffset = 0;
        App.navigate('insights');
    }
};
