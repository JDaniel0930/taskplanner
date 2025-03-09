class GamifiedHabitTracker {
    constructor() {
        this.habits = JSON.parse(localStorage.getItem('habits')) || [];
        this.coins = parseInt(localStorage.getItem('coins')) || 100;
        this.currentDate = new Date();
        this.symbols = ['🍒', '🍋', '💎', '7️⃣', '🍀'];
        this.initializeElements();
        this.addEventListeners();
        this.renderHabits();
        this.updateDateHeader();
        this.updateStats();
        this.updateCoins();
        this.addLoadingEffects();
        this.initializeConfetti();
    }

    initializeElements() {
        this.habitInput = document.getElementById('habitInput');
        this.addHabitBtn = document.getElementById('addHabitBtn');
        this.habitsList = document.getElementById('habitslist');
        this.prevWeekBtn = document.getElementById('prevWeek');
        this.nextWeekBtn = document.getElementById('nextWeek');
        this.currentWeekSpan = document.getElementById('currentWeek');
        this.statsContainer = document.getElementById('stats');
    }

    addEventListeners() {
        this.addHabitBtn.addEventListener('click', () => this.addHabit());
        this.habitInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addHabit();
        });
        this.prevWeekBtn.addEventListener('click', () => this.changeWeek(-1));
        this.nextWeekBtn.addEventListener('click', () => this.changeWeek(1));
    }

    addHabit() {
        const habitName = this.habitInput.value.trim();
        if (habitName) {
            if (this.coins >= 10) {
                this.coins -= 10;
                const habit = {
                    id: Date.now(),
                    name: habitName,
                    dates: {}
                };
                this.habits.push(habit);
                this.saveHabits();
                this.renderHabits();
                this.updateStats();
                this.updateCoins();
                this.habitInput.value = '';
                this.showMessage('New habit added! (-10 coins)');
            } else {
                this.showMessage('Not enough coins! Complete habits to earn more.');
            }
        }
    }

    toggleHabit(habitId, date) {
        const habit = this.habits.find(h => h.id === habitId);
        if (habit) {
            const element = document.querySelector(`[onclick="habitTracker.toggleHabit(${habitId}, '${date}')"]`);
            
            if (habit.dates[date]) {
                delete habit.dates[date];
                if (element) {
                    element.classList.remove('checked');
                    this.playUndoSound();
                    this.coins -= 5;
                }
            } else {
                habit.dates[date] = true;
                if (element) {
                    element.classList.add('checked');
                    this.playSuccessSound();
                    this.createConfetti(element);
                    this.coins += 5;
                    this.showMessage('Habit completed! (+5 coins)');
                }
            }
            
            this.saveHabits();
            this.updateStats();
            this.updateCoins();
        }
    }

    deleteHabit(habitId) {
        this.habits = this.habits.filter(h => h.id !== habitId);
        this.saveHabits();
        this.renderHabits();
        this.updateStats();
    }

    saveHabits() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }

    getWeekDates() {
        const dates = [];
        const curr = new Date(this.currentDate);
        const first = curr.getDate() - curr.getDay();

        for (let i = 0; i < 7; i++) {
            const date = new Date(curr.setDate(first + i));
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    }

    changeWeek(direction) {
        this.currentDate.setDate(this.currentDate.getDate() + direction * 7);
        this.updateDateHeader();
        this.renderHabits();
    }

    updateDateHeader() {
        const dates = this.getWeekDates();
        const firstDate = new Date(dates[0]);
        const lastDate = new Date(dates[6]);
        this.currentWeekSpan.textContent = 
            `${firstDate.toLocaleDateString()} - ${lastDate.toLocaleDateString()}`;

        const daysHeader = document.querySelector('.days');
        daysHeader.innerHTML = dates.map(date => 
            `<div>${new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</div>`
        ).join('');
    }

    renderHabits() {
        const dates = this.getWeekDates();
        this.habitsList.innerHTML = this.habits.map(habit => `
            <div class="habit-row">
                <div class="habit-name">
                    ${habit.name}
                    <span class="delete-habit" onclick="habitTracker.deleteHabit(${habit.id})">×</span>
                </div>
                ${dates.map(date => `
                    <div class="habit-check ${habit.dates[date] ? 'checked' : ''}"
                         onclick="habitTracker.toggleHabit(${habit.id}, '${date}')">
                    </div>
                `).join('')}
            </div>
        `).join('');
    }

    updateStats() {
        const totalHabits = this.habits.length;
        const completedToday = this.habits.filter(habit => 
            habit.dates[new Date().toISOString().split('T')[0]]
        ).length;
        
        const allCompletions = this.habits.reduce((sum, habit) => 
            sum + Object.keys(habit.dates).length, 0);
        
        const streaks = this.habits.map(habit => this.calculateStreak(habit));
        const longestStreak = Math.max(...streaks, 0);

        this.statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${totalHabits}</div>
                    <div class="stat-label">Total Habits</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${completedToday}</div>
                    <div class="stat-label">Completed Today</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${allCompletions}</div>
                    <div class="stat-label">Total Completions</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${longestStreak}</div>
                    <div class="stat-label">Longest Streak</div>
                </div>
            </div>
        `;
    }

    calculateStreak(habit) {
        const dates = Object.keys(habit.dates).sort();
        if (dates.length === 0) return 0;

        let currentStreak = 1;
        let maxStreak = 1;

        for (let i = 1; i < dates.length; i++) {
            const diff = Math.abs(
                (new Date(dates[i]) - new Date(dates[i-1])) / (1000 * 60 * 60 * 24)
            );

            if (diff === 1) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }

        return maxStreak;
    }

    addLoadingEffects() {
        // Implementation of addLoadingEffects method
    }

    initializeConfetti() {
        this.confetti = {
            maxCount: 50,
            speed: 3,
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
        };
    }

    createConfetti(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < this.confetti.maxCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti';
            particle.style.backgroundColor = this.confetti.colors[Math.floor(Math.random() * this.confetti.colors.length)];
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            
            const angle = Math.random() * Math.PI * 2;
            const velocity = (Math.random() + 0.5) * this.confetti.speed;
            const x = Math.cos(angle) * velocity;
            const y = Math.sin(angle) * velocity;
            
            document.body.appendChild(particle);
            
            const animation = particle.animate([
                { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
                { transform: `translate(${x * 50}px, ${y * 50}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: 1000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });
            
            animation.onfinish = () => particle.remove();
        }
    }

    playSuccessSound() {
        const audio = new Audio();
        audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//tQwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAADAAAGhgBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVWqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr///////////////////////////////////////////8AAAAATGF2YzU4LjM1AAAAAAAAAAAAAAAAJAYAAAAAAAAABoZyWYqhAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EMQQg8AAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
        audio.play();
    }

    playUndoSound() {
        const audio = new Audio();
        audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//tQwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAADAAAGhgBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVWqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr///////////////////////////////////////////8AAAAATGF2YzU4LjM1AAAAAAAAAAAAAAAAJAQAAAAAAAAABoYyS4eBAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EMQQg8AAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
        audio.play();
    }

    updateCoins() {
        document.getElementById('balance').textContent = this.coins;
        localStorage.setItem('coins', this.coins);
    }

    async spin() {
        const bet = parseInt(document.getElementById('betAmount').value);
        
        if (isNaN(bet) || bet <= 0) {
            this.showMessage('Please enter a valid bet amount!');
            return;
        }

        if (bet > this.coins) {
            this.showMessage('Not enough coins for that bet!');
            return;
        }

        this.coins -= bet;
        this.updateCoins();
        document.getElementById('spinButton').disabled = true;
        
        const results = [];
        for (let i = 1; i <= 3; i++) {
            const slot = document.getElementById(`slot${i}`);
            slot.classList.add('spinning');
            await new Promise(resolve => setTimeout(resolve, 500));
            const symbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
            results.push(symbol);
            slot.textContent = symbol;
            slot.classList.remove('spinning');
        }

        if (results.every(symbol => symbol === results[0])) {
            const winnings = bet * 5;
            this.coins += winnings;
            this.showMessage(`Jackpot! You won ${winnings} coins! 🎉`);
            this.createConfetti(document.querySelector('.slots'));
        } else if (results.filter(symbol => symbol === results[0]).length === 2 ||
                   results.filter(symbol => symbol === results[1]).length === 2) {
            const winnings = bet * 2;
            this.coins += winnings;
            this.showMessage(`Two of a kind! You won ${winnings} coins!`);
        } else {
            this.showMessage('No luck this time!');
        }

        this.updateCoins();
        document.getElementById('spinButton').disabled = false;
    }

    showMessage(message) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = message;
        messageElement.style.animation = 'none';
        messageElement.offsetHeight; // Trigger reflow
        messageElement.style.animation = 'fadeIn 0.5s ease-out';
    }
}

let habitTracker;
window.addEventListener('load', () => {
    habitTracker = new GamifiedHabitTracker();
});

class SlotMachine {
    constructor() {
        // Weighted symbols to make winning harder
        this.symbols = [
            '💎', // Diamond is very rare
            '7️⃣', // Seven is rare
            '🍀', '🍀', // Clover normal
            '🍒', '🍒', '🍒', // More cherries
            '🍋', '🍋', '🍋', '🍋' // Lots of lemons (low value)
        ];
        this.playerMoney = 1000;
        this.konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        this.konamiIndex = 0;
        this.isSpinning = false;
        this.initializeElements();
        this.addEventListeners();
    }

    initializeElements() {
        this.balanceElement = document.getElementById('balance');
        this.betInput = document.getElementById('betAmount');
        this.spinButton = document.getElementById('spinButton');
        this.cheatButton = document.getElementById('cheatButton');
        this.messageElement = document.getElementById('message');
        this.slots = [
            document.getElementById('slot1'),
            document.getElementById('slot2'),
            document.getElementById('slot3')
        ];
        this.updateBalance();
    }

    addEventListeners() {
        // Add spin button event listener
        this.spinButton.addEventListener('click', () => {
            if (!this.isSpinning) {
                this.spin(false);
            }
        });

        // Add cheat button event listener
        this.cheatButton.addEventListener('click', () => {
            if (!this.isSpinning) {
                this.spin(true);
            }
        });

        // Konami code listener
        document.addEventListener('keydown', (e) => {
            if (e.key === this.konamiCode[this.konamiIndex]) {
                this.konamiIndex++;
                if (this.konamiIndex === this.konamiCode.length) {
                    this.activateCheatMode();
                    this.konamiIndex = 0;
                }
            } else {
                this.konamiIndex = 0;
            }
        });
    }

    activateCheatMode() {
        this.cheatButton.style.display = 'block';
        this.showMessage('🎮 Cheat Mode Activated! 🎮');
    }

    updateBalance() {
        this.balanceElement.textContent = this.playerMoney;
    }

    showMessage(message) {
        this.messageElement.textContent = message;
    }

    async spinSlot(slot, finalSymbol) {
        const spinDuration = 2000; // 2 seconds
        const frameInterval = 100; // Change symbol every 100ms
        const frames = spinDuration / frameInterval;
        
        slot.classList.add('spinning');
        
        // Rapid symbol changes
        for (let i = 0; i < frames; i++) {
            const randomSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
            slot.textContent = randomSymbol;
            await new Promise(resolve => setTimeout(resolve, frameInterval));
        }
        
        slot.classList.remove('spinning');
        slot.textContent = finalSymbol;
    }

    async spin(isCheat) {
        const bet = parseInt(this.betInput.value);
        
        if (isNaN(bet) || bet <= 0) {
            this.showMessage('Please enter a valid bet amount!');
            return;
        }

        if (bet > this.playerMoney) {
            this.showMessage('Not enough money for that bet!');
            return;
        }

        this.isSpinning = true;
        this.spinButton.disabled = true;
        this.cheatButton.disabled = true;
        this.betInput.disabled = true;

        this.playerMoney -= bet;
        this.updateBalance();

        // Reduced win chance
        const shouldWin = Math.random() < 0.25; // 25% chance to win (down from 40%)
        let results = [];

        if (isCheat) {
            results = ['💎', '💎', '💎']; // Cheat mode still works
        } else if (shouldWin) {
            if (Math.random() < 0.15) { // 15% chance for three of a kind when winning (down from 30%)
                const symbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                results = [symbol, symbol, symbol];
            } else { // 85% chance for two of a kind when winning
                const symbol1 = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                const symbol2 = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                results = [symbol1, symbol1, symbol2];
            }
        } else {
            // Random results
            for (let i = 0; i < 3; i++) {
                results.push(this.symbols[Math.floor(Math.random() * this.symbols.length)]);
            }
        }

        try {
            await Promise.all([
                this.spinSlot(this.slots[0], results[0]),
                new Promise(r => setTimeout(r, 400)).then(() => this.spinSlot(this.slots[1], results[1])),
                new Promise(r => setTimeout(r, 800)).then(() => this.spinSlot(this.slots[2], results[2]))
            ]);

            // Check for wins with adjusted payouts
            if (results.every(symbol => symbol === results[0])) {
                const multiplier = results[0] === '💎' ? 15 : // Higher diamond jackpot
                                 results[0] === '7️⃣' ? 10 : // Higher seven jackpot
                                 results[0] === '🍀' ? 6 :  // Medium clover jackpot
                                 results[0] === '🍒' ? 4 :  // Lower cherry jackpot
                                 3;  // Lowest lemon jackpot
                const winnings = bet * multiplier;
                this.playerMoney += winnings;
                this.showMessage(`Jackpot! You won $${winnings}! 🎉`);
                
                this.slots.forEach(slot => {
                    slot.classList.add('win');
                    setTimeout(() => slot.classList.remove('win'), 1000);
                });
            } else if (results.filter(symbol => symbol === results[0]).length === 2 ||
                      results.filter(symbol => symbol === results[1]).length === 2) {
                const winnings = bet * 2; // Reduced two-of-a-kind payout
                this.playerMoney += winnings;
                this.showMessage(`Two of a kind! You won $${winnings}!`);
            } else {
                this.showMessage('No luck this time!');
            }

            this.updateBalance();
        } catch (error) {
            console.error('Spin error:', error);
            this.showMessage('Something went wrong! Try again.');
        } finally {
            this.spinButton.disabled = false;
            this.cheatButton.disabled = false;
            this.betInput.disabled = false;
            this.isSpinning = false;

            if (this.playerMoney <= 0) {
                this.showMessage('Game Over! Refresh the page to start over!');
                this.spinButton.disabled = true;
                this.cheatButton.disabled = true;
            }
        }
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    window.slotMachine = new SlotMachine();
});

class SpeechAssistant {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.currentUtterance = null;
        this.voices = [];
        this.targetLanguage = 'en';
        this.initializeElements();
        this.setupSpeechRecognition();
        this.initializeVoices();
        this.addEventListeners();
    }

    initializeElements() {
        // Clear any existing event listeners
        const oldStartBtn = document.getElementById('startListening');
        const newStartBtn = oldStartBtn.cloneNode(true);
        oldStartBtn.parentNode.replaceChild(newStartBtn, oldStartBtn);
        
        const oldStopBtn = document.getElementById('stopListening');
        const newStopBtn = oldStopBtn.cloneNode(true);
        oldStopBtn.parentNode.replaceChild(newStopBtn, oldStopBtn);

        // Get fresh references
        this.startBtn = newStartBtn;
        this.stopBtn = newStopBtn;
        this.transcriptOutput = document.getElementById('transcriptOutput');
        this.listeningStatus = document.getElementById('listeningStatus');
        this.copyBtn = document.getElementById('copyTranscript');
        this.textInput = document.getElementById('textInput');
        this.speakBtn = document.getElementById('speakButton');
        this.pauseBtn = document.getElementById('pauseButton');
        this.stopSpeakBtn = document.getElementById('stopButton');
        this.voiceSelect = document.getElementById('voiceSelect');
        this.rateRange = document.getElementById('rateRange');
        this.rateValue = document.getElementById('rateValue');
        this.voiceToVoiceBtn = document.getElementById('voiceToVoiceBtn');
        this.targetLangSelect = document.getElementById('targetLanguage');
        this.translateBtn = document.getElementById('translateBtn');
        this.voiceTranslateBtn = document.getElementById('voiceTranslateBtn');

        // Initialize button states
        this.stopBtn.disabled = true;

        // Image to text elements
        this.imageInput = document.getElementById('imageInput');
        this.imagePreview = document.getElementById('imagePreview');
        this.processImageBtn = document.getElementById('processImageBtn');
        this.ocrStatus = document.getElementById('ocrStatus');
        this.extractedText = document.getElementById('extractedText');
        this.speakExtractedBtn = document.getElementById('speakExtractedText');
        this.copyExtractedBtn = document.getElementById('copyExtractedText');

        // Add voice input button
        this.voiceInputBtn = document.createElement('button');
        this.voiceInputBtn.id = 'voiceInputBtn';
        this.voiceInputBtn.className = 'voice-btn';
        this.voiceInputBtn.innerHTML = '🎤 Add Task by Voice';
        
        // Insert voice button after task input
        this.textInput.parentNode.insertBefore(this.voiceInputBtn, this.textInput.nextSibling);
        
        // Add voice status indicator
        this.voiceStatus = document.createElement('div');
        this.voiceStatus.className = 'voice-status';
        this.voiceInputBtn.parentNode.insertBefore(this.voiceStatus, this.voiceInputBtn.nextSibling);
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            this.setupVoiceRecognition();
        }
    }

    setupVoiceRecognition() {
        this.recognition.onstart = () => {
            this.voiceStatus.textContent = 'Listening... Say your task';
            this.voiceStatus.classList.add('listening');
            this.voiceInputBtn.innerHTML = '⏹️ Stop Listening';
        };

        this.recognition.onend = () => {
            this.voiceStatus.textContent = '';
            this.voiceStatus.classList.remove('listening');
            this.voiceInputBtn.innerHTML = '🎤 Add Task by Voice';
        };

        this.recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            this.processVoiceCommand(text);
        };

        this.recognition.onerror = (event) => {
            this.voiceStatus.textContent = 'Error: ' + event.error;
            setTimeout(() => {
                this.voiceStatus.textContent = '';
            }, 3000);
        };
    }

    processVoiceCommand(text) {
        // Parse date from common phrases
        let date = this.extractDateFromText(text);
        let time = this.extractTimeFromText(text);
        let title = text;

        // Remove date and time related phrases
        const patterns = [
            'due tomorrow',
            'due next week',
            'due today',
            'for tomorrow',
            'for today',
            'by tomorrow',
            'by today',
            'next week',
            'tomorrow',
            'today',
            'at noon', 'in the morning', 'in the afternoon',
            'in the evening', 'at night', 'at \\d{1,2}(?::\\d{2})?\\s*(?:am|pm)',
            'at \\d{1,2}\\s*(?:am|pm)', 'at \\d{1,2}(?::\\d{2})?'
        ];

        patterns.forEach(pattern => {
            title = title.replace(new RegExp(pattern, 'gi'), '');
        });

        title = title.trim();
        title = title.charAt(0).toUpperCase() + title.slice(1);

        this.textInput.value = title;
        if (date) this.dateInput.value = date;
        if (time) this.timeInput.value = time;

        this.addTask();
    }

    extractDateFromText(text) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        // Format date as YYYY-MM-DD
        const formatDate = (date) => {
            return date.toISOString().split('T')[0];
        };

        text = text.toLowerCase();

        if (text.includes('tomorrow')) {
            return formatDate(tomorrow);
        } else if (text.includes('next week')) {
            return formatDate(nextWeek);
        } else if (text.includes('today')) {
            return formatDate(today);
        }

        return formatDate(today); // Default to today
    }

    extractTimeFromText(text) {
        text = text.toLowerCase();
        
        // Check for specific time keywords
        for (const [keyword, time] of Object.entries(this.timeKeywords)) {
            if (text.includes(keyword)) {
                return time;
            }
        }

        // Check for "at HH:MM" format
        const timeRegex = /at (\d{1,2}(?::\d{2})?)\s*(?:am|pm)?/i;
        const match = text.match(timeRegex);
        if (match) {
            let [hours, minutes = '00'] = match[1].split(':');
            hours = parseInt(hours);
            
            // Handle AM/PM
            if (text.toLowerCase().includes('pm') && hours < 12) {
                hours += 12;
            }
            if (text.toLowerCase().includes('am') && hours === 12) {
                hours = 0;
            }

            return `${String(hours).padStart(2, '0')}:${minutes}`;
        }

        return null;
    }

    initializeVoices() {
        // Load voices and populate select
        const loadVoices = () => {
            this.voices = this.synthesis.getVoices();
            
            // Filter for voices that are likely to work well
            const reliableVoices = this.voices.filter(voice => 
                // Include native voices and some well-known synthesized voices
                voice.localService || 
                voice.name.includes('Google') || 
                voice.name.includes('Microsoft')
            );

            // Sort voices by language and name
            reliableVoices.sort((a, b) => {
                if (a.lang < b.lang) return -1;
                if (a.lang > b.lang) return 1;
                return a.name.localeCompare(b.name);
            });

            // Group voices by language
            const voicesByLang = reliableVoices.reduce((acc, voice) => {
                const lang = voice.lang.split('-')[0];
                if (!acc[lang]) acc[lang] = [];
                acc[lang].push(voice);
                return acc;
            }, {});

            // Create option groups for each language
            this.voiceSelect.innerHTML = Object.entries(voicesByLang).map(([lang, voices]) => `
                <optgroup label="${this.getLanguageName(lang)}">
                    ${voices.map(voice => `
                        <option value="${voice.name}">
                            ${voice.name} ${voice.localService ? '(Local)' : '(Network)'}
                        </option>
                    `).join('')}
                </optgroup>
            `).join('');

            // Select a default voice
            const defaultVoice = reliableVoices.find(voice => 
                voice.lang.startsWith('en') && voice.localService
            ) || reliableVoices[0];
            
            if (defaultVoice) {
                this.voiceSelect.value = defaultVoice.name;
            }
        };

        // Initial load
        loadVoices();

        // Handle dynamic voice loading
        if (this.synthesis.onvoiceschanged !== undefined) {
            this.synthesis.onvoiceschanged = loadVoices;
        }
    }

    getLanguageName(langCode) {
        const languages = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh': 'Chinese'
            // Add more languages as needed
        };
        return languages[langCode] || langCode.toUpperCase();
    }

    addEventListeners() {
        // Speech to Text listeners
        this.startBtn.onclick = () => {
            if (!this.isListening) {
                this.startListening();
            }
        };

        this.stopBtn.onclick = () => {
            if (this.isListening) {
                this.stopListening();
            }
        };

        this.copyBtn.onclick = () => this.copyToClipboard();
        this.speakBtn.onclick = () => this.speak();
        this.pauseBtn.onclick = () => this.pauseResume();
        this.stopSpeakBtn.onclick = () => this.stop();
        
        // Make sure these elements exist before adding listeners
        if (this.voiceToVoiceBtn) {
            this.voiceToVoiceBtn.onclick = () => this.voiceToVoice();
        }
        
        if (this.translateBtn) {
            this.translateBtn.onclick = () => this.translate();
        }

        if (this.rateRange) {
            this.rateRange.oninput = (e) => {
                this.rateValue.textContent = `Speed: ${e.target.value}x`;
            };
        }

        if (this.voiceTranslateBtn) {
            this.voiceTranslateBtn.onclick = () => this.voiceToLanguage();
        }

        // Image to text listeners
        if (this.imageInput) {
            this.imageInput.onchange = (e) => this.handleImageUpload(e);
        }
        if (this.processImageBtn) {
            this.processImageBtn.onclick = () => this.processImage();
        }
        if (this.speakExtractedBtn) {
            this.speakExtractedBtn.onclick = () => {
                const text = this.extractedText.value;
                if (text) {
                    this.textInput.value = text;
                    this.speak();
                }
            };
        }
        if (this.copyExtractedBtn) {
            this.copyExtractedBtn.onclick = () => {
                const text = this.extractedText.value;
                if (text) {
                    navigator.clipboard.writeText(text);
                    this.showMessage('Text copied to clipboard!');
                }
            };
        }

        if (this.voiceInputBtn) {
            this.voiceInputBtn.addEventListener('click', () => {
                if (this.recognition) {
                    if (this.voiceInputBtn.innerHTML.includes('Stop')) {
                        this.recognition.stop();
                    } else {
                        this.recognition.start();
                    }
                } else {
                    this.voiceStatus.textContent = 'Speech recognition not supported in this browser';
                    setTimeout(() => {
                        this.voiceStatus.textContent = '';
                    }, 3000);
                }
            });
        }
    }

    startListening() {
        return new Promise((resolve, reject) => {
            try {
                if (!this.recognition) {
                    throw new Error('Speech recognition not initialized');
                }
                
                this.recognition.start();
                resolve();
            } catch (error) {
                console.error('Error starting recognition:', error);
                this.updateStatus('Error starting recognition. Please try again.');
                reject(error);
            }
        });
    }

    stopListening() {
        try {
            if (this.recognition && this.isListening) {
                this.recognition.stop();
                this.isListening = false;
                this.updateStatus('Stopped listening');
                this.startBtn.disabled = false;
                this.stopBtn.disabled = true;
            }
        } catch (error) {
            console.error('Error stopping recognition:', error);
        }
    }

    updateStatus(message) {
        if (this.listeningStatus) {
            this.listeningStatus.textContent = message;
            this.listeningStatus.className = 'status' + (this.isListening ? ' listening' : '');
        }
    }

    copyToClipboard() {
        this.transcriptOutput.select();
        document.execCommand('copy');
        this.updateStatus('Copied to clipboard! ✓');
        setTimeout(() => {
            this.updateStatus(this.isListening ? 'Listening... 🎤' : 'Click "Start Listening" to begin');
        }, 2000);
    }

    speak() {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }

        const text = this.textInput.value.trim();
        if (!text) {
            this.showMessage('Please enter some text to speak');
            return;
        }

        try {
            const utterance = new SpeechSynthesisUtterance(text);
            const selectedVoice = this.voices.find(voice => voice.name === this.voiceSelect.value);
            
            if (!selectedVoice) {
                throw new Error('Selected voice not found');
            }

            utterance.voice = selectedVoice;
            utterance.rate = parseFloat(this.rateRange.value);
            utterance.pitch = 1;
            utterance.volume = 1;

            // Add event handlers
            utterance.onstart = () => {
                this.speakBtn.disabled = true;
                this.showMessage('Speaking...');
            };

            utterance.onend = () => {
                this.speakBtn.disabled = false;
                this.showMessage('Finished speaking');
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                this.speakBtn.disabled = false;
                this.showMessage('Error occurred while speaking');
            };

            this.currentUtterance = utterance;
            this.synthesis.speak(utterance);
        } catch (error) {
            console.error('Speech synthesis error:', error);
            this.showMessage('Error: Could not speak the text. Try another voice.');
            this.speakBtn.disabled = false;
        }
    }

    pauseResume() {
        if (this.synthesis.speaking) {
            if (this.synthesis.paused) {
                this.synthesis.resume();
            } else {
                this.synthesis.pause();
            }
        }
    }

    stop() {
        this.synthesis.cancel();
    }

    async translateText(text, targetLang) {
        try {
            const response = await fetch('https://translation-api-url.com/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_API_KEY'
                },
                body: JSON.stringify({
                    text: text,
                    target_lang: targetLang
                })
            });

            const data = await response.json();
            return data.translated_text;
        } catch (error) {
            console.error('Translation error:', error);
            throw new Error('Translation failed');
        }
    }

    async voiceToVoice() {
        if (!this.voiceToVoiceBtn) return;

        if (this.isListening) {
            this.stopListening();
            this.voiceToVoiceBtn.textContent = 'Start Voice-to-Voice 🗣️';
            return;
        }

        try {
            // Reset previous handlers
            if (this.recognition) {
                this.recognition.onresult = null;
                this.recognition.onend = null;
            }

            // Setup new handlers
            this.recognition.onresult = async (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript + ' ';
                    }
                }
                
                if (finalTranscript) {
                    this.transcriptOutput.value = finalTranscript;
                    this.textInput.value = finalTranscript;
                    
                    // Stop listening
                    this.stopListening();
                    this.voiceToVoiceBtn.textContent = 'Start Voice-to-Voice 🗣️';
                    
                    // Speak the result
                    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
                    this.speak();
                }
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.voiceToVoiceBtn.textContent = 'Start Voice-to-Voice 🗣️';
                this.startBtn.disabled = false;
                this.stopBtn.disabled = true;
            };

            // Start listening
            this.voiceToVoiceBtn.textContent = 'Stop Voice-to-Voice ⏹️';
            this.updateStatus('Speak now... Voice will be converted to speech');
            await this.startListening();

        } catch (error) {
            console.error('Voice-to-voice error:', error);
            this.updateStatus('Error in voice-to-voice conversion');
            this.voiceToVoiceBtn.textContent = 'Start Voice-to-Voice 🗣️';
        }
    }

    async translate() {
        const text = this.textInput.value.trim();
        if (!text) {
            this.showMessage('Please enter text to translate');
            return;
        }

        try {
            this.showMessage('Translating...');
            const translatedText = await this.translateText(text, this.targetLangSelect.value);
            this.textInput.value = translatedText;
            this.speak();
        } catch (error) {
            this.showMessage('Translation failed. Please try again.');
        }
    }

    async voiceToLanguage() {
        if (!this.voiceTranslateBtn) return;

        const originalText = document.getElementById('originalText');
        const translatedText = document.getElementById('translatedText');
        const translationStatus = document.getElementById('translationStatus');

        if (this.isListening) {
            this.stopListening();
            this.voiceTranslateBtn.textContent = 'Start Voice Translation 🌐';
            return;
        }

        try {
            // Reset previous handlers
            if (this.recognition) {
                this.recognition.onresult = null;
                this.recognition.onend = null;
            }

            // Setup new handlers
            this.recognition.onresult = async (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript + ' ';
                    }
                }
                
                if (finalTranscript) {
                    // Stop listening
                    this.stopListening();
                    this.voiceTranslateBtn.textContent = 'Start Voice Translation 🌐';
                    
                    // Display original text
                    originalText.textContent = finalTranscript;
                    
                    // Get target language
                    const targetLang = this.targetLangSelect.value;
                    
                    try {
                        // Update status
                        translationStatus.textContent = 'Translating...';
                        translationStatus.classList.add('translating');
                        
                        // Translate the text
                        const translatedResult = await this.translateText(finalTranscript, targetLang);
                        translatedText.textContent = translatedResult;
                        
                        // Find appropriate voice for target language
                        const targetVoice = this.voices.find(voice => 
                            voice.lang.startsWith(targetLang) && 
                            (voice.localService || voice.name.includes('Google') || voice.name.includes('Microsoft'))
                        );
                        
                        if (targetVoice) {
                            // Create utterance with translated text
                            const utterance = new SpeechSynthesisUtterance(translatedResult);
                            utterance.voice = targetVoice;
                            utterance.rate = parseFloat(this.rateRange.value);
                            utterance.pitch = 1;
                            utterance.volume = 1;
                            
                            // Speak the translation
                            this.synthesis.speak(utterance);
                            translationStatus.textContent = 'Speaking translation...';
                            
                            utterance.onend = () => {
                                translationStatus.textContent = 'Translation complete';
                                translationStatus.classList.remove('translating');
                            };
                        } else {
                            throw new Error('No suitable voice found for the target language');
                        }
                    } catch (error) {
                        console.error('Translation error:', error);
                        translationStatus.textContent = 'Translation failed. Please try again.';
                        translationStatus.classList.remove('translating');
                    }
                }
            };

            // Start listening
            this.voiceTranslateBtn.textContent = 'Stop Recording ⏹️';
            translationStatus.textContent = 'Listening... Speak now';
            translationStatus.classList.add('translating');
            await this.startListening();

        } catch (error) {
            console.error('Voice translation error:', error);
            translationStatus.textContent = 'Error in voice translation';
            translationStatus.classList.remove('translating');
            this.voiceTranslateBtn.textContent = 'Start Voice Translation 🌐';
        }
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.imagePreview.src = e.target.result;
                this.imagePreview.style.display = 'block';
                this.ocrStatus.textContent = 'Image loaded. Click Process to extract text.';
                this.processImageBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    }

    async processImage() {
        try {
            const file = this.imageInput.files[0];
            if (!file) {
                this.ocrStatus.textContent = 'Please select an image first.';
                return;
            }

            this.ocrStatus.textContent = 'Processing image...';
            this.ocrStatus.classList.add('processing');
            this.processImageBtn.disabled = true;

            // Create form data
            const formData = new FormData();
            formData.append('image', file);

            // Call OCR API (example using Tesseract.js)
            const worker = await Tesseract.createWorker();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            
            const { data: { text } } = await worker.recognize(file);
            await worker.terminate();

            // Display results
            this.extractedText.value = text;
            this.ocrStatus.textContent = 'Text extracted successfully!';
            this.ocrStatus.classList.remove('processing');
            this.processImageBtn.disabled = false;

        } catch (error) {
            console.error('OCR error:', error);
            this.ocrStatus.textContent = 'Error processing image. Please try again.';
            this.ocrStatus.classList.remove('processing');
            this.processImageBtn.disabled = false;
        }
    }
}

// Initialize only the speech assistant
window.addEventListener('load', () => {
    window.speechAssistant = new SpeechAssistant();
});

class TaskPlanner {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        // Keywords for priority detection
        this.priorityKeywords = {
            high: [
                'urgent', 'asap', 'emergency', 'deadline', 'critical',
                'important', 'priority', 'due', 'overdue', 'immediate',
                'crucial', 'vital', 'essential', 'required'
            ],
            medium: [
                'soon', 'next', 'tomorrow', 'review', 'update',
                'prepare', 'develop', 'improve', 'enhance', 'modify',
                'check', 'follow up', 'coordinate'
            ],
            low: [
                'maybe', 'later', 'sometime', 'eventually', 'consider',
                'optional', 'if possible', 'would be nice', 'research',
                'look into', 'investigate'
            ]
        };

        // Add time-related keywords
        this.timeKeywords = {
            morning: '09:00',
            noon: '12:00',
            afternoon: '14:00',
            evening: '18:00',
            night: '20:00'
        };

        // Initialize speech recognition
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            this.setupVoiceRecognition();
        }

        this.initializeElements();
        this.addEventListeners();
        this.renderTasks();
        this.updateStats();
    }

    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.dateInput = document.getElementById('dateInput');
        this.priorityInput = document.getElementById('priorityInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.tasksList = document.getElementById('tasksList');
        this.searchInput = document.getElementById('searchInput');
        this.filterPriority = document.getElementById('filterPriority');
        this.filterStatus = document.getElementById('filterStatus');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.timeInput = document.getElementById('timeInput');

        // Set today's date as default in YYYY-MM-DD format
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        this.dateInput.value = `${year}-${month}-${day}`;

        // Set default time to next hour
        const now = new Date();
        now.setHours(now.getHours() + 1, 0, 0); // Next hour, 0 minutes
        this.timeInput.value = now.toTimeString().slice(0, 5);

        // Add voice input button
        this.voiceInputBtn = document.createElement('button');
        this.voiceInputBtn.id = 'voiceInputBtn';
        this.voiceInputBtn.className = 'voice-btn';
        this.voiceInputBtn.innerHTML = '🎤 Add Task by Voice';
        
        // Insert voice button after task input
        this.taskInput.parentNode.insertBefore(this.voiceInputBtn, this.taskInput.nextSibling);
        
        // Add voice status indicator
        this.voiceStatus = document.createElement('div');
        this.voiceStatus.className = 'voice-status';
        this.voiceInputBtn.parentNode.insertBefore(this.voiceStatus, this.voiceInputBtn.nextSibling);
    }

    setupVoiceRecognition() {
        this.recognition.onstart = () => {
            this.voiceStatus.textContent = 'Listening... Say your task';
            this.voiceStatus.classList.add('listening');
            this.voiceInputBtn.innerHTML = '⏹️ Stop Listening';
        };

        this.recognition.onend = () => {
            this.voiceStatus.textContent = '';
            this.voiceStatus.classList.remove('listening');
            this.voiceInputBtn.innerHTML = '🎤 Add Task by Voice';
        };

        this.recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            this.processVoiceCommand(text);
        };

        this.recognition.onerror = (event) => {
            this.voiceStatus.textContent = 'Error: ' + event.error;
            setTimeout(() => {
                this.voiceStatus.textContent = '';
            }, 3000);
        };
    }

    processVoiceCommand(text) {
        // Parse date from common phrases
        let date = this.extractDateFromText(text);
        let time = this.extractTimeFromText(text);
        let title = text;

        // Remove date and time related phrases
        const patterns = [
            ...this.datePatterns,
            'at noon', 'in the morning', 'in the afternoon',
            'in the evening', 'at night', 'at \\d{1,2}(?::\\d{2})?\\s*(?:am|pm)',
            'at \\d{1,2}\\s*(?:am|pm)', 'at \\d{1,2}(?::\\d{2})?'
        ];

        patterns.forEach(pattern => {
            title = title.replace(new RegExp(pattern, 'gi'), '');
        });

        title = title.trim();
        title = title.charAt(0).toUpperCase() + title.slice(1);

        this.taskInput.value = title;
        if (date) this.dateInput.value = date;
        if (time) this.timeInput.value = time;

        this.addTask();
    }

    extractDateFromText(text) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        // Format date as YYYY-MM-DD
        const formatDate = (date) => {
            return date.toISOString().split('T')[0];
        };

        text = text.toLowerCase();

        if (text.includes('tomorrow')) {
            return formatDate(tomorrow);
        } else if (text.includes('next week')) {
            return formatDate(nextWeek);
        } else if (text.includes('today')) {
            return formatDate(today);
        }

        return formatDate(today); // Default to today
    }

    extractTimeFromText(text) {
        text = text.toLowerCase();
        
        // Check for specific time keywords
        for (const [keyword, time] of Object.entries(this.timeKeywords)) {
            if (text.includes(keyword)) {
                return time;
            }
        }

        // Check for "at HH:MM" format
        const timeRegex = /at (\d{1,2}(?::\d{2})?)\s*(?:am|pm)?/i;
        const match = text.match(timeRegex);
        if (match) {
            let [hours, minutes = '00'] = match[1].split(':');
            hours = parseInt(hours);
            
            // Handle AM/PM
            if (text.toLowerCase().includes('pm') && hours < 12) {
                hours += 12;
            }
            if (text.toLowerCase().includes('am') && hours === 12) {
                hours = 0;
            }

            return `${String(hours).padStart(2, '0')}:${minutes}`;
        }

        return null;
    }

    addEventListeners() {
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        this.searchInput.addEventListener('input', () => this.renderTasks());
        this.filterPriority.addEventListener('change', () => this.renderTasks());
        this.filterStatus.addEventListener('change', () => this.renderTasks());
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());

        if (this.voiceInputBtn) {
            this.voiceInputBtn.addEventListener('click', () => {
                if (this.recognition) {
                    if (this.voiceInputBtn.innerHTML.includes('Stop')) {
                        this.recognition.stop();
                    } else {
                        this.recognition.start();
                    }
                } else {
                    this.voiceStatus.textContent = 'Speech recognition not supported in this browser';
                    setTimeout(() => {
                        this.voiceStatus.textContent = '';
                    }, 3000);
                }
            });
        }
    }

    addTask() {
        const title = this.taskInput.value.trim();
        const date = this.dateInput.value;
        const time = this.timeInput.value;

        if (title) {
            const suggestedPriority = this.analyzePriority(title, date, time);
            this.priorityInput.value = suggestedPriority;
            this.showPrioritySuggestion(suggestedPriority);

            const task = {
                id: Date.now(),
                title,
                date,
                time,
                priority: suggestedPriority,
                completed: false
            };

            this.tasks.unshift(task);
            this.saveTasks();
            this.taskInput.value = '';
            this.renderTasks();
            this.updateStats();
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
    }

    clearCompleted() {
        this.tasks = this.tasks.filter(t => !t.completed);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    filterTasks() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const priorityFilter = this.filterPriority.value;
        const statusFilter = this.filterStatus.value;

        return this.tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm);
            const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
            const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'completed' && task.completed) ||
                (statusFilter === 'pending' && !task.completed);

            return matchesSearch && matchesPriority && matchesStatus;
        });
    }

    renderTasks() {
        const filteredTasks = this.filterTasks();
        
        this.tasksList.innerHTML = filteredTasks.map(task => {
            const taskDate = new Date(`${task.date}T${task.time}`);
            const formattedDate = taskDate.toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric'
            });
            const formattedTime = taskDate.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit'
            });

            const now = new Date();
            const isOverdue = taskDate < now && !task.completed;
            const isDueSoon = !isOverdue && taskDate - now < 24 * 60 * 60 * 1000; // 24 hours

            return `
                <div class="task-item priority-${task.priority} ${task.completed ? 'completed' : ''}">
                    <input type="checkbox" 
                           class="task-checkbox" 
                           ${task.completed ? 'checked' : ''}
                           onchange="taskPlanner.toggleTask(${task.id})">
                    <div class="task-content">
                        <div class="task-title">${task.title}</div>
                        <div class="task-details">
                            <span class="${isOverdue ? 'overdue' : isDueSoon ? 'due-soon' : ''}">
                                📅 Due: ${formattedDate}
                            </span>
                            <span class="time-indicator">
                                ⏰ ${formattedTime}
                            </span>
                            <span>
                                🎯 Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                        </div>
                    </div>
                    <div class="task-actions">
                        <span class="delete-btn" onclick="taskPlanner.deleteTask(${task.id})">×</span>
                    </div>
                </div>
            `;
        }).join('') || '<div class="no-tasks">No tasks found</div>';
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('pendingTasks').textContent = pending;
    }

    analyzePriority(title, dueDate, dueTime) {
        const text = title.toLowerCase();
        let score = 0;

        // Check due date priority
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time part for accurate date comparison
        const taskDate = new Date(dueDate + 'T' + dueTime);
        const daysUntilDue = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));

        // Add score based on due date
        if (daysUntilDue <= 1) score += 3;
        else if (daysUntilDue <= 3) score += 2;
        else if (daysUntilDue <= 7) score += 1;

        // Check for priority keywords
        for (const keyword of this.priorityKeywords.high) {
            if (text.includes(keyword)) score += 3;
        }
        for (const keyword of this.priorityKeywords.medium) {
            if (text.includes(keyword)) score += 2;
        }
        for (const keyword of this.priorityKeywords.low) {
            if (text.includes(keyword)) score -= 1;
        }

        // Check for exclamation marks
        const exclamationCount = (text.match(/!/g) || []).length;
        score += exclamationCount;

        // Determine priority based on score
        if (score >= 3) return 'high';
        if (score >= 1) return 'medium';
        return 'low';
    }

    showPrioritySuggestion(priority) {
        // Remove any existing suggestion
        const oldSuggestion = document.querySelector('.priority-suggestion');
        if (oldSuggestion) oldSuggestion.remove();

        // Create suggestion element
        const suggestion = document.createElement('div');
        suggestion.className = `priority-suggestion priority-${priority}`;
        suggestion.innerHTML = `
            <div class="suggestion-content">
                <span>AI Suggested Priority: ${priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
                <div class="suggestion-reason">
                    Based on task description and due date
                </div>
            </div>
        `;

        // Insert after the priority select
        this.priorityInput.parentNode.insertBefore(suggestion, this.priorityInput.nextSibling);

        // Fade out after 3 seconds
        setTimeout(() => {
            suggestion.style.opacity = '0';
            setTimeout(() => suggestion.remove(), 500);
        }, 3000);
    }
}

// Initialize the task planner when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.taskPlanner = new TaskPlanner();
}); 