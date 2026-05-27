// Luna - Self-Care Suggestions Engine
const SelfCare = {
    // Detailed recommendations based on cycle phase + energy + mood
    suggestions: {
        Menstrual: {
            low: [
                { icon: '🛁', title: 'Warm Bath', desc: 'Add epsom salts or a bath bomb. Light a candle. Just float.' },
                { icon: '🫖', title: 'Tea & Rest', desc: 'Chamomile or ginger tea. Cozy blanket. No guilt.' },
                { icon: '📱', title: 'Cancel Plans', desc: 'It\'s okay to say no. Your body needs this.' },
                { icon: '🍫', title: 'Comfort Food', desc: 'Dark chocolate, warm soup, whatever your body craves.' },
                { icon: '😴', title: 'Extra Sleep', desc: 'Go to bed an hour early. Your body is working hard.' }
            ],
            medium: [
                { icon: '🧘', title: 'Gentle Yoga', desc: 'Child\'s pose, cat-cow, gentle twists. Nothing intense.' },
                { icon: '📖', title: 'Read or Journal', desc: 'Let your mind wander. No productivity pressure.' },
                { icon: '🎵', title: 'Comfort Playlist', desc: 'Put on your favorite slow songs. Vibe.' },
                { icon: '🌿', title: 'Slow Walk', desc: 'Fresh air, no rush. Just move gently.' },
                { icon: '📺', title: 'Comfort Show', desc: 'Rewatch something you love. Familiar = soothing.' }
            ],
            high: [
                { icon: '🎨', title: 'Creative Time', desc: 'Draw, cook, arrange flowers — express yourself.' },
                { icon: '💅', title: 'Pamper Session', desc: 'Face mask, nails, hair treatment. Full self-love.' },
                { icon: '📝', title: 'Reflect & Plan', desc: 'Journal about this cycle. Set gentle intentions.' },
                { icon: '👯', title: 'Cozy Hangout', desc: 'Low-key time with someone who gets you.' },
                { icon: '🧹', title: 'Light Tidying', desc: 'A clean space feels good. Just 10 minutes.' }
            ]
        },
        Follicular: {
            low: [
                { icon: '☀️', title: 'Morning Sunlight', desc: '10 minutes of sun. It\'ll kickstart your energy.' },
                { icon: '🥗', title: 'Nourish Yourself', desc: 'Energizing meals — greens, protein, good carbs.' },
                { icon: '💧', title: 'Hydrate Extra', desc: 'Your body is building up. Give it water.' },
                { icon: '🎵', title: 'Upbeat Playlist', desc: 'Music can shift your energy. Try something new.' },
                { icon: '📱', title: 'Text a Friend', desc: 'Connection helps. You don\'t have to do today alone.' }
            ],
            medium: [
                { icon: '🏃‍♀️', title: 'Move Your Body', desc: 'A walk, dance, workout — your energy is building!' },
                { icon: '📚', title: 'Learn Something', desc: 'Your brain is sharp right now. Watch a tutorial, read.' },
                { icon: '🛒', title: 'Meal Prep', desc: 'Set future-you up for success this week.' },
                { icon: '💬', title: 'Social Time', desc: 'Your social battery is charging. Connect with people.' },
                { icon: '✨', title: 'Try Something New', desc: 'New recipe, new route, new hobby. You\'re open to it.' }
            ],
            high: [
                { icon: '🎯', title: 'Start a Project', desc: 'This is your POWER phase for starting things. Go!' },
                { icon: '💪', title: 'Intense Workout', desc: 'HIIT, running, strength — your body can handle it.' },
                { icon: '🤝', title: 'Network/Connect', desc: 'Great time for important conversations and new people.' },
                { icon: '📋', title: 'Plan the Month', desc: 'Your clarity is high. Map out what you want.' },
                { icon: '💇‍♀️', title: 'Switch It Up', desc: 'New look? Go for it. Confidence is peaking.' }
            ]
        },
        Ovulation: {
            low: [
                { icon: '🫂', title: 'Ask for Support', desc: 'Even in your power phase, it\'s okay to need help.' },
                { icon: '🥑', title: 'Fuel Up', desc: 'Your body needs energy. Eat well, don\'t skip meals.' },
                { icon: '🌸', title: 'Gentle Self-Love', desc: 'You don\'t have to be "on" all the time. Rest.' },
                { icon: '📵', title: 'Digital Detox', desc: 'Step away from screens for an hour. Breathe.' },
                { icon: '🎧', title: 'Podcast Walk', desc: 'Low effort, some stimulation. Perfect balance.' }
            ],
            medium: [
                { icon: '💃', title: 'Dance It Out', desc: 'Put on your confidence playlist and MOVE.' },
                { icon: '📸', title: 'Document the Glow', desc: 'Take some photos. You\'re literally glowing right now.' },
                { icon: '🗣️', title: 'Speak Up', desc: 'Have that conversation you\'ve been avoiding. You\'re clear.' },
                { icon: '👗', title: 'Dress Up', desc: 'Wear something that makes you feel powerful.' },
                { icon: '🎉', title: 'Make Plans', desc: 'Schedule the fun stuff. Your energy supports it.' }
            ],
            high: [
                { icon: '🚀', title: 'Big Moves', desc: 'Ask for the raise. Send the message. Book the thing.' },
                { icon: '💕', title: 'Connection Time', desc: 'Intimacy, deep talks, quality time. You\'re magnetic.' },
                { icon: '🏆', title: 'Tackle the Hard Thing', desc: 'That task you\'ve been avoiding? Now\'s the time.' },
                { icon: '🌟', title: 'Show Up Fully', desc: 'Be visible. Share your work. You deserve to be seen.' },
                { icon: '🎯', title: 'Decision Time', desc: 'Your intuition is sharp. Trust your gut today.' }
            ]
        },
        Luteal: {
            low: [
                { icon: '🫖', title: 'Slow Down', desc: 'Your body is asking for less. Listen to it.' },
                { icon: '🧸', title: 'Comfort Items', desc: 'Soft clothes, favorite blanket, weighted things.' },
                { icon: '😤', title: 'Feel Your Feelings', desc: 'PMS emotions are valid. Let them pass through.' },
                { icon: '🍳', title: 'Warm Food', desc: 'Soups, stews, warm drinks. Nourish from the inside.' },
                { icon: '🚫', title: 'Say No', desc: 'Protect your energy. It\'s not selfish, it\'s survival.' }
            ],
            medium: [
                { icon: '📝', title: 'Journal It Out', desc: 'Write what you\'re feeling. Don\'t edit, just release.' },
                { icon: '🏠', title: 'Nest', desc: 'Make your space cozy. Clean sheets, dim lights.' },
                { icon: '🎨', title: 'Creative Expression', desc: 'Paint, write, cook — channel the emotions into art.' },
                { icon: '🤗', title: 'Ask for a Hug', desc: 'Physical comfort is medicine right now.' },
                { icon: '🌙', title: 'Early Night', desc: 'Melatonin drops naturally. Honor your sleep.' }
            ],
            high: [
                { icon: '🧹', title: 'Organize', desc: 'Nesting energy is real. Channel it into tidying.' },
                { icon: '📋', title: 'Finish Projects', desc: 'Great time to complete things, not start new ones.' },
                { icon: '💆‍♀️', title: 'Body Care', desc: 'Massage, stretching, dry brushing. Love on your body.' },
                { icon: '👯‍♀️', title: 'Small Circle Only', desc: 'Quality time with your closest people. No crowds.' },
                { icon: '🎯', title: 'Wrap Up Loose Ends', desc: 'Tie up this cycle\'s projects before the reset.' }
            ]
        },
        'Not Set': {
            low: [
                { icon: '💜', title: 'Be Gentle', desc: 'You showed up. That\'s enough for today.' },
                { icon: '🫁', title: 'Breathe', desc: '4 counts in, 7 hold, 8 out. Repeat 3 times.' },
                { icon: '🌊', title: 'Let It Go', desc: 'Not everything needs to be figured out today.' },
                { icon: '🛋️', title: 'Permission to Rest', desc: 'Rest is not lazy. It\'s how you recharge.' },
                { icon: '📱', title: 'Call Someone', desc: 'You don\'t have to carry it alone.' }
            ],
            medium: [
                { icon: '🚶‍♀️', title: 'Get Moving', desc: 'Even 10 minutes outside shifts everything.' },
                { icon: '💧', title: 'Water Check', desc: 'Dehydration mimics fatigue. Drink up.' },
                { icon: '🎵', title: 'Music Therapy', desc: 'The right song can change your whole mood.' },
                { icon: '📖', title: 'Read Something', desc: 'Fiction, self-help, articles — feed your mind.' },
                { icon: '✅', title: 'One Small Win', desc: 'Do one thing. Just one. Then celebrate it.' }
            ],
            high: [
                { icon: '⚡', title: 'Use This Energy', desc: 'You feel good — channel it into something meaningful.' },
                { icon: '💪', title: 'Challenge Yourself', desc: 'Push a little further today. You can handle it.' },
                { icon: '🌟', title: 'Help Someone', desc: 'Your overflow can lift others. Pass it on.' },
                { icon: '📝', title: 'Set Intentions', desc: 'Write down what you want this week to look like.' },
                { icon: '🎉', title: 'Celebrate Yourself', desc: 'You\'re thriving. Acknowledge it. You earned this.' }
            ]
        }
    },

    // Get today's suggestions based on current state
    getTodaySuggestions() {
        const phase = Cycle.getCurrentPhase();
        const moodEntry = Mood.getTodayEntry();

        let energyLevel = 'medium';
        if (moodEntry) {
            if (moodEntry.energy <= 3) energyLevel = 'low';
            else if (moodEntry.energy >= 7) energyLevel = 'high';
        }

        const phaseSuggestions = this.suggestions[phase.name] || this.suggestions['Not Set'];
        return phaseSuggestions[energyLevel] || phaseSuggestions.medium;
    },

    render() {
        const phase = Cycle.getCurrentPhase();
        const moodEntry = Mood.getTodayEntry();
        const suggestions = this.getTodaySuggestions();

        let energyLabel = 'Medium Energy';
        let energyColor = 'var(--neon-yellow)';
        if (moodEntry) {
            if (moodEntry.energy <= 3) { energyLabel = 'Low Energy'; energyColor = 'var(--neon-pink)'; }
            else if (moodEntry.energy >= 7) { energyLabel = 'High Energy'; energyColor = 'var(--neon-green)'; }
        }

        return `
            <div class="page-header">
                <h1 class="page-title">Self-Care</h1>
                <p class="page-subtitle">Personalized just for you, right now</p>
            </div>

            <!-- Current State -->
            <div class="card" style="margin-bottom: 20px; background: linear-gradient(135deg, var(--bg-card), rgba(168, 85, 247, 0.05)); border-color: rgba(168, 85, 247, 0.3);">
                <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 20px;">${phase.icon}</span>
                        <span class="badge badge-purple">${phase.name} Phase</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 14px; color: ${energyColor};">●</span>
                        <span style="font-size: 13px; color: var(--text-secondary);">${energyLabel}</span>
                    </div>
                    ${!moodEntry ? `
                        <button class="btn btn-ghost btn-sm" onclick="App.navigate('mood')" style="margin-left: auto;">Log mood for better suggestions →</button>
                    ` : ''}
                </div>
            </div>

            <!-- Suggestions -->
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${suggestions.map(s => `
                    <div class="card" style="cursor: default;">
                        <div style="display: flex; align-items: start; gap: 16px;">
                            <span style="font-size: 28px; line-height: 1;">${s.icon}</span>
                            <div>
                                <div style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">${s.title}</div>
                                <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">${s.desc}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Phase Guide -->
            <div class="card" style="margin-top: 24px;">
                <div class="card-header">
                    <h3 class="card-title">Your Cycle Phases Guide</h3>
                </div>
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    <div style="padding: 12px; background: rgba(239, 68, 68, 0.05); border-radius: var(--radius-md); border-left: 3px solid var(--neon-red);">
                        <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">🌹 Menstrual (Days 1-${Cycle.getData().periodLength || 5})</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">Rest, reflect, release. Energy is lowest — honor it.</div>
                    </div>
                    <div style="padding: 12px; background: rgba(16, 185, 129, 0.05); border-radius: var(--radius-md); border-left: 3px solid var(--neon-green);">
                        <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">🌱 Follicular (Days ${(Cycle.getData().periodLength || 5) + 1}-${Math.round((Cycle.getData().cycleLength || 28) / 2) - 3})</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">Energy rises. Start new things, socialize, explore.</div>
                    </div>
                    <div style="padding: 12px; background: rgba(245, 158, 11, 0.05); border-radius: var(--radius-md); border-left: 3px solid var(--neon-yellow);">
                        <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">☀️ Ovulation (Days ${Math.round((Cycle.getData().cycleLength || 28) / 2) - 2}-${Math.round((Cycle.getData().cycleLength || 28) / 2) + 2})</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">Peak power. Confidence, communication, connection highest.</div>
                    </div>
                    <div style="padding: 12px; background: rgba(168, 85, 247, 0.05); border-radius: var(--radius-md); border-left: 3px solid var(--purple-primary);">
                        <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">🌙 Luteal (Days ${Math.round((Cycle.getData().cycleLength || 28) / 2) + 3}-${Cycle.getData().cycleLength || 28})</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">Wind down. Nest, finish projects, prepare for reset.</div>
                    </div>
                </div>
            </div>
        `;
    }
};
