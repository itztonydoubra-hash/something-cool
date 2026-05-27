// Luna - Dashboard Module
const Dashboard = {
    getGreeting() {
        const hour = new Date().getHours();
        const name = Storage.get('userName');
        let greeting;
        if (hour < 12) greeting = 'Good morning';
        else if (hour < 17) greeting = 'Good afternoon';
        else greeting = 'Good evening';
        return name ? `${greeting}, ${name}` : greeting;
    },

    getSelfCareSuggestion() {
        const phase = Cycle.getCurrentPhase();
        const moodEntry = Mood.getTodayEntry();
        const suggestions = {
            'Menstrual': [
                'Take it easy today. A warm bath and your favorite show sounds perfect.',
                'Your body is working hard. Rest is productive today.',
                'Comfort food and cozy blankets are your prescription today.',
                'Gentle stretching or a slow walk — nothing intense needed.'
            ],
            'Follicular': [
                'Your energy is rising! Great day to start something new.',
                'Social energy is high — reach out to a friend today.',
                'Try a new workout or recipe. Your body is ready for it.',
                'Perfect time to plan and organize your week ahead.'
            ],
            'Ovulation': [
                'You\'re in your power phase! Speak up in that meeting.',
                'Confidence is naturally high — go after what you want.',
                'Your glow is real right now. Own it.',
                'Great day for important conversations or decisions.'
            ],
            'Luteal': [
                'Start winding down. Extra sleep isn\'t lazy, it\'s necessary.',
                'Cravings are normal right now. Honor them without guilt.',
                'This is your cozy phase. Nest, journal, reflect.',
                'Be gentle with yourself. PMS doesn\'t define you.'
            ],
            'Not Set': [
                'You showed up today. That\'s already a win.',
                'Remember: rest is productive. You don\'t have to earn it.',
                'Drink some water, take a breath. You\'re doing great.',
                'What would make you smile right now? Do that thing.'
            ]
        };

        const phaseSuggestions = suggestions[phase.name] || suggestions['Not Set'];
        const index = new Date().getDate() % phaseSuggestions.length;
        return phaseSuggestions[index];
    },

    render() {
        const phase = Cycle.getCurrentPhase();
        const nextPeriod = Cycle.getNextPeriod();
        const waterCount = Water.getTodayCount();
        const waterData = Water.getData();
        const moodEntry = Mood.getTodayEntry();
        const moodEmoji = moodEntry ? Mood.moods.find(m => m.value === moodEntry.mood)?.emoji || '' : '';
        const skincareData = Skincare.getData();
        const todayLog = Skincare.getTodayLog();
        const budgetStats = Budget.getMonthlyStats();
        const streak = Skincare.getStreak();
        const suggestion = this.getSelfCareSuggestion();

        const morningDone = skincareData.morning.length > 0 ? todayLog.morning.length : 0;
        const morningTotal = skincareData.morning.length;
        const nightDone = skincareData.night.length > 0 ? todayLog.night.length : 0;
        const nightTotal = skincareData.night.length;

        return `
            <div class="page-header">
                <h1 class="page-title">${this.getGreeting()} &#127769;</h1>
                <p class="page-subtitle">Here's your day at a glance</p>
            </div>

            <!-- Self-Care Suggestion -->
            <div class="card glow-pulse" style="margin-bottom: 24px; border-color: rgba(168, 85, 247, 0.3); background: linear-gradient(135deg, var(--bg-card), rgba(168, 85, 247, 0.05));">
                <div style="display: flex; align-items: start; gap: 12px;">
                    <span style="font-size: 24px;">💜</span>
                    <div>
                        <div style="font-size: 12px; color: var(--purple-light); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Today's Affirmation</div>
                        <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.5; font-style: italic;">"${Affirmations.getTodayAffirmation()}"</p>
                        <div style="margin-top: 12px; font-size: 12px; color: var(--purple-light); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Self-Care Tip</div>
                        <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.5;">${suggestion}</p>
                    </div>
                </div>
            </div>

            <!-- Main Stats Grid -->
            <div class="dashboard-grid">
                <!-- Cycle Card -->
                <div class="dashboard-card" onclick="App.navigate('cycle')">
                    <div class="dashboard-card-header">
                        <span class="dashboard-card-title">Cycle</span>
                        <span class="badge badge-${phase.color || 'purple'}">${phase.name}</span>
                    </div>
                    <div class="dashboard-card-value">${phase.icon} Day ${phase.day || '--'}</div>
                    <div class="dashboard-card-detail">
                        ${nextPeriod ? `Next period in ${nextPeriod.daysUntil} days` : 'Tap to set up tracking'}
                    </div>
                </div>

                <!-- Mood Card -->
                <div class="dashboard-card" onclick="App.navigate('mood')">
                    <div class="dashboard-card-header">
                        <span class="dashboard-card-title">Mood</span>
                        ${moodEntry ? `<span class="badge badge-purple">Logged</span>` : `<span class="badge badge-yellow">Not logged</span>`}
                    </div>
                    <div class="dashboard-card-value">${moodEntry ? moodEmoji : '&#128172;'} ${moodEntry ? Mood.moods.find(m => m.value === moodEntry.mood)?.label || '' : 'Check in'}</div>
                    <div class="dashboard-card-detail">
                        ${moodEntry ? `Energy: ${moodEntry.energy}/10` : 'How are you feeling today?'}
                    </div>
                </div>

                <!-- Water Card -->
                <div class="dashboard-card" onclick="App.navigate('water')">
                    <div class="dashboard-card-header">
                        <span class="dashboard-card-title">Hydration</span>
                        <span class="badge ${waterCount >= waterData.goal ? 'badge-green' : 'badge-blue'}">${waterCount >= waterData.goal ? 'Goal met!' : `${waterCount}/${waterData.goal}`}</span>
                    </div>
                    <div class="dashboard-card-value">&#128167; ${waterCount} glasses</div>
                    <div class="progress-bar" style="margin-top: 8px;">
                        <div class="progress-fill ${waterCount >= waterData.goal ? 'success' : ''}" style="width: ${Math.min((waterCount / waterData.goal) * 100, 100)}%;"></div>
                    </div>
                </div>

                <!-- Skincare Card -->
                <div class="dashboard-card" onclick="App.navigate('skincare')">
                    <div class="dashboard-card-header">
                        <span class="dashboard-card-title">Skincare</span>
                        <span class="badge badge-purple">${streak} day streak</span>
                    </div>
                    <div class="dashboard-card-value">&#10025; ${morningDone + nightDone}/${morningTotal + nightTotal} steps</div>
                    <div class="dashboard-card-detail">
                        AM: ${morningDone}/${morningTotal} &middot; PM: ${nightDone}/${nightTotal}
                    </div>
                </div>

                <!-- Budget Card -->
                <div class="dashboard-card" onclick="App.navigate('budget')">
                    <div class="dashboard-card-header">
                        <span class="dashboard-card-title">Budget</span>
                        <span class="badge ${budgetStats.balance >= 0 ? 'badge-green' : 'badge-pink'}">${budgetStats.balance >= 0 ? 'On track' : 'Over budget'}</span>
                    </div>
                    <div class="dashboard-card-value" style="color: ${budgetStats.balance >= 0 ? 'var(--neon-green)' : 'var(--neon-pink)'};">₦${Math.abs(budgetStats.balance).toFixed(0)}</div>
                    <div class="dashboard-card-detail">
                        Spent ₦${budgetStats.expenses.toFixed(0)} this month
                    </div>
                </div>

                <!-- Medications Card -->
                <div class="dashboard-card" onclick="App.navigate('water')">
                    <div class="dashboard-card-header">
                        <span class="dashboard-card-title">Medications</span>
                    </div>
                    ${(() => {
                        const meds = Water.getData().medications;
                        const today = Storage.today();
                        const taken = meds.filter(m => m.taken[today]).length;
                        return `
                            <div class="dashboard-card-value">&#128138; ${taken}/${meds.length}</div>
                            <div class="dashboard-card-detail">${taken === meds.length && meds.length > 0 ? 'All taken today!' : meds.length === 0 ? 'No meds tracked' : `${meds.length - taken} remaining`}</div>
                        `;
                    })()}
                </div>

                <!-- Outfits Card -->
                <div class="dashboard-card" onclick="App.navigate('outfits')">
                    <div class="dashboard-card-header">
                        <span class="dashboard-card-title">Outfits</span>
                        <span class="badge badge-pink">${Outfits.getData().wardrobe.length} items</span>
                    </div>
                    <div class="dashboard-card-value">👗 ${Outfits.getData().wardrobe.length > 0 ? 'Pick an outfit' : 'Add clothes'}</div>
                    <div class="dashboard-card-detail">
                        ${Outfits.getData().wardrobe.length > 0 ? `${Outfits.getNeglected().length} items need love` : 'Build your digital closet'}
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="card" style="margin-top: 8px;">
                <div class="card-header">
                    <h3 class="card-title">Quick Actions</h3>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="btn btn-secondary btn-sm" onclick="Water.addGlass(); App.navigate('dashboard');">💧 + Water</button>
                    <button class="btn btn-secondary btn-sm" onclick="App.navigate('mood')">✨ Log Mood</button>
                    <button class="btn btn-secondary btn-sm" onclick="App.navigate('cycle')">☽ Log Period</button>
                    <button class="btn btn-secondary btn-sm" onclick="App.navigate('budget')">💰 Add Expense</button>
                    <button class="btn btn-secondary btn-sm" onclick="App.navigate('selfcare')">💆‍♀️ Self-Care</button>
                    <button class="btn btn-secondary btn-sm" onclick="App.navigate('affirmations')">🏆 Log a Win</button>
                    <button class="btn btn-secondary btn-sm" onclick="App.navigate('outfits')">👗 Outfits</button>
                    <button class="btn btn-secondary btn-sm" onclick="App.navigate('aichat')">💬 AI Bestie</button>
                    <button class="btn btn-secondary btn-sm" onclick="App.navigate('insights')">📊 Insights</button>
                </div>
            </div>
        `;
    }
};
