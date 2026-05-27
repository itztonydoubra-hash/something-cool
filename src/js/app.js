// Luna - Main App Controller
const App = {
    currentPage: 'dashboard',

    init() {
        // Check if first-time user
        if (Onboarding.isFirstTime()) {
            document.getElementById('sidebar').style.display = 'none';
            document.getElementById('mobile-nav').style.display = 'none';
            Onboarding.start();
        } else {
            this.navigate('dashboard');
        }
        this.setupNavigation();
        this.registerServiceWorker();
    },

    setupNavigation() {
        // Desktop sidebar navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.navigate(page);
            });
        });

        // Mobile bottom navigation
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.navigate(page);
            });
        });
    },

    navigate(page) {
        this.currentPage = page;
        const content = document.getElementById('main-content');

        // Update active nav states
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        // Render page content
        let html = '';
        switch (page) {
            case 'dashboard':
                html = Dashboard.render();
                break;
            case 'cycle':
                html = Cycle.render();
                break;
            case 'mood':
                html = Mood.render();
                break;
            case 'water':
                html = Water.render();
                break;
            case 'skincare':
                html = Skincare.render();
                break;
            case 'budget':
                html = Budget.render();
                break;
            case 'selfcare':
                html = SelfCare.render();
                break;
            case 'affirmations':
                html = Affirmations.render();
                break;
            case 'aichat':
                html = AIChat.render();
                break;
            case 'outfits':
                html = Outfits.render();
                break;
            case 'wishlist':
                html = Wishlist.render();
                break;
            case 'streaks':
                html = Streaks.render();
                break;
            case 'insights':
                html = Insights.render();
                break;
            case 'profile':
                html = Profile.render();
                break;
            case 'settings':
                html = this.renderSettings();
                break;
            default:
                html = Dashboard.render();
        }

        content.innerHTML = `<div class="fade-in">${html}</div>`;
        window.scrollTo(0, 0);

        // Post-render hooks
        if (page === 'aichat' && AIChat.messages.length > 0) {
            AIChat.renderMessages();
        }
    },

    renderSettings() {
        return `
            <div class="page-header">
                <h1 class="page-title">Settings</h1>
                <p class="page-subtitle">Customize your Luna experience</p>
            </div>

            <div class="settings-section">
                <h3 class="settings-title">&#127769; About Luna</h3>
                <div class="card" style="text-align: center; padding: 32px;">
                    <div style="font-size: 48px; margin-bottom: 12px;">&#127769;</div>
                    <h2 style="font-size: 20px; margin-bottom: 4px; background: linear-gradient(135deg, var(--purple-light), var(--neon-pink)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Luna</h2>
                    <p style="font-size: 13px; color: var(--text-muted);">Your life, illuminated.</p>
                    <p style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">Version 1.0</p>
                </div>
            </div>

            <div class="settings-section">
                <h3 class="settings-title">&#128274; Data & Privacy</h3>
                <div class="settings-item">
                    <div class="settings-item-info">
                        <span class="settings-item-label">Your data stays on your device</span>
                        <span class="settings-item-desc">Everything is stored locally. Nothing is sent anywhere.</span>
                    </div>
                    <span class="badge badge-green">Private</span>
                </div>
                <div class="settings-item">
                    <div class="settings-item-info">
                        <span class="settings-item-label">Export Data</span>
                        <span class="settings-item-desc">Download all your data as a JSON file</span>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="App.exportData()">Export</button>
                </div>
                <div class="settings-item">
                    <div class="settings-item-info">
                        <span class="settings-item-label">Clear All Data</span>
                        <span class="settings-item-desc">This cannot be undone</span>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="App.clearData()">Clear</button>
                </div>
            </div>

            <div class="settings-section">
                <h3 class="settings-title">&#129302; AI Features (Coming Soon)</h3>
                <div class="settings-item">
                    <div class="settings-item-info">
                        <span class="settings-item-label">API Key</span>
                        <span class="settings-item-desc">Add an OpenAI or Claude key to unlock AI features</span>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="App.showApiKeyModal()">Configure</button>
                </div>
                <div class="card" style="margin-top: 8px; background: rgba(168, 85, 247, 0.05); border-color: rgba(168, 85, 247, 0.2);">
                    <p style="font-size: 13px; color: var(--text-secondary);">&#10024; AI features will include: personal hype friend, relationship advice mirror, smart self-care suggestions, and cycle-aware planning.</p>
                </div>
            </div>

            <!-- API Key Modal -->
            <div class="modal-overlay" id="api-modal">
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title">AI Configuration</h3>
                        <button class="modal-close" onclick="App.hideApiKeyModal()">&times;</button>
                    </div>
                    <div class="input-group">
                        <label class="input-label">API Provider</label>
                        <select class="input" id="api-provider">
                            <option value="openai">OpenAI (GPT-4)</option>
                            <option value="anthropic">Anthropic (Claude)</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label class="input-label">API Key</label>
                        <input type="password" class="input" id="api-key-input" placeholder="sk-..." value="${Storage.get('api_key') || ''}">
                    </div>
                    <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">Your key is stored locally and never shared. It's used only to power AI features on your device.</p>
                    <button class="btn btn-primary btn-full" onclick="App.saveApiKey()">Save Key</button>
                </div>
            </div>
        `;
    },

    showApiKeyModal() {
        document.getElementById('api-modal').classList.add('active');
    },

    hideApiKeyModal() {
        document.getElementById('api-modal').classList.remove('active');
    },

    saveApiKey() {
        const key = document.getElementById('api-key-input').value.trim();
        const provider = document.getElementById('api-provider').value;
        if (key) {
            Storage.set('api_key', key);
            Storage.set('api_provider', provider);
            showToast('API key saved! AI features coming soon &#10024;');
            this.hideApiKeyModal();
        }
    },

    exportData() {
        const data = {
            cycle: Storage.get('cycle'),
            mood: Storage.get('mood'),
            water: Storage.get('water'),
            skincare: Storage.get('skincare'),
            budget: Storage.get('budget'),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `luna-backup-${Storage.today()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Data exported!');
    },

    clearData() {
        if (confirm('Are you sure? This will delete ALL your Luna data permanently.')) {
            if (confirm('Really sure? This cannot be undone.')) {
                localStorage.clear();
                showToast('All data cleared.');
                this.navigate('dashboard');
            }
        }
    },

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(() => {
                // Service worker registration failed - that's okay
            });
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
