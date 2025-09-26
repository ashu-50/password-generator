document.addEventListener('DOMContentLoaded', () => {
    const dom = {
        lengthSlider: document.getElementById('length'),
        lengthValue: document.getElementById('length-value'),
        passwordDisplay: document.getElementById('password-display'),
        generateButton: document.getElementById('generate-button'),
        copyButton: document.getElementById('copy-button'),
        copyTooltip: document.getElementById('copy-tooltip'),
        optionsCheckboxes: document.querySelectorAll('#secure-settings input[type="checkbox"]'),
        strengthText: document.getElementById('strength-text'),
        strengthBars: document.getElementById('strength-bars'),
        historyContainer: document.getElementById('history-container'),
        historyList: document.getElementById('history-list'),
        clearHistoryBtn: document.getElementById('clear-history-btn'),
        themeToggle: document.getElementById('theme-toggle'),
        themeIconDark: document.getElementById('theme-icon-dark'),
        themeIconLight: document.getElementById('theme-icon-light'),
    };

    const charSets = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    let isGenerating = false;
    let passwordHistory = [];

    const updateSliderFill = (slider) => {
        const percentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
        slider.style.setProperty('--track-fill-percent', `${percentage}%`);
    };

    const generateSecurePassword = () => {
        const length = parseInt(dom.lengthSlider.value);
        let charPool = '';
        let password = '';
        const selectedOptions = Array.from(dom.optionsCheckboxes).filter(cb => cb.checked);

        if (selectedOptions.length === 0) {
            return 'Select an option';
        }
        
        selectedOptions.forEach(opt => {
            const type = opt.id.replace('include-', '');
            charPool += charSets[type];
            password += charSets[type][Math.floor(Math.random() * charSets[type].length)];
        });

        for (let i = password.length; i < length; i++) {
            password += charPool[Math.floor(Math.random() * charPool.length)];
        }
        
        return password.split('').sort(() => 0.5 - Math.random()).join('');
    };
    
    const runGeneration = () => {
        if (isGenerating) return;
        isGenerating = true;

        const length = parseInt(dom.lengthSlider.value);
        const allChars = Object.values(charSets).join('');

        let scrambleInterval = setInterval(() => {
            let randomChars = '';
            for (let i = 0; i < length; i++) {
                randomChars += allChars[Math.floor(Math.random() * allChars.length)];
            }
            dom.passwordDisplay.textContent = randomChars;
        }, 50);

        setTimeout(() => {
            clearInterval(scrambleInterval);
            const finalPassword = generateSecurePassword();
            dom.passwordDisplay.textContent = finalPassword;
            updateStrength();
            addToHistory(finalPassword);
            isGenerating = false;
        }, 300);
    };

    const updateStrength = () => {
        let score = 0;
        const length = parseInt(dom.lengthSlider.value);
        const activeOptions = Array.from(dom.optionsCheckboxes).filter(opt => opt.checked).length;
        
        if (length >= 10) score++;
        if (length >= 16) score++;
        if (activeOptions >= 3) score++;
        if (activeOptions === 4 && length >= 12) score++;
        
        const levels = {
            0: { text: 'WEAK', color: 'bg-red-500', bars: 1 },
            1: { text: 'WEAK', color: 'bg-orange-500', bars: 2 },
            2: { text: 'MEDIUM', color: 'bg-yellow-500', bars: 3 },
            3: { text: 'STRONG', color: 'bg-emerald-500', bars: 4 },
            4: { text: 'STRONG', color: 'bg-emerald-500', bars: 4 }
        };
        
        const level = levels[Math.min(score, 4)] || levels[0];
        dom.strengthText.textContent = level.text;
        dom.strengthBars.innerHTML = ''; 

        for (let i = 0; i < 4; i++) {
            const bar = document.createElement('div');
            bar.className = `h-6 w-2 border`;
            bar.style.borderColor = 'var(--strength-bar-border)';
            if(i < level.bars) {
                bar.classList.add(level.color, 'active');
            } else {
                bar.classList.add('bg-transparent');
            }
            dom.strengthBars.appendChild(bar);
        }
    };

    const copyToClipboard = (text, button) => {
        if (!text || text === 'Select an option') return;

        // Create a temporary textarea element to hold the text
        const textArea = document.createElement('textarea');
        textArea.value = text;

        // Make the textarea invisible
        textArea.style.position = 'fixed';
        textArea.style.top = '-9999px';
        textArea.style.left = '-9999px';

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            // Execute the 'copy' command
            const successful = document.execCommand('copy');
            if (successful) {
                // Show visual feedback if the copy was successful
                if (button && button.id === 'copy-button') {
                    dom.copyTooltip.classList.add('visible');
                    setTimeout(() => dom.copyTooltip.classList.remove('visible'), 2000);
                } else if (button) {
                    const originalIcon = button.innerHTML;
                    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-400"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                    setTimeout(() => { button.innerHTML = originalIcon; }, 2000);
                }
            }
        } catch (err) {
            console.error('Unable to copy to clipboard', err);
        }

        // Remove the temporary textarea
        document.body.removeChild(textArea);
    };

    const addToHistory = (password) => {
        if (!password || password === 'Select an option' || passwordHistory.includes(password)) return;
        passwordHistory.unshift(password);
        if (passwordHistory.length > 5) passwordHistory.pop();
        renderHistory();
    };

    const renderHistory = () => {
        if (passwordHistory.length === 0) {
            dom.historyContainer.classList.add('hidden');
            return;
        }
        dom.historyContainer.classList.remove('hidden');
        dom.historyList.innerHTML = '';
        passwordHistory.forEach(pass => {
            const li = document.createElement('li');
            li.className = 'history-item flex items-center justify-between p-2 rounded-md text-sm';
            li.innerHTML = `
                <span class="font-mono break-all pr-2">${pass}</span>
                <button class="copy-history-btn p-1 rounded hover:bg-slate-700 transition-colors flex-shrink-0" title="Copy">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
            `;
            dom.historyList.appendChild(li);
        });
    };
    
    const clearHistory = () => {
        passwordHistory = [];
        renderHistory();
    };

    // --- Theme Toggle Logic ---
    const applyTheme = (theme) => {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            dom.themeIconDark.classList.add('hidden');
            dom.themeIconLight.classList.remove('hidden');
        } else {
            document.body.classList.remove('light-theme');
            dom.themeIconDark.classList.remove('hidden');
            dom.themeIconLight.classList.add('hidden');
        }
    };

    dom.themeToggle.addEventListener('click', () => {
        const isLight = document.body.classList.contains('light-theme');
        const newTheme = isLight ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    // --- Event Listeners ---
    dom.lengthSlider.addEventListener('input', (e) => {
        dom.lengthValue.textContent = e.target.value;
        updateSliderFill(dom.lengthSlider);
        runGeneration();
    });

    dom.optionsCheckboxes.forEach(box => box.addEventListener('change', runGeneration));
    dom.generateButton.addEventListener('click', runGeneration);
    dom.copyButton.addEventListener('click', (e) => copyToClipboard(dom.passwordDisplay.textContent, e.currentTarget));
    dom.historyList.addEventListener('click', (e) => {
        const button = e.target.closest('.copy-history-btn');
        if (button) {
            const passwordToCopy = button.previousElementSibling.textContent;
            copyToClipboard(passwordToCopy, button);
        }
    });
    dom.clearHistoryBtn.addEventListener('click', clearHistory);

    // --- Initial Load ---
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
    updateSliderFill(dom.lengthSlider);
    runGeneration();
});


