// Luna - Affirmation & Wins Journal Module
const Affirmations = {
    // Curated affirmations organized by theme
    library: {
        confidence: [
            "You are worthy of every good thing coming your way.",
            "Your voice matters. Speak up today.",
            "You don't need to prove anything to anyone.",
            "You are not too much. You are exactly enough.",
            "The right people will never make you feel small.",
            "You deserve to take up space.",
            "Your feelings are valid — every single one.",
            "You are your own definition of beautiful.",
            "Trust yourself. You've survived everything so far.",
            "You don't need permission to be yourself."
        ],
        growth: [
            "Progress isn't always visible. Trust the process.",
            "You're not behind. You're on your own timeline.",
            "Every small step still moves you forward.",
            "It's okay to outgrow things that once fit.",
            "Resting is not quitting. It's recharging.",
            "You are allowed to change your mind.",
            "The version of you right now is enough.",
            "You don't have to have it all figured out today.",
            "Growth happens in the uncomfortable moments.",
            "You are becoming someone you'll be so proud of."
        ],
        selfLove: [
            "You are worthy of the love you give to others.",
            "Being kind to yourself is not selfish.",
            "Your body is not the enemy. It carries you through life.",
            "You deserve the same compassion you give everyone else.",
            "It's okay to put yourself first sometimes.",
            "You are loved, even on the days you don't feel lovable.",
            "Your worth is not tied to your productivity.",
            "Forgive yourself for not knowing better before.",
            "You are not your worst moment.",
            "Today, choose yourself. Unapologetically."
        ],
        strength: [
            "You have survived 100% of your hardest days.",
            "Asking for help is strength, not weakness.",
            "You are more resilient than you give yourself credit for.",
            "Hard days don't define you. How you rise does.",
            "You've handled hard things before. You'll handle this too.",
            "Your sensitivity is a superpower, not a flaw.",
            "You are allowed to set boundaries without guilt.",
            "The storm will pass. You will remain.",
            "You don't need to be brave every second. Just the next one.",
            "You are not fragile. You are fierce."
        ],
        peace: [
            "Not everything deserves your energy. Choose wisely.",
            "You are allowed to walk away from what hurts you.",
            "Peace is a priority, not a luxury.",
            "Let go of what you can't control.",
            "Silence is sometimes the loudest power move.",
            "You don't owe anyone an explanation for protecting your peace.",
            "Breathe. This moment will pass.",
            "It's okay to not be okay. Just don't unpack and live there.",
            "The right thing will feel like relief, not resistance.",
            "You are allowed to rest without earning it."
        ]
    },

    // Get today's affirmation (changes daily)
    getTodayAffirmation() {
        const allAffirmations = Object.values(this.library).flat();
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const index = dayOfYear % allAffirmations.length;
        return allAffirmations[index];
    },

    // Get a random affirmation from a specific category
    getRandomFromCategory(category) {
        const list = this.library[category] || this.library.confidence;
        return list[Math.floor(Math.random() * list.length)];
    },

    // Wins Journal
    getWinsData() {
        return Storage.get('wins') || { entries: [] };
    },

    saveWinsData(data) {
        Storage.set('wins', data);
    },

    addWin(text, category = 'general') {
        const data = this.getWinsData();
        data.entries.push({
            id: Date.now(),
            text,
            category,
            date: Storage.today()
        });
        this.saveWinsData(data);
    },

    removeWin(id) {
        const data = this.getWinsData();
        data.entries = data.entries.filter(w => w.id !== id);
        this.saveWinsData(data);
        App.navigate('affirmations');
    },

    getStreak() {
        const data = this.getWinsData();
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 60; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            if (data.entries.some(e => e.date === dateStr)) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }
        return streak;
    },

    render() {
        const todayAffirmation = this.getTodayAffirmation();
        const winsData = this.getWinsData();
        const recentWins = winsData.entries.slice(-20).reverse();
        const streak = this.getStreak();
        const todayWins = winsData.entries.filter(w => w.date === Storage.today());

        return `
            <div class="page-header">
                <h1 class="page-title">Affirmations & Wins</h1>
                <p class="page-subtitle">Your daily dose of truth</p>
            </div>

            <!-- Today's Affirmation -->
            <div class="card glow-pulse" style="text-align: center; padding: 40px 24px; margin-bottom: 24px; border-color: rgba(168, 85, 247, 0.3); background: linear-gradient(135deg, rgba(168, 85, 247, 0.05), rgba(236, 72, 153, 0.05));">
                <div style="font-size: 32px; margin-bottom: 16px;">💜</div>
                <p style="font-size: 18px; font-weight: 500; line-height: 1.6; color: var(--text-primary); font-style: italic;">"${todayAffirmation}"</p>
                <p style="font-size: 12px; color: var(--text-muted); margin-top: 12px;">Today's affirmation</p>
                <button class="btn btn-ghost btn-sm" style="margin-top: 12px;" onclick="Affirmations.showNewAffirmation()">Show me another →</button>
            </div>

            <!-- Affirmation Categories -->
            <div class="card" style="margin-bottom: 24px;">
                <div class="card-header">
                    <h3 class="card-title">Browse by Vibe</h3>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="btn btn-secondary btn-sm" onclick="Affirmations.showCategory('confidence')">💪 Confidence</button>
                    <button class="btn btn-secondary btn-sm" onclick="Affirmations.showCategory('growth')">🌱 Growth</button>
                    <button class="btn btn-secondary btn-sm" onclick="Affirmations.showCategory('selfLove')">💕 Self-Love</button>
                    <button class="btn btn-secondary btn-sm" onclick="Affirmations.showCategory('strength')">🔥 Strength</button>
                    <button class="btn btn-secondary btn-sm" onclick="Affirmations.showCategory('peace')">🕊️ Peace</button>
                </div>
                <div id="category-affirmation" style="margin-top: 16px; padding: 16px; background: var(--bg-input); border-radius: var(--radius-md); display: none;">
                    <p id="category-affirmation-text" style="font-size: 14px; font-style: italic; color: var(--text-secondary);"></p>
                </div>
            </div>

            <!-- Wins Journal -->
            <div class="card" style="margin-bottom: 20px;">
                <div class="card-header">
                    <h3 class="card-title">🏆 Wins Journal</h3>
                    <span class="badge badge-purple">${streak} day streak</span>
                </div>
                <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">Big or small — if it made you proud, it counts.</p>
                <div style="display: flex; gap: 8px;">
                    <input type="text" class="input" id="win-input" placeholder="What's a win from today?" style="margin-bottom: 0; flex: 1;" onkeypress="if(event.key==='Enter') Affirmations.handleAddWin()">
                    <button class="btn btn-primary" onclick="Affirmations.handleAddWin()">+</button>
                </div>
            </div>

            <!-- Today's Wins -->
            ${todayWins.length > 0 ? `
            <div class="card" style="margin-bottom: 16px;">
                <div class="card-header">
                    <h3 class="card-title">Today's Wins ✨</h3>
                    <span style="font-size: 13px; color: var(--text-muted);">${todayWins.length} win${todayWins.length > 1 ? 's' : ''}</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${todayWins.map(w => `
                        <div style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: rgba(16, 185, 129, 0.05); border-radius: var(--radius-md); border: 1px solid rgba(16, 185, 129, 0.15);">
                            <span style="font-size: 16px;">🌟</span>
                            <span style="flex: 1; font-size: 14px;">${w.text}</span>
                            <button class="btn btn-ghost btn-sm" onclick="Affirmations.removeWin(${w.id})" style="color: var(--text-muted); font-size: 11px;">✕</button>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- All Wins History -->
            ${recentWins.length > 0 ? `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Win History</h3>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${recentWins.filter(w => w.date !== Storage.today()).slice(0, 10).map(w => `
                        <div style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: var(--bg-input); border-radius: var(--radius-md);">
                            <span style="font-size: 14px;">🌟</span>
                            <div style="flex: 1;">
                                <div style="font-size: 13px;">${w.text}</div>
                                <div style="font-size: 11px; color: var(--text-muted);">${Storage.formatDate(w.date)}</div>
                            </div>
                            <button class="btn btn-ghost btn-sm" onclick="Affirmations.removeWin(${w.id})" style="color: var(--text-muted); font-size: 11px;">✕</button>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        `;
    },

    showNewAffirmation() {
        const categories = Object.keys(this.library);
        const randomCat = categories[Math.floor(Math.random() * categories.length)];
        const affirmation = this.getRandomFromCategory(randomCat);
        showToast(affirmation);
    },

    showCategory(category) {
        const affirmation = this.getRandomFromCategory(category);
        const container = document.getElementById('category-affirmation');
        const text = document.getElementById('category-affirmation-text');
        container.style.display = 'block';
        text.textContent = `"${affirmation}"`;
    },

    handleAddWin() {
        const input = document.getElementById('win-input');
        const text = input.value.trim();
        if (!text) {
            showToast('Write your win first!');
            return;
        }
        this.addWin(text);
        showToast('Win logged! You\'re amazing 🌟');
        App.navigate('affirmations');
    }
};
