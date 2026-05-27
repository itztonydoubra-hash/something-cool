// Luna - Profile Module (Local)
const Profile = {
    getData() {
        return Storage.get('profile') || {
            name: Storage.get('userName') || '',
            birthday: '',
            skinType: '',
            hairType: '',
            goals: [],
            joinDate: Storage.get('onboarding_date') || Storage.today()
        };
    },

    saveData(data) {
        Storage.set('profile', data);
    },

    getDaysUsing() {
        const profile = this.getData();
        const join = new Date(profile.joinDate);
        const now = new Date();
        return Math.max(1, Math.floor((now - join) / (1000 * 60 * 60 * 24)));
    },

    render() {
        const profile = this.getData();
        const daysUsing = this.getDaysUsing();
        const moodData = Mood.getData();
        const winsData = Affirmations.getWinsData();
        const skincareStreak = Skincare.getStreak();

        return `
            <div class="page-header">
                <h1 class="page-title">Profile</h1>
                <p class="page-subtitle">Your Luna journey</p>
            </div>

            <!-- Profile Card -->
            <div class="card" style="text-align: center; padding: 32px; margin-bottom: 24px; border-color: rgba(168, 85, 247, 0.3);">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--purple-primary), var(--neon-pink)); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 32px;">
                    ${profile.name ? profile.name.charAt(0).toUpperCase() : '🌙'}
                </div>
                <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 4px;">${profile.name || 'Luna User'}</h2>
                <p style="font-size: 13px; color: var(--text-muted);">Using Luna for ${daysUsing} day${daysUsing > 1 ? 's' : ''}</p>
                <div style="display: flex; gap: 16px; justify-content: center; margin-top: 16px;">
                    <div style="text-align: center;">
                        <div style="font-size: 18px; font-weight: 700; color: var(--purple-light);">${moodData.entries.length}</div>
                        <div style="font-size: 11px; color: var(--text-muted);">Check-ins</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 18px; font-weight: 700; color: var(--neon-pink);">${winsData.entries.length}</div>
                        <div style="font-size: 11px; color: var(--text-muted);">Wins</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 18px; font-weight: 700; color: var(--neon-green);">${skincareStreak}</div>
                        <div style="font-size: 11px; color: var(--text-muted);">Day Streak</div>
                    </div>
                </div>
            </div>

            <!-- Edit Profile -->
            <div class="card" style="margin-bottom: 20px;">
                <div class="card-header">
                    <h3 class="card-title">Edit Profile</h3>
                </div>
                <div class="input-group">
                    <label class="input-label">Name</label>
                    <input type="text" class="input" id="profile-name" value="${profile.name}" placeholder="Your name">
                </div>
                <div class="input-group">
                    <label class="input-label">Birthday</label>
                    <input type="date" class="input" id="profile-birthday" value="${profile.birthday}">
                </div>
                <div class="grid-2">
                    <div class="input-group">
                        <label class="input-label">Skin Type</label>
                        <select class="input" id="profile-skin">
                            <option value="">Select...</option>
                            <option value="Oily" ${profile.skinType === 'Oily' ? 'selected' : ''}>Oily</option>
                            <option value="Dry" ${profile.skinType === 'Dry' ? 'selected' : ''}>Dry</option>
                            <option value="Combination" ${profile.skinType === 'Combination' ? 'selected' : ''}>Combination</option>
                            <option value="Normal" ${profile.skinType === 'Normal' ? 'selected' : ''}>Normal</option>
                            <option value="Sensitive" ${profile.skinType === 'Sensitive' ? 'selected' : ''}>Sensitive</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label class="input-label">Hair Type</label>
                        <select class="input" id="profile-hair">
                            <option value="">Select...</option>
                            <option value="Straight" ${profile.hairType === 'Straight' ? 'selected' : ''}>Straight</option>
                            <option value="Wavy" ${profile.hairType === 'Wavy' ? 'selected' : ''}>Wavy</option>
                            <option value="Curly" ${profile.hairType === 'Curly' ? 'selected' : ''}>Curly</option>
                            <option value="Coily" ${profile.hairType === 'Coily' ? 'selected' : ''}>Coily</option>
                            <option value="Locs" ${profile.hairType === 'Locs' ? 'selected' : ''}>Locs</option>
                            <option value="Natural" ${profile.hairType === 'Natural' ? 'selected' : ''}>Natural</option>
                        </select>
                    </div>
                </div>
                <button class="btn btn-primary btn-full" onclick="Profile.handleSave()">Save Profile</button>
            </div>

            <!-- Goals -->
            <div class="card" style="margin-bottom: 20px;">
                <div class="card-header">
                    <h3 class="card-title">My Goals</h3>
                </div>
                <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                    <input type="text" class="input" id="profile-goal-input" placeholder="Add a goal..." style="margin-bottom: 0; flex: 1;" onkeypress="if(event.key==='Enter') Profile.addGoal()">
                    <button class="btn btn-primary" onclick="Profile.addGoal()">+</button>
                </div>
                ${profile.goals.length > 0 ? `
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        ${profile.goals.map((goal, i) => `
                            <div style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--bg-input); border-radius: var(--radius-md);">
                                <span style="font-size: 14px;">🎯</span>
                                <span style="flex: 1; font-size: 13px;">${goal}</span>
                                <button class="btn btn-ghost btn-sm" onclick="Profile.removeGoal(${i})" style="color: var(--danger); font-size: 11px;">✕</button>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <p style="font-size: 13px; color: var(--text-muted); text-align: center;">No goals yet. What are you working towards?</p>
                `}
            </div>

            <!-- Quick Links -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Quick Links</h3>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button class="btn btn-secondary btn-full" style="justify-content: flex-start;" onclick="App.navigate('settings')">⚙️ Settings & Data</button>
                    <button class="btn btn-secondary btn-full" style="justify-content: flex-start;" onclick="App.exportData()">📥 Export My Data</button>
                    <button class="btn btn-secondary btn-full" style="justify-content: flex-start;" onclick="Profile.resetOnboarding()">🔄 Redo Onboarding</button>
                </div>
            </div>
        `;
    },

    handleSave() {
        const profile = this.getData();
        profile.name = document.getElementById('profile-name').value.trim();
        profile.birthday = document.getElementById('profile-birthday').value;
        profile.skinType = document.getElementById('profile-skin').value;
        profile.hairType = document.getElementById('profile-hair').value;
        this.saveData(profile);
        Storage.set('userName', profile.name);
        showToast('Profile saved! 💜');
    },

    addGoal() {
        const input = document.getElementById('profile-goal-input');
        const goal = input.value.trim();
        if (!goal) return;
        const profile = this.getData();
        profile.goals.push(goal);
        this.saveData(profile);
        App.navigate('profile');
    },

    removeGoal(index) {
        const profile = this.getData();
        profile.goals.splice(index, 1);
        this.saveData(profile);
        App.navigate('profile');
    },

    resetOnboarding() {
        if (confirm('This will show the onboarding flow again next time you open Luna. Continue?')) {
            Storage.remove('onboarding_complete');
            showToast('Onboarding reset! Refresh to see it again.');
        }
    }
};
