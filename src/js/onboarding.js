// Luna - Onboarding Flow for First-Time Users
const Onboarding = {
    steps: [
        {
            id: 'welcome',
            icon: '🌙',
            title: 'Welcome to Luna',
            subtitle: 'Your life, illuminated.',
            description: 'Luna is your all-in-one dashboard — tracking your cycle, mood, skincare, hydration, finances, and more. All in one beautiful, private space.',
            highlight: 'Everything stays on YOUR device. No accounts, no data selling. Just you.'
        },
        {
            id: 'name',
            icon: '💜',
            title: 'What should we call you?',
            subtitle: 'Make it personal.',
            input: true,
            inputType: 'text',
            inputId: 'onboarding-name',
            inputPlaceholder: 'Your name or nickname...',
            inputKey: 'userName'
        },
        {
            id: 'cycle',
            icon: '☽',
            title: 'Cycle Tracking',
            subtitle: 'Understanding your rhythm changes everything.',
            description: 'Luna tracks your cycle phases and connects them to your mood, energy, and self-care needs. You\'ll understand WHY you feel certain ways on certain days.',
            question: 'Do you want to set up cycle tracking?',
            options: [
                { label: 'Yes, let\'s do it', value: 'yes', action: 'showCycleSetup' },
                { label: 'Maybe later', value: 'skip', action: 'next' }
            ]
        },
        {
            id: 'cycleSetup',
            icon: '🌹',
            title: 'Quick Setup',
            subtitle: 'Just two things and we\'re good.',
            inputs: [
                { label: 'Average cycle length (days)', type: 'number', id: 'onboard-cycle-length', placeholder: '28', min: 21, max: 40, default: 28 },
                { label: 'When did your last period start?', type: 'date', id: 'onboard-last-period', placeholder: '' }
            ],
            conditional: true
        },
        {
            id: 'features',
            icon: '✨',
            title: 'What matters to you?',
            subtitle: 'We\'ll highlight these on your dashboard.',
            multiSelect: true,
            options: [
                { label: '🩸 Period & Cycle Tracking', value: 'cycle' },
                { label: '🧘 Mood & Energy', value: 'mood' },
                { label: '💧 Water & Meds', value: 'water' },
                { label: '🧴 Skincare Routine', value: 'skincare' },
                { label: '💰 Budget Tracking', value: 'budget' },
                { label: '💜 Affirmations & Wins', value: 'affirmations' },
                { label: '💬 AI Bestie', value: 'aichat' }
            ]
        },
        {
            id: 'ready',
            icon: '🚀',
            title: 'You\'re all set!',
            subtitle: 'Luna is ready for you.',
            description: 'Your dashboard is personalized and waiting. Everything is private, everything is yours. Take your time exploring.',
            highlight: 'Remember: you don\'t have to use everything at once. Start with what feels right today.',
            final: true
        }
    ],

    currentStep: 0,
    skippedCycle: false,
    selectedFeatures: [],

    isFirstTime() {
        return !Storage.get('onboarding_complete');
    },

    start() {
        this.currentStep = 0;
        this.renderStep();
    },

    renderStep() {
        const step = this.steps[this.currentStep];
        
        // Skip conditional steps if not needed
        if (step.conditional && this.skippedCycle) {
            this.currentStep++;
            this.renderStep();
            return;
        }

        const content = document.getElementById('main-content');
        const totalSteps = this.steps.filter(s => !s.conditional || !this.skippedCycle).length;
        const visibleStep = this.getVisibleStepIndex();

        content.innerHTML = `
            <div class="onboarding-container fade-in">
                <!-- Progress Dots -->
                <div class="onboarding-progress">
                    ${Array(totalSteps).fill(0).map((_, i) => `
                        <div class="onboarding-dot ${i <= visibleStep ? 'active' : ''} ${i === visibleStep ? 'current' : ''}"></div>
                    `).join('')}
                </div>

                <!-- Content -->
                <div class="onboarding-content">
                    <div class="onboarding-icon">${step.icon}</div>
                    <h1 class="onboarding-title">${step.title}</h1>
                    <p class="onboarding-subtitle">${step.subtitle}</p>
                    
                    ${step.description ? `<p class="onboarding-description">${step.description}</p>` : ''}
                    ${step.highlight ? `<div class="onboarding-highlight">${step.highlight}</div>` : ''}

                    ${step.input ? `
                        <div class="onboarding-input-section">
                            <input type="${step.inputType}" class="input onboarding-input" id="${step.inputId}" placeholder="${step.inputPlaceholder}" autofocus>
                        </div>
                    ` : ''}

                    ${step.inputs ? `
                        <div class="onboarding-input-section">
                            ${step.inputs.map(inp => `
                                <div class="input-group">
                                    <label class="input-label">${inp.label}</label>
                                    <input type="${inp.type}" class="input" id="${inp.id}" placeholder="${inp.placeholder}" ${inp.min ? `min="${inp.min}"` : ''} ${inp.max ? `max="${inp.max}"` : ''} ${inp.default ? `value="${inp.default}"` : ''}>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${step.options && !step.multiSelect ? `
                        <div class="onboarding-options">
                            ${step.options.map(opt => `
                                <button class="btn ${opt.value === 'yes' ? 'btn-primary' : 'btn-secondary'} btn-full" 
                                        onclick="Onboarding.handleOption('${opt.value}', '${opt.action}')"
                                        style="margin-bottom: 8px;">
                                    ${opt.label}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${step.multiSelect ? `
                        <div class="onboarding-multi-select">
                            ${step.options.map(opt => `
                                <div class="onboarding-select-item ${this.selectedFeatures.includes(opt.value) ? 'selected' : ''}" 
                                     onclick="Onboarding.toggleFeature('${opt.value}', this)">
                                    <span>${opt.label}</span>
                                    <div class="checkbox ${this.selectedFeatures.includes(opt.value) ? 'checked' : ''}"></div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>

                <!-- Navigation -->
                <div class="onboarding-nav">
                    ${this.currentStep > 0 && !step.options ? `
                        <button class="btn btn-ghost" onclick="Onboarding.prev()">← Back</button>
                    ` : '<div></div>'}
                    ${!step.options ? `
                        <button class="btn btn-primary" onclick="Onboarding.next()">
                            ${step.final ? 'Let\'s Go! ✨' : 'Continue →'}
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    },

    getVisibleStepIndex() {
        let visible = 0;
        for (let i = 0; i < this.currentStep; i++) {
            if (!this.steps[i].conditional || !this.skippedCycle) {
                visible++;
            }
        }
        return visible;
    },

    next() {
        const step = this.steps[this.currentStep];

        // Save input data if applicable
        if (step.input) {
            const input = document.getElementById(step.inputId);
            if (input && input.value.trim()) {
                Storage.set(step.inputKey, input.value.trim());
            }
        }

        // Save cycle setup data
        if (step.id === 'cycleSetup') {
            const cycleLength = document.getElementById('onboard-cycle-length')?.value;
            const lastPeriod = document.getElementById('onboard-last-period')?.value;
            if (cycleLength && lastPeriod) {
                const data = Cycle.getData();
                data.cycleLength = parseInt(cycleLength);
                data.lastPeriodStart = lastPeriod;
                data.history.push({ startDate: lastPeriod, endDate: null });
                Cycle.saveData(data);
            }
        }

        // Save selected features
        if (step.multiSelect) {
            Storage.set('preferred_features', this.selectedFeatures);
        }

        // Complete onboarding if final step
        if (step.final) {
            this.complete();
            return;
        }

        this.currentStep++;
        this.renderStep();
    },

    prev() {
        if (this.currentStep > 0) {
            this.currentStep--;
            // Skip conditional steps going backwards
            if (this.steps[this.currentStep].conditional && this.skippedCycle) {
                this.currentStep--;
            }
            this.renderStep();
        }
    },

    handleOption(value, action) {
        if (action === 'showCycleSetup') {
            this.skippedCycle = false;
            this.currentStep++;
            this.renderStep();
        } else if (action === 'next') {
            this.skippedCycle = true;
            this.currentStep += 2; // Skip cycle setup
            this.renderStep();
        }
    },

    toggleFeature(value, element) {
        const idx = this.selectedFeatures.indexOf(value);
        if (idx >= 0) {
            this.selectedFeatures.splice(idx, 1);
            element.classList.remove('selected');
            element.querySelector('.checkbox').classList.remove('checked');
        } else {
            this.selectedFeatures.push(value);
            element.classList.add('selected');
            element.querySelector('.checkbox').classList.add('checked');
        }
    },

    complete() {
        Storage.set('onboarding_complete', true);
        Storage.set('onboarding_date', Storage.today());
        
        // Show the main app
        document.getElementById('sidebar').style.display = '';
        document.getElementById('mobile-nav').style.display = '';
        App.navigate('dashboard');
        showToast('Welcome to Luna! 🌙');
    }
};
