// Portfolio Nexus JavaScript
class PortfolioNexus {
    constructor() {
        this.portfolioData = {};
        this.filteredData = {};
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.currentSort = 'rating-desc';
        this.currentLayout = 'grid';
        this.currentTheme = 'dark';
        this.lastUpdated = null;
        this.autoRefreshInterval = null;
        this.updateCount = 0;
        this.searchSuggestions = [];
        
        this.init();
    }

    async init() {
        try {
            await this.loadPortfolioData();
            this.setupEventListeners();
            this.renderPortfolios();
            this.updateStats();
            this.updateFilterCounts();
            this.startAutoRefresh();
            this.updateLastUpdatedTime();
            this.initSearchSuggestions();
        } catch (error) {
            console.error('Error initializing portfolio nexus:', error);
            this.showNotification('Error', 'Failed to load portfolio data. Please try again later.', 'error');
        }
    }

    async loadPortfolioData() {
        try {
            const response = await fetch('portfolio.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.portfolioData = await response.json();
            this.filteredData = { ...this.portfolioData };
            this.lastUpdated = new Date();
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.addEventListener('click', () => this.toggleTheme());

        // Layout toggle
        const layoutToggle = document.getElementById('layout-toggle');
        layoutToggle.addEventListener('click', () => this.toggleLayout());

        // Search functionality
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        searchInput.addEventListener('focus', () => this.showSearchSuggestions());
        searchInput.addEventListener('blur', () => setTimeout(() => this.hideSearchSuggestions(), 200));

        // Filter tabs
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const filter = e.currentTarget.getAttribute('data-filter');
                this.applyFilter(filter);
                this.updateActiveFilter(e.currentTarget);
            });
        });

        // Sort functionality
        const sortSelect = document.getElementById('sort-select');
        sortSelect.addEventListener('change', (e) => this.applySort(e.target.value));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    toggleTheme() {
        // Note: Currently using dark theme only, but prepared for future light theme
        const themeToggle = document.getElementById('theme-toggle');
        const sunIcon = themeToggle.querySelector('.fa-sun');
        const moonIcon = themeToggle.querySelector('.fa-moon');
        
        if (this.currentTheme === 'dark') {
            this.currentTheme = 'light';
            sunIcon.style.opacity = '0';
            sunIcon.style.transform = 'rotate(180deg)';
            moonIcon.style.opacity = '1';
            moonIcon.style.transform = 'rotate(0deg)';
            // Future: Apply light theme styles
        } else {
            this.currentTheme = 'dark';
            sunIcon.style.opacity = '1';
            sunIcon.style.transform = 'rotate(0deg)';
            moonIcon.style.opacity = '0';
            moonIcon.style.transform = 'rotate(180deg)';
        }
    }

    toggleLayout() {
        const layoutToggle = document.getElementById('layout-toggle');
        const gridIcon = layoutToggle.querySelector('.fa-th-large');
        const listIcon = layoutToggle.querySelector('.fa-list');
        const portfolioGrid = document.getElementById('portfolio-grid');
        
        if (this.currentLayout === 'grid') {
            this.currentLayout = 'list';
            gridIcon.style.opacity = '0';
            gridIcon.style.transform = 'rotate(180deg)';
            listIcon.style.opacity = '1';
            listIcon.style.transform = 'rotate(0deg)';
            portfolioGrid.classList.add('list-layout');
        } else {
            this.currentLayout = 'grid';
            gridIcon.style.opacity = '1';
            gridIcon.style.transform = 'rotate(0deg)';
            listIcon.style.opacity = '0';
            listIcon.style.transform = 'rotate(180deg)';
            portfolioGrid.classList.remove('list-layout');
        }
    }

    handleSearch(value) {
        this.currentSearch = value.toLowerCase();
        this.applyFilters();
        this.updateSearchSuggestions(value);
    }

    initSearchSuggestions() {
        this.searchSuggestions = Object.keys(this.portfolioData).map(key => 
            this.formatPortfolioName(key)
        );
    }

    showSearchSuggestions() {
        const suggestionsContainer = document.getElementById('search-suggestions');
        if (this.currentSearch.length > 0) {
            const filtered = this.searchSuggestions.filter(suggestion => 
                suggestion.toLowerCase().includes(this.currentSearch)
            ).slice(0, 5);
            
            if (filtered.length > 0) {
                suggestionsContainer.innerHTML = filtered.map(suggestion => 
                    `<div class="suggestion-item" onclick="portfolioNexus.selectSuggestion('${suggestion}')">${suggestion}</div>`
                ).join('');
                suggestionsContainer.style.display = 'block';
            }
        }
    }

    hideSearchSuggestions() {
        const suggestionsContainer = document.getElementById('search-suggestions');
        suggestionsContainer.style.display = 'none';
    }

    selectSuggestion(suggestion) {
        const searchInput = document.getElementById('search-input');
        searchInput.value = suggestion;
        this.handleSearch(suggestion);
        this.hideSearchSuggestions();
    }

    updateSearchSuggestions(value) {
        if (value.length > 2) {
            this.showSearchSuggestions();
        } else {
            this.hideSearchSuggestions();
        }
    }

    applyFilter(filter) {
        this.currentFilter = filter;
        this.applyFilters();
    }

    updateActiveFilter(activeTab) {
        document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
        activeTab.classList.add('active');
    }

    applySort(sortValue) {
        this.currentSort = sortValue;
        this.renderPortfolios();
    }

    applyFilters() {
        let filtered = { ...this.portfolioData };

        // Apply rating filter
        if (this.currentFilter !== 'all') {
            const targetRating = parseInt(this.currentFilter);
            filtered = Object.fromEntries(
                Object.entries(filtered).filter(([key, value]) => 
                    parseInt(value.my_stars) === targetRating
                )
            );
        }

        // Apply search filter
        if (this.currentSearch) {
            filtered = Object.fromEntries(
                Object.entries(filtered).filter(([key, value]) => 
                    key.toLowerCase().includes(this.currentSearch) ||
                    this.formatPortfolioName(key).toLowerCase().includes(this.currentSearch) ||
                    this.getPortfolioDescription(key).toLowerCase().includes(this.currentSearch)
                )
            );
        }

        this.filteredData = filtered;
        this.renderPortfolios();
        this.updateFilterCounts();
    }

    updateFilterCounts() {
        const counts = {
            all: Object.keys(this.portfolioData).length,
            5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        };

        Object.values(this.portfolioData).forEach(portfolio => {
            const rating = parseInt(portfolio.my_stars);
            counts[rating]++;
        });

        Object.keys(counts).forEach(rating => {
            const countElement = document.getElementById(`count-${rating}`);
            if (countElement) {
                countElement.textContent = counts[rating];
            }
        });
    }

    renderPortfolios() {
        const grid = document.getElementById('portfolio-grid');
        const loading = document.getElementById('loading');
        const emptyState = document.getElementById('empty-state');
        
        // Hide loading indicator
        loading.classList.add('hidden');
        
        // Clear existing content
        grid.innerHTML = '';
        
        // Check if we have portfolios to show
        const portfolioCount = Object.keys(this.filteredData).length;
        
        if (portfolioCount === 0) {
            emptyState.classList.add('show');
            return;
        } else {
            emptyState.classList.remove('show');
        }
        
        // Convert object to array and sort
        const portfolioArray = Object.entries(this.filteredData).map(([key, value]) => ({
            key,
            name: this.formatPortfolioName(key),
            ...value
        }));

        // Apply sorting
        this.sortPortfolios(portfolioArray);

        portfolioArray.forEach((portfolio, index) => {
            const card = this.createPortfolioCard(portfolio, index);
            grid.appendChild(card);
        });

        // Animate cards
        this.animateCards();
    }

    sortPortfolios(portfolios) {
        portfolios.sort((a, b) => {
            switch (this.currentSort) {
                case 'rating-desc':
                    return parseInt(b.my_stars) - parseInt(a.my_stars) || a.name.localeCompare(b.name);
                case 'rating-asc':
                    return parseInt(a.my_stars) - parseInt(b.my_stars) || a.name.localeCompare(b.name);
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                default:
                    return 0;
            }
        });
    }

    createPortfolioCard(portfolio, index) {
        const card = document.createElement('div');
        card.className = 'portfolio-card';
        card.setAttribute('data-rating', portfolio.my_stars);
        card.style.animationDelay = `${index * 0.1}s`;

        const imageName = this.getImageName(portfolio.key);
        const description = this.getPortfolioDescription(portfolio.key);
        const stars = this.generateStars(parseInt(portfolio.my_stars));

        card.innerHTML = `
            <div class="card-image">
                <img src="Images/${imageName}" alt="${portfolio.name}" 
                     onerror="this.src='https://via.placeholder.com/400x240/1a1a2e/6c5ce7?text=Portfolio+Preview'"
                     loading="lazy">
                <div class="card-overlay">
                    ${portfolio.live_link ? `<a href="${portfolio.live_link}" class="overlay-btn" target="_blank" rel="noopener noreferrer">
                        <i class="fas fa-external-link-alt"></i> Live Demo
                    </a>` : ''}
                    ${portfolio.github_link ? `<a href="${portfolio.github_link}" class="overlay-btn" target="_blank" rel="noopener noreferrer">
                        <i class="fab fa-github"></i> Source Code
                    </a>` : ''}
                </div>
            </div>
            <div class="card-content">
                <h3 class="card-title">${portfolio.name}</h3>
                <p class="card-description">${description}</p>
                <div class="card-footer">
                    <div class="card-links">
                        ${portfolio.live_link ? `<a href="${portfolio.live_link}" class="card-link live" target="_blank" rel="noopener noreferrer">
                            <i class="fas fa-globe"></i> Live
                        </a>` : ''}
                        ${portfolio.github_link ? `<a href="${portfolio.github_link}" class="card-link github" target="_blank" rel="noopener noreferrer">
                            <i class="fab fa-github"></i> Code
                        </a>` : ''}
                    </div>
                    <div class="card-rating">
                        <span class="stars">${stars}</span>
                        <span class="rating-text">${portfolio.my_stars}/5</span>
                    </div>
                </div>
            </div>
        `;

        // Add click event for card interaction
        card.addEventListener('click', (e) => {
            if (!e.target.closest('a')) {
                this.handleCardClick(portfolio);
            }
        });

        return card;
    }

    handleCardClick(portfolio) {
        // Add subtle animation
        const card = event.currentTarget;
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);

        // Could add more interactions here like modal, analytics, etc.
    }

    formatPortfolioName(key) {
        return key.replace(/_/g, ' ').replace(/Portfolio$/, '').trim();
    }

    getImageName(key) {
        const imageMap = {
            'Monochromatic_2_Portfolio': 'Monochromatic_2.png',
            'Monochromatic_3_Portfolio': 'Monochromatic_3.png',
            'Monochromatic_1_Portfolio': 'Monochrome_1.png',
            'Diary_Portfolio': 'Diary.png',
            'Poster_2_Portfolio': 'poster_2.png',
            'Sketch_Portfolio': 'Sketch.png',
            'Data_Sketch_Portfolio': 'data_sketch.png',
            'Poster_1_Portfolio': 'Poster-1.png',
            'Old_Diary_Portfolio': 'old_diary.png',
            'Japan_Portfolio': 'Japan.png',
            'DataScientist_portfolio': 'Datascientist.png',
            'Notebook_Portfolio': 'Notebook.png',
            'Blueprint_portfolio': 'blueprint.png'
        };
        return imageMap[key] || 'placeholder.png';
    }

    getPortfolioDescription(key) {
        const descriptions = {
            'Monochromatic_2_Portfolio': 'Modern and clean design with sophisticated aesthetics and intuitive user experience.',
            'Monochromatic_3_Portfolio': 'Elegant minimalist approach showcasing the beauty of simplicity in design.',
            'Monochromatic_1_Portfolio': 'Classic professional design with timeless appeal and refined typography.',
            'Diary_Portfolio': 'Creative personal storytelling through design with emotional depth and artistic flair.',
            'Poster_2_Portfolio': 'Visual artistic showcase featuring stunning graphics and bold design elements.',
            'Sketch_Portfolio': 'Artistic creative expression through digital sketches and hand-drawn aesthetics.',
            'Data_Sketch_Portfolio': 'Innovative data-driven design concepts merging analytics with visual artistry.',
            'Poster_1_Portfolio': 'Modern visual presentation with bold elements and contemporary design language.',
            'Old_Diary_Portfolio': 'Vintage personal touch with nostalgic feel and authentic storytelling elements.',
            'Japan_Portfolio': 'Cultural themed design inspired by Japanese aesthetics and traditional elements.',
            'DataScientist_portfolio': 'Professional technical showcase designed specifically for data science professionals.',
            'Notebook_Portfolio': 'Simple clean interface with functional design and excellent user experience.',
            'Blueprint_portfolio': 'Technical blueprint-inspired design with architectural precision and engineering aesthetics.'
        };
        return descriptions[key] || 'A beautifully crafted portfolio design showcasing creativity, technical skills, and attention to detail.';
    }

    generateStars(rating) {
        const fullStars = '★'.repeat(rating);
        const emptyStars = '☆'.repeat(5 - rating);
        return fullStars + emptyStars;
    }

    updateStats() {
        const totalPortfolios = Object.keys(this.portfolioData).length;
        const ratings = Object.values(this.portfolioData).map(p => parseInt(p.my_stars));
        const avgRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);

        document.getElementById('total-portfolios').textContent = totalPortfolios;
        document.getElementById('avg-rating').textContent = avgRating;
        document.getElementById('live-updates').textContent = this.updateCount;
    }

    animateCards() {
        const cards = document.querySelectorAll('.portfolio-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }

    startAutoRefresh() {
        // Check for updates every 30 seconds
        this.autoRefreshInterval = setInterval(async () => {
            try {
                await this.checkForUpdates();
            } catch (error) {
                console.error('Error checking for updates:', error);
            }
        }, 30000);
    }

    async checkForUpdates() {
        try {
            const response = await fetch('portfolio.json?' + Date.now());
            if (!response.ok) return;
            
            const newData = await response.json();
            const currentDataString = JSON.stringify(this.portfolioData);
            const newDataString = JSON.stringify(newData);
            
            if (currentDataString !== newDataString) {
                console.log('Portfolio data updated! Refreshing...');
                this.portfolioData = newData;
                this.updateCount++;
                this.applyFilters();
                this.updateStats();
                this.updateFilterCounts();
                this.updateLastUpdatedTime();
                this.initSearchSuggestions();
                this.showNotification('Auto-Update', 'Portfolio data updated successfully!', 'success');
            }
        } catch (error) {
            console.error('Error checking for updates:', error);
        }
    }

    updateLastUpdatedTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        document.getElementById('last-updated-time').textContent = timeString;
    }

    showNotification(title, message, type = 'info') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="${iconMap[type] || iconMap.info}"></i>
                </div>
                <div class="notification-text">
                    <div class="notification-title">${title}</div>
                    <div class="notification-message">${message}</div>
                </div>
            </div>
        `;

        container.appendChild(notification);

        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('search-input').focus();
        }

        // Escape to clear search
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('search-input');
            if (searchInput === document.activeElement) {
                searchInput.blur();
            }
            if (this.currentSearch) {
                searchInput.value = '';
                this.handleSearch('');
            }
        }

        // Number keys for filters
        if (e.key >= '1' && e.key <= '5' && !e.ctrlKey && !e.metaKey) {
            const filterTab = document.querySelector(`[data-filter="${e.key}"]`);
            if (filterTab) {
                filterTab.click();
            }
        }

        // 'A' key for all filter
        if (e.key.toLowerCase() === 'a' && !e.ctrlKey && !e.metaKey) {
            const allTab = document.querySelector('[data-filter="all"]');
            if (allTab && document.activeElement.tagName !== 'INPUT') {
                allTab.click();
            }
        }
    }

    handleResize() {
        // Handle responsive adjustments if needed
        // Could optimize grid layout, adjust card sizes, etc.
    }

    showError(message) {
        const grid = document.getElementById('portfolio-grid');
        const loading = document.getElementById('loading');
        
        loading.classList.add('hidden');
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: var(--spacing-3xl); color: var(--text-secondary);">
                <div style="width: 80px; height: 80px; background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: var(--accent-tertiary); margin: 0 auto var(--spacing-lg);">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 style="color: var(--text-primary); margin-bottom: var(--spacing-sm);">${message}</h3>
                <p style="margin-bottom: var(--spacing-lg);">Please check your internet connection and try again.</p>
                <button onclick="location.reload()" style="padding: var(--spacing-md) var(--spacing-xl); background: var(--gradient-primary); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 500; transition: var(--transition-medium);">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioNexus = new PortfolioNexus();
});

// Add dynamic CSS for list layout
const additionalStyles = `
.portfolio-grid.list-layout {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
}

.portfolio-grid.list-layout .portfolio-card {
    display: grid;
    grid-template-columns: 300px 1fr;
    height: 200px;
}

.portfolio-grid.list-layout .card-image {
    height: 100%;
}

.portfolio-grid.list-layout .card-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.suggestion-item {
    padding: var(--spacing-sm) var(--spacing-lg);
    cursor: pointer;
    transition: var(--transition-fast);
    border-bottom: 1px solid var(--border-color);
}

.suggestion-item:hover {
    background: var(--hover-color);
}

.suggestion-item:last-child {
    border-bottom: none;
}

@media (max-width: 768px) {
    .portfolio-grid.list-layout .portfolio-card {
        grid-template-columns: 1fr;
        height: auto;
    }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet); 