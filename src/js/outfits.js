// Luna - Outfit Picker & Digital Closet Module
const Outfits = {
    categories: ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Bags', 'Activewear'],

    occasions: ['Casual', 'Work', 'Date Night', 'Going Out', 'Gym', 'Cozy Day', 'Special Event', 'Brunch'],

    moods: ['Confident', 'Comfy', 'Cute', 'Bold', 'Minimal', 'Feminine', 'Edgy', 'Professional'],

    colors: ['Black', 'White', 'Navy', 'Grey', 'Brown', 'Beige', 'Pink', 'Red', 'Blue', 'Green', 'Purple', 'Yellow', 'Orange', 'Multi'],

    seasons: ['Spring', 'Summer', 'Fall', 'Winter', 'All Year'],

    getData() {
        return Storage.get('outfits') || {
            wardrobe: [],
            outfitLog: {},
            favorites: []
        };
    },

    saveData(data) {
        Storage.set('outfits', data);
    },

    // Add a clothing item
    addItem(name, category, color, season, notes = '') {
        const data = this.getData();
        data.wardrobe.push({
            id: Date.now(),
            name,
            category,
            color,
            season,
            notes,
            addedDate: Storage.today(),
            wornCount: 0,
            lastWorn: null
        });
        this.saveData(data);
    },

    removeItem(id) {
        const data = this.getData();
        data.wardrobe = data.wardrobe.filter(item => item.id !== id);
        this.saveData(data);
        App.navigate('outfits');
    },

    // Log wearing an item
    wearItem(id) {
        const data = this.getData();
        const item = data.wardrobe.find(i => i.id === id);
        if (item) {
            item.wornCount++;
            item.lastWorn = Storage.today();
        }
        if (!data.outfitLog[Storage.today()]) {
            data.outfitLog[Storage.today()] = [];
        }
        data.outfitLog[Storage.today()].push(id);
        this.saveData(data);
        showToast(`Logged! You look amazing 💅`);
        App.navigate('outfits');
    },

    // Get items by category
    getByCategory(category) {
        const data = this.getData();
        return data.wardrobe.filter(i => i.category === category);
    },

    // Get least worn items (things she hasn't worn in a while)
    getLeastWorn(limit = 5) {
        const data = this.getData();
        return [...data.wardrobe]
            .sort((a, b) => (a.wornCount || 0) - (b.wornCount || 0))
            .slice(0, limit);
    },

    // Get items not worn recently
    getNeglected(days = 14) {
        const data = this.getData();
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        const cutoffStr = cutoff.toISOString().split('T')[0];

        return data.wardrobe.filter(i => !i.lastWorn || i.lastWorn < cutoffStr);
    },

    // Generate outfit suggestion based on occasion, mood, weather
    suggestOutfit(occasion, mood) {
        const data = this.getData();
        if (data.wardrobe.length < 3) return null;

        // Simple suggestion logic based on occasion + mood
        const suggestions = {};
        const seasonNow = this.getCurrentSeason();

        // Filter items by current season
        const seasonalItems = data.wardrobe.filter(i => i.season === seasonNow || i.season === 'All Year');
        const items = seasonalItems.length > 3 ? seasonalItems : data.wardrobe;

        // Pick one from each main category
        const tops = items.filter(i => i.category === 'Tops');
        const bottoms = items.filter(i => i.category === 'Bottoms');
        const dresses = items.filter(i => i.category === 'Dresses');
        const shoes = items.filter(i => i.category === 'Shoes');
        const outerwear = items.filter(i => i.category === 'Outerwear');
        const accessories = items.filter(i => i.category === 'Accessories');

        // Prefer least worn items for variety
        const pickRandom = (arr) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;
        const pickLeastWorn = (arr) => {
            if (arr.length === 0) return null;
            const sorted = [...arr].sort((a, b) => (a.wornCount || 0) - (b.wornCount || 0));
            // Pick from top 3 least worn randomly for variety
            const pool = sorted.slice(0, Math.min(3, sorted.length));
            return pool[Math.floor(Math.random() * pool.length)];
        };

        // Decide: dress or top+bottom
        const useDress = dresses.length > 0 && Math.random() > 0.5;

        if (useDress) {
            suggestions.main = pickLeastWorn(dresses);
        } else {
            suggestions.top = pickLeastWorn(tops);
            suggestions.bottom = pickLeastWorn(bottoms);
        }

        suggestions.shoes = pickRandom(shoes);
        if (outerwear.length > 0 && (seasonNow === 'Fall' || seasonNow === 'Winter')) {
            suggestions.outerwear = pickRandom(outerwear);
        }
        if (accessories.length > 0) {
            suggestions.accessory = pickRandom(accessories);
        }

        return suggestions;
    },

    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'Spring';
        if (month >= 5 && month <= 7) return 'Summer';
        if (month >= 8 && month <= 10) return 'Fall';
        return 'Winter';
    },

    // Get wardrobe stats
    getStats() {
        const data = this.getData();
        const total = data.wardrobe.length;
        const categories = {};
        data.wardrobe.forEach(i => {
            categories[i.category] = (categories[i.category] || 0) + 1;
        });
        const mostWorn = [...data.wardrobe].sort((a, b) => (b.wornCount || 0) - (a.wornCount || 0)).slice(0, 3);
        const neverWorn = data.wardrobe.filter(i => !i.wornCount || i.wornCount === 0);

        return { total, categories, mostWorn, neverWorn };
    },

    render() {
        const data = this.getData();
        const stats = this.getStats();
        const neglected = this.getNeglected();
        const todayOutfit = data.outfitLog[Storage.today()] || [];

        return `
            <div class="page-header">
                <h1 class="page-title">Outfits</h1>
                <p class="page-subtitle">Your digital closet & outfit picker</p>
            </div>

            <!-- Wardrobe Stats -->
            <div class="grid-3" style="margin-bottom: 24px;">
                <div class="stat-card">
                    <div class="stat-value">${stats.total}</div>
                    <div class="stat-label">Total Items</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.neverWorn.length}</div>
                    <div class="stat-label">Never Worn</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${todayOutfit.length}</div>
                    <div class="stat-label">Worn Today</div>
                </div>
            </div>

            <!-- Outfit Generator -->
            <div class="card" style="margin-bottom: 20px; border-color: rgba(168, 85, 247, 0.2); background: linear-gradient(135deg, var(--bg-card), rgba(236, 72, 153, 0.03));">
                <div class="card-header">
                    <h3 class="card-title">👗 What Should I Wear?</h3>
                </div>
                ${data.wardrobe.length < 3 ? `
                    <p style="font-size: 13px; color: var(--text-secondary);">Add at least 3 items to your wardrobe to get outfit suggestions!</p>
                ` : `
                    <div class="grid-2" style="margin-bottom: 12px;">
                        <div class="input-group">
                            <label class="input-label">Occasion</label>
                            <select class="input" id="outfit-occasion">
                                ${this.occasions.map(o => `<option value="${o}">${o}</option>`).join('')}
                            </select>
                        </div>
                        <div class="input-group">
                            <label class="input-label">Mood</label>
                            <select class="input" id="outfit-mood">
                                ${this.moods.map(m => `<option value="${m}">${m}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <button class="btn btn-primary btn-full" onclick="Outfits.handleSuggest()">Pick My Outfit ✨</button>
                    <div id="outfit-suggestion" style="margin-top: 16px; display: none;"></div>
                `}
            </div>

            <!-- Add Item -->
            <div class="card" style="margin-bottom: 20px;">
                <div class="card-header">
                    <h3 class="card-title">➕ Add to Wardrobe</h3>
                </div>
                <div class="grid-2">
                    <div class="input-group">
                        <label class="input-label">Item Name</label>
                        <input type="text" class="input" id="item-name" placeholder="e.g., Black crop top">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Category</label>
                        <select class="input" id="item-category">
                            ${this.categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="grid-2">
                    <div class="input-group">
                        <label class="input-label">Color</label>
                        <select class="input" id="item-color">
                            ${this.colors.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="input-group">
                        <label class="input-label">Season</label>
                        <select class="input" id="item-season">
                            ${this.seasons.map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="input-group">
                    <label class="input-label">Notes (optional)</label>
                    <input type="text" class="input" id="item-notes" placeholder="e.g., Goes well with high-waisted jeans">
                </div>
                <button class="btn btn-primary btn-full" onclick="Outfits.handleAddItem()">Add Item</button>
            </div>

            <!-- Neglected Items -->
            ${neglected.length > 0 && data.wardrobe.length > 5 ? `
            <div class="card" style="margin-bottom: 20px;">
                <div class="card-header">
                    <h3 class="card-title">🧐 Haven't Worn Lately</h3>
                    <span class="badge badge-yellow">${neglected.length} items</span>
                </div>
                <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">These haven't been worn in 2+ weeks. Maybe give them some love?</p>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    ${neglected.slice(0, 5).map(item => `
                        <div style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: var(--bg-input); border-radius: var(--radius-md);">
                            <span style="font-size: 14px; flex: 1;">${item.name}</span>
                            <span class="badge badge-purple" style="font-size: 9px;">${item.category}</span>
                            <button class="btn btn-ghost btn-sm" onclick="Outfits.wearItem(${item.id})" style="font-size: 11px;">Wore it 👆</button>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Wardrobe by Category -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">👚 My Wardrobe</h3>
                    <span style="font-size: 13px; color: var(--text-muted);">${stats.total} items</span>
                </div>
                ${data.wardrobe.length === 0 ? `
                    <div class="empty-state" style="padding: 24px;">
                        <div class="empty-state-icon">👗</div>
                        <p class="empty-state-text">Your wardrobe is empty!<br>Start adding your clothes above.</p>
                    </div>
                ` : `
                    ${this.categories.filter(cat => this.getByCategory(cat).length > 0).map(cat => `
                        <div style="margin-bottom: 16px;">
                            <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">${cat} (${this.getByCategory(cat).length})</div>
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                ${this.getByCategory(cat).map(item => `
                                    <div style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--bg-input); border-radius: var(--radius-md);">
                                        <div style="width: 14px; height: 14px; border-radius: 50%; background: ${this.getColorHex(item.color)}; border: 1px solid var(--border); flex-shrink: 0;"></div>
                                        <span style="flex: 1; font-size: 13px;">${item.name}</span>
                                        <span style="font-size: 11px; color: var(--text-muted);">${item.wornCount || 0}x</span>
                                        <button class="btn btn-ghost btn-sm" onclick="Outfits.wearItem(${item.id})" style="font-size: 10px; padding: 4px 8px;">Wear</button>
                                        <button class="btn btn-ghost btn-sm" onclick="Outfits.removeItem(${item.id})" style="color: var(--danger); font-size: 10px; padding: 4px 6px;">✕</button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                `}
            </div>
        `;
    },

    getColorHex(color) {
        const map = {
            'Black': '#1a1a1a', 'White': '#f5f5f5', 'Navy': '#1e3a5f', 'Grey': '#6b7280',
            'Brown': '#8b5e3c', 'Beige': '#d4b896', 'Pink': '#ec4899', 'Red': '#ef4444',
            'Blue': '#3b82f6', 'Green': '#10b981', 'Purple': '#a855f7', 'Yellow': '#f59e0b',
            'Orange': '#f97316', 'Multi': 'linear-gradient(135deg, #ec4899, #a855f7, #06b6d4)'
        };
        return map[color] || '#6b7280';
    },

    handleAddItem() {
        const name = document.getElementById('item-name').value.trim();
        const category = document.getElementById('item-category').value;
        const color = document.getElementById('item-color').value;
        const season = document.getElementById('item-season').value;
        const notes = document.getElementById('item-notes').value.trim();

        if (!name) {
            showToast('Give your item a name!');
            return;
        }

        this.addItem(name, category, color, season, notes);
        showToast(`${name} added to your closet! 👗`);
        App.navigate('outfits');
    },

    handleSuggest() {
        const occasion = document.getElementById('outfit-occasion').value;
        const mood = document.getElementById('outfit-mood').value;
        const suggestion = this.suggestOutfit(occasion, mood);

        const container = document.getElementById('outfit-suggestion');
        container.style.display = 'block';

        if (!suggestion) {
            container.innerHTML = `<p style="font-size: 13px; color: var(--text-muted); text-align: center;">Not enough items to suggest an outfit. Add more to your wardrobe!</p>`;
            return;
        }

        let html = `
            <div style="padding: 20px; background: var(--bg-input); border-radius: var(--radius-lg); border: 1px solid rgba(168, 85, 247, 0.2);">
                <div style="text-align: center; margin-bottom: 16px;">
                    <div style="font-size: 28px; margin-bottom: 8px;">✨</div>
                    <div style="font-size: 16px; font-weight: 600; color: var(--purple-light);">${occasion} × ${mood}</div>
                    <div style="font-size: 12px; color: var(--text-muted);">Here's what I'd wear:</div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
        `;

        if (suggestion.main) {
            html += `<div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-card); border-radius: var(--radius-sm);"><span style="font-size: 16px;">👗</span><span style="font-size: 14px;">${suggestion.main.name}</span><span class="badge badge-pink" style="font-size: 9px;">${suggestion.main.color}</span></div>`;
        }
        if (suggestion.top) {
            html += `<div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-card); border-radius: var(--radius-sm);"><span style="font-size: 16px;">👚</span><span style="font-size: 14px;">${suggestion.top.name}</span><span class="badge badge-pink" style="font-size: 9px;">${suggestion.top.color}</span></div>`;
        }
        if (suggestion.bottom) {
            html += `<div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-card); border-radius: var(--radius-sm);"><span style="font-size: 16px;">👖</span><span style="font-size: 14px;">${suggestion.bottom.name}</span><span class="badge badge-pink" style="font-size: 9px;">${suggestion.bottom.color}</span></div>`;
        }
        if (suggestion.shoes) {
            html += `<div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-card); border-radius: var(--radius-sm);"><span style="font-size: 16px;">👟</span><span style="font-size: 14px;">${suggestion.shoes.name}</span><span class="badge badge-blue" style="font-size: 9px;">${suggestion.shoes.color}</span></div>`;
        }
        if (suggestion.outerwear) {
            html += `<div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-card); border-radius: var(--radius-sm);"><span style="font-size: 16px;">🧥</span><span style="font-size: 14px;">${suggestion.outerwear.name}</span><span class="badge badge-purple" style="font-size: 9px;">${suggestion.outerwear.color}</span></div>`;
        }
        if (suggestion.accessory) {
            html += `<div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-card); border-radius: var(--radius-sm);"><span style="font-size: 16px;">💍</span><span style="font-size: 14px;">${suggestion.accessory.name}</span><span class="badge badge-yellow" style="font-size: 9px;">${suggestion.accessory.color}</span></div>`;
        }

        html += `
                </div>
                <div style="text-align: center; margin-top: 16px;">
                    <button class="btn btn-ghost btn-sm" onclick="Outfits.handleSuggest()">🔄 Try another combo</button>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }
};
