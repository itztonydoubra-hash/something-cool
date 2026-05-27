// Luna - AI Chat Module (Hype Friend & Relationship Mirror)
const AIChat = {
    modes: {
        hype: {
            name: 'Hype Friend',
            icon: '💜',
            description: 'Your biggest cheerleader. Vent, celebrate, or just talk.',
            systemPrompt: `You are Luna, a warm, supportive AI best friend. You're like the friend who always hypes you up, remembers the details, and tells you the truth with love. 

Rules:
- Be warm, genuine, and encouraging — never fake or toxic positive
- Use casual, friendly language (like texting a best friend)
- Celebrate wins enthusiastically
- When she's struggling, validate first, then gently offer perspective
- Remember context from the conversation
- Keep responses concise (2-4 sentences usually, unless she needs more)
- Use emojis naturally but don't overdo it
- Never be preachy or condescending
- If she's venting, don't immediately try to fix — just listen first`
        },
        mirror: {
            name: 'Relationship Mirror',
            icon: '🪞',
            description: 'Honest perspectives on situations. Not therapy — just clarity.',
            systemPrompt: `You are Luna's Relationship Mirror — a wise, honest advisor who gives three perspectives on any situation described.

When she describes a situation, argument, or feeling, respond with:
1. **What you might be missing** — a gentle blind spot she might not see
2. **What you handled well** — acknowledge her strengths in the situation
3. **What to consider next** — practical suggestion for what to say or do

Rules:
- Be honest but kind — truth with love, never harsh
- Don't take sides blindly — help her see the full picture
- Validate her feelings before offering perspective
- Keep it practical and actionable
- Never diagnose or play therapist
- Use "I notice..." and "Have you considered..." language
- Keep responses focused and clear (not overly long)`
        },
        advice: {
            name: 'Life Coach',
            icon: '✨',
            description: 'Help thinking through decisions, goals, and next steps.',
            systemPrompt: `You are Luna's Life Coach — thoughtful, strategic, and encouraging. You help her think through decisions, set goals, and figure out next steps.

Rules:
- Ask clarifying questions before giving advice
- Help her think, don't just tell her what to do
- Break big problems into smaller, manageable steps
- Be practical and actionable
- Celebrate her ambition and validate her goals
- If something seems off, gently challenge it
- Keep responses focused — quality over quantity
- Use her energy and context to adapt your tone`
        }
    },

    currentMode: 'hype',
    messages: [],

    getData() {
        return Storage.get('aichat') || { conversations: {} };
    },

    saveData(data) {
        Storage.set('aichat', data);
    },

    getApiKey() {
        return Storage.get('api_key') || null;
    },

    getProvider() {
        return Storage.get('api_provider') || 'openai';
    },

    async sendMessage(text) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            this.addBotMessage("I'd love to chat, but I need an API key first! Go to Settings → AI Configuration to add one. Then come back and we can talk about anything 💜");
            return;
        }

        const mode = this.modes[this.currentMode];
        const provider = this.getProvider();

        // Add user message to display
        this.addUserMessage(text);

        // Build messages array
        const apiMessages = [
            { role: 'system', content: mode.systemPrompt },
            ...this.messages.slice(-10).map(m => ({
                role: m.type === 'user' ? 'user' : 'assistant',
                content: m.text
            }))
        ];

        try {
            let response;
            if (provider === 'openai') {
                response = await this.callOpenAI(apiKey, apiMessages);
            } else {
                response = await this.callAnthropic(apiKey, apiMessages);
            }
            this.addBotMessage(response);
        } catch (error) {
            this.addBotMessage(`Hmm, something went wrong connecting to the AI. Check your API key in Settings. Error: ${error.message}`);
        }
    },

    async callOpenAI(apiKey, messages) {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: messages,
                max_tokens: 500,
                temperature: 0.8
            })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        return data.choices[0].message.content;
    },

    async callAnthropic(apiKey, messages) {
        const systemMsg = messages[0].content;
        const chatMessages = messages.slice(1);
        
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 500,
                system: systemMsg,
                messages: chatMessages
            })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        return data.content[0].text;
    },

    addUserMessage(text) {
        this.messages.push({ type: 'user', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
        this.renderMessages();
    },

    addBotMessage(text) {
        this.messages.push({ type: 'bot', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
        this.renderMessages();
        // Save conversation
        const data = this.getData();
        if (!data.conversations[Storage.today()]) {
            data.conversations[Storage.today()] = [];
        }
        data.conversations[Storage.today()] = this.messages;
        this.saveData(data);
    },

    renderMessages() {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        container.innerHTML = this.messages.map(m => `
            <div style="display: flex; justify-content: ${m.type === 'user' ? 'flex-end' : 'flex-start'}; margin-bottom: 12px;">
                <div style="max-width: 80%; padding: 12px 16px; border-radius: ${m.type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px'}; background: ${m.type === 'user' ? 'linear-gradient(135deg, var(--purple-secondary), var(--purple-primary))' : 'var(--bg-input)'}; border: 1px solid ${m.type === 'user' ? 'transparent' : 'var(--border)'};">
                    <div style="font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${m.text}</div>
                    <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px; text-align: ${m.type === 'user' ? 'right' : 'left'};">${m.time}</div>
                </div>
            </div>
        `).join('');

        container.scrollTop = container.scrollHeight;
    },

    switchMode(mode) {
        this.currentMode = mode;
        this.messages = [];
        App.navigate('aichat');
    },

    render() {
        const mode = this.modes[this.currentMode];
        const hasKey = !!this.getApiKey();

        // Load today's conversation if exists
        const data = this.getData();
        if (data.conversations[Storage.today()] && this.messages.length === 0) {
            this.messages = data.conversations[Storage.today()];
        }

        return `
            <div class="page-header">
                <h1 class="page-title">AI Bestie</h1>
                <p class="page-subtitle">${mode.icon} ${mode.name} — ${mode.description}</p>
            </div>

            <!-- Mode Switcher -->
            <div style="display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;">
                ${Object.entries(this.modes).map(([key, m]) => `
                    <button class="btn ${this.currentMode === key ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="AIChat.switchMode('${key}')">
                        ${m.icon} ${m.name}
                    </button>
                `).join('')}
            </div>

            ${!hasKey ? `
                <!-- No API Key Notice -->
                <div class="card" style="text-align: center; padding: 40px; border-color: rgba(168, 85, 247, 0.3);">
                    <div style="font-size: 48px; margin-bottom: 16px;">🔮</div>
                    <h3 style="font-size: 18px; margin-bottom: 8px;">Unlock Your AI Bestie</h3>
                    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px; line-height: 1.6;">
                        Add an API key to start chatting with your personal hype friend, relationship mirror, and life coach. All conversations stay private on your device.
                    </p>
                    <button class="btn btn-primary" onclick="App.navigate('settings')">Set Up in Settings →</button>
                    <p style="font-size: 11px; color: var(--text-muted); margin-top: 16px;">Works with OpenAI (GPT-4) or Anthropic (Claude)</p>
                </div>
            ` : `
                <!-- Chat Interface -->
                <div class="card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; height: calc(100vh - 280px); min-height: 400px;">
                    <!-- Messages -->
                    <div id="chat-messages" style="flex: 1; overflow-y: auto; padding: 20px;">
                        ${this.messages.length === 0 ? `
                            <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                                <div style="font-size: 32px; margin-bottom: 12px;">${mode.icon}</div>
                                <p style="font-size: 14px;">${mode.name} is here for you.</p>
                                <p style="font-size: 12px; margin-top: 4px;">Say anything — vent, celebrate, ask for advice.</p>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Input -->
                    <div style="padding: 16px; border-top: 1px solid var(--border); background: var(--bg-secondary);">
                        <div style="display: flex; gap: 8px;">
                            <input type="text" class="input" id="chat-input" placeholder="Type something..." style="margin-bottom: 0; flex: 1;" onkeypress="if(event.key==='Enter' && !event.shiftKey) { event.preventDefault(); AIChat.handleSend(); }">
                            <button class="btn btn-primary" onclick="AIChat.handleSend()">→</button>
                        </div>
                    </div>
                </div>
            `}

            <!-- Conversation starters -->
            ${hasKey && this.messages.length === 0 ? `
                <div class="card" style="margin-top: 16px;">
                    <div class="card-header">
                        <h3 class="card-title">Try saying...</h3>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${this.getStarters().map(s => `
                            <button class="btn btn-secondary btn-sm" style="text-align: left; justify-content: flex-start;" onclick="document.getElementById('chat-input').value='${s}'; AIChat.handleSend();">
                                "${s}"
                            </button>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    },

    getStarters() {
        const starters = {
            hype: [
                "I had the worst day today...",
                "Something good happened and I need to tell someone!",
                "I'm feeling really insecure about...",
                "I need a pep talk before this thing tomorrow"
            ],
            mirror: [
                "My partner said something that bothered me...",
                "I had a fight with my friend about...",
                "I'm not sure if I'm overreacting to...",
                "Someone at work made me feel..."
            ],
            advice: [
                "I'm trying to decide between...",
                "I want to change my career but I'm scared",
                "How do I set better boundaries with...",
                "I have a goal but I don't know where to start"
            ]
        };
        return starters[this.currentMode] || starters.hype;
    },

    handleSend() {
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        this.sendMessage(text);
    }
};
