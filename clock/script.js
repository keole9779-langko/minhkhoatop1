class DigitalClock {
    constructor() {
        this.clocks = new Map();
        this.timeFormat = '24h';
        this.dateFormat = 'short';
        this.animationId = null;
        this.defaultTimezones = [
            'UTC',
            'America/New_York',
            'Europe/London',
            'Asia/Tokyo'
        ];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFromStorage();
        if (this.clocks.size === 0) {
            this.addDefaultClocks();
        }
        this.startAnimation();
    }

    setupEventListeners() {
        document.getElementById('addBtn').addEventListener('click', () => this.addClock());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetClocks());
        document.getElementById('timeFormat').addEventListener('change', (e) => {
            this.timeFormat = e.target.value;
            this.updateAllClocks();
        });
        document.getElementById('dateFormat').addEventListener('change', (e) => {
            this.dateFormat = e.target.value;
            this.updateAllClocks();
        });
        document.getElementById('timezone').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addClock();
        });
    }

    addDefaultClocks() {
        this.defaultTimezones.forEach(timezone => {
            this.clocks.set(timezone, {
                timezone,
                element: null
            });
        });
        this.renderClocks();
        this.saveToStorage();
    }

    addClock() {
        const select = document.getElementById('timezone');
        const timezone = select.value;

        if (!timezone) {
            alert('Please select a timezone');
            return;
        }

        if (this.clocks.has(timezone)) {
            alert('This timezone is already added');
            return;
        }

        if (this.clocks.size >= 12) {
            alert('Maximum 12 clocks allowed');
            return;
        }

        this.clocks.set(timezone, {
            timezone,
            element: null
        });

        select.value = '';
        this.renderClocks();
        this.saveToStorage();
    }

    removeClock(timezone) {
        this.clocks.delete(timezone);
        this.renderClocks();
        this.saveToStorage();
    }

    resetClocks() {
        if (confirm('Are you sure you want to reset to default clocks?')) {
            this.clocks.clear();
            this.addDefaultClocks();
        }
    }

    renderClocks() {
        const container = document.getElementById('clocksContainer');
        container.innerHTML = '';

        if (this.clocks.size === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🌍</div>
                    <p>No clocks added. Add a timezone to get started!</p>
                </div>
            `;
            return;
        }

        this.clocks.forEach((clock, timezone) => {
            const card = this.createClockCard(timezone);
            container.appendChild(card);
            clock.element = card;
        });
    }

    createClockCard(timezone) {
        const card = document.createElement('div');
        card.className = 'clock-card';
        card.dataset.timezone = timezone;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => this.removeClock(timezone));

        const timezoneName = document.createElement('div');
        timezoneName.className = 'timezone-name';
        timezoneName.textContent = this.getDisplayName(timezone);

        const timezoneOffset = document.createElement('div');
        timezoneOffset.className = 'timezone-offset';
        timezoneOffset.setAttribute('data-timezone', timezone);

        const digitalTime = document.createElement('div');
        digitalTime.className = 'digital-time';
        digitalTime.setAttribute('data-time', timezone);

        const dateDisplay = document.createElement('div');
        dateDisplay.className = 'date-display';
        dateDisplay.setAttribute('data-date', timezone);

        const dayDisplay = document.createElement('div');
        dayDisplay.className = 'day-display';
        dayDisplay.setAttribute('data-day', timezone);

        const analogClock = document.createElement('div');
        analogClock.className = 'analog-clock';
        analogClock.setAttribute('data-analog', timezone);

        const center = document.createElement('div');
        center.className = 'clock-center';

        const hourHand = document.createElement('div');
        hourHand.className = 'hand hour-hand';
        hourHand.setAttribute('data-hour', timezone);

        const minuteHand = document.createElement('div');
        minuteHand.className = 'hand minute-hand';
        minuteHand.setAttribute('data-minute', timezone);

        const secondHand = document.createElement('div');
        secondHand.className = 'hand second-hand';
        secondHand.setAttribute('data-second', timezone);

        analogClock.appendChild(center);
        analogClock.appendChild(hourHand);
        analogClock.appendChild(minuteHand);
        analogClock.appendChild(secondHand);

        card.appendChild(removeBtn);
        card.appendChild(timezoneName);
        card.appendChild(timezoneOffset);
        card.appendChild(digitalTime);
        card.appendChild(dateDisplay);
        card.appendChild(dayDisplay);
        card.appendChild(analogClock);

        return card;
    }

    getDisplayName(timezone) {
        return timezone.replace(/_/g, ' ');
    }

    updateAllClocks() {
        const now = new Date();

        this.clocks.forEach((clock, timezone) => {
            if (clock.element) {
                this.updateClockDisplay(timezone, now);
            }
        });
    }

    updateClockDisplay(timezone, now) {
        try {
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: this.timeFormat === '12h'
            });

            const parts = formatter.formatToParts(now);
            const timeObj = {};
            parts.forEach(part => {
                timeObj[part.type] = part.value;
            });

            this.updateDigitalTime(timezone, timeObj);
            this.updateDate(timezone, timeObj);
            this.updateDay(timezone, now);
            this.updateAnalogClock(timezone, timeObj);
            this.updateTimezoneOffset(timezone, now);
        } catch (error) {
            console.error(`Error updating clock for ${timezone}:`, error);
        }
    }

    updateDigitalTime(timezone, timeObj) {
        const element = document.querySelector(`[data-time="${timezone}"]`);
        if (!element) return;

        let timeString;
        if (this.timeFormat === '24h') {
            timeString = `${timeObj.hour}:${timeObj.minute}:${timeObj.second}`;
        } else {
            timeString = `${timeObj.hour}:${timeObj.minute}:${timeObj.second}`;
        }
        element.textContent = timeString;
    }

    updateDate(timezone, timeObj) {
        const element = document.querySelector(`[data-date="${timezone}"]`);
        if (!element) return;

        let dateString;
        const month = timeObj.month;
        const day = timeObj.day;
        const year = timeObj.year;

        if (this.dateFormat === 'short') {
            dateString = `${month}/${day}/${year}`;
        } else if (this.dateFormat === 'long') {
            const date = new Date(`${year}-${month}-${day}`);
            dateString = date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } else if (this.dateFormat === 'iso') {
            dateString = `${year}-${month}-${day}`;
        }
        element.textContent = dateString;
    }

    updateDay(timezone, now) {
        const element = document.querySelector(`[data-day="${timezone}"]`);
        if (!element) return;

        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            weekday: 'long'
        });
        element.textContent = formatter.format(now);
    }

    updateAnalogClock(timezone, timeObj) {
        const hour = parseInt(timeObj.hour) % 12;
        const minute = parseInt(timeObj.minute);
        const second = parseInt(timeObj.second);

        const hourHand = document.querySelector(`[data-hour="${timezone}"]`);
        const minuteHand = document.querySelector(`[data-minute="${timezone}"]`);
        const secondHand = document.querySelector(`[data-second="${timezone}"]`);

        if (hourHand) {
            const hourDegrees = (hour * 30) + (minute * 0.5);
            hourHand.style.transform = `rotate(${hourDegrees}deg)`;
        }

        if (minuteHand) {
            const minuteDegrees = (minute * 6) + (second * 0.1);
            minuteHand.style.transform = `rotate(${minuteDegrees}deg)`;
        }

        if (secondHand) {
            const secondDegrees = second * 6;
            secondHand.style.transform = `rotate(${secondDegrees}deg)`;
        }
    }

    updateTimezoneOffset(timezone, now) {
        const element = document.querySelector(`[data-timezone="${timezone}"]`);
        if (!element) return;

        const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
        const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
        const offset = (tzDate - utcDate) / (1000 * 60 * 60);

        const sign = offset >= 0 ? '+' : '';
        const hours = Math.floor(Math.abs(offset));
        const minutes = (Math.abs(offset) % 1) * 60;
        element.textContent = `UTC ${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
    }

    startAnimation() {
        const animate = () => {
            this.updateAllClocks();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }

    saveToStorage() {
        const timezones = Array.from(this.clocks.keys());
        localStorage.setItem('selectedTimezones', JSON.stringify(timezones));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('selectedTimezones');
        if (saved) {
            try {
                const timezones = JSON.parse(saved);
                timezones.forEach(timezone => {
                    try {
                        new Intl.DateTimeFormat('en-US', { timeZone: timezone });
                        this.clocks.set(timezone, { timezone, element: null });
                    } catch (e) {
                        console.warn(`Invalid timezone: ${timezone}`);
                    }
                });
                if (this.clocks.size > 0) {
                    this.renderClocks();
                }
            } catch (error) {
                console.error('Error loading saved timezones:', error);
            }
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DigitalClock();
    });
} else {
    new DigitalClock();
}