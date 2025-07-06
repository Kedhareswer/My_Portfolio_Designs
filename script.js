// Portfolio Showcase JavaScript
class PortfolioShowcase {
    constructor() {
        this.portfolioData = {};
        this.filteredData = {};
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.lastUpdated = null;
        this.autoRefreshInterval = null;
        
        this.init();
    }

    async init() {
        try {
            await this.loadPortfolioData();
            this.renderPortfolios();
            this.setupEventListeners();
            this.updateStats();
            this.startAutoRefresh();
            this.updateLastUpdatedTime();
        } catch (error) {
            console.error('Error initializing portfolio showcase:', error);
            this.showError('Failed to load portfolio data. Please try again later.');
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

    renderPortfolios() {
        const grid = document.getElementById('portfolio-grid');
        const loading = document.getElementById('loading');
        
        // Hide loading indicator
        loading.classList.add('hidden');
        
        // Clear existing content
        grid.innerHTML = '';
        
        // Convert object to array and sort by rating (desc) then by name
        const portfolioArray = Object.entries(this.filteredData).map(([key, value]) => ({
            key,
            name: this.formatPortfolioName(key),
            ...value
        })).sort((a, b) => {
            const ratingDiff = parseInt(b.my_stars) - parseInt(a.my_stars);
            return ratingDiff !== 0 ? ratingDiff : a.name.localeCompare(b.name);
        });

        portfolioArray.forEach((portfolio, index) => {
            const card = this.createPortfolioCard(portfolio, index);
            grid.appendChild(card);
        });

        // Animate cards
        this.animateCards();
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
                     onerror="this.src='https://via.placeholder.com/400x200?text=Portfolio+Image'">
                <div class="card-overlay">
                    ${portfolio.live_link ? `<a href="${portfolio.live_link}" class="overlay-btn" target="_blank" rel="noopener noreferrer">
                        <i class="fas fa-external-link-alt"></i> Live Demo
                    </a>` : ''}
                    ${portfolio.github_link ? `<a href="${portfolio.github_link}" class="overlay-btn" target="_blank" rel="noopener noreferrer">
                        <i class="fab fa-github"></i> GitHub
                    </a>` : ''}
                </div>
            </div>
            <div class="card-content">
                <h3 class="card-title">${portfolio.name}</h3>
                <p class="card-description">${description}</p>
                <div class="card-footer">
                    <div class="card-links">
                        ${portfolio.live_link ? `<a href="${portfolio.live_link}" class="card-link live" target="_blank" rel="noopener noreferrer">
                            <i class="fas fa-external-link-alt"></i> Live
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

        return card;
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
            'Notebook_Portfolio': 'Notebook.png'
        };
        return imageMap[key] || 'placeholder.png';
    }

    getPortfolioDescription(key) {
        const descriptions = {
            'Monochromatic_2_Portfolio': 'Modern, Clean Design with sophisticated aesthetics',
            'Monochromatic_3_Portfolio': 'Elegant, Minimalist approach to portfolio presentation',
            'Monochromatic_1_Portfolio': 'Classic, Professional design with timeless appeal',
            'Diary_Portfolio': 'Creative, Personal storytelling through design',
            'Poster_2_Portfolio': 'Visual, Artistic showcase with stunning graphics',
            'Sketch_Portfolio': 'Artistic, Creative expression through sketches',
            'Data_Sketch_Portfolio': 'Innovative, Data-Driven design concepts',
            'Poster_1_Portfolio': 'Modern, Visual presentation with bold elements',
            'Old_Diary_Portfolio': 'Vintage, Personal touch with nostalgic feel',
            'Japan_Portfolio': 'Cultural, Themed design inspired by Japanese aesthetics',
            'DataScientist_portfolio': 'Professional, Technical showcase for data science',
            'Notebook_Portfolio': 'Simple, Clean interface with functional design'
        };
        return descriptions[key] || 'A beautiful portfolio design showcasing creativity and technical skills';
    }

    generateStars(rating) {
        const fullStars = '★'.repeat(rating);
        const emptyStars = '☆'.repeat(5 - rating);
        return fullStars + emptyStars;
    }

    setupEventListeners() {
        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.applyFilter(filter);
                
                // Update active button
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Search input
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => {
            this.currentSearch = e.target.value.toLowerCase();
            this.applyFilters();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }

    applyFilter(filter) {
        this.currentFilter = filter;
        this.applyFilters();
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
                    this.formatPortfolioName(key).toLowerCase().includes(this.currentSearch)
                )
            );
        }

        this.filteredData = filtered;
        this.renderPortfolios();
    }

    updateStats() {
        const totalPortfolios = Object.keys(this.portfolioData).length;
        const ratings = Object.values(this.portfolioData).map(p => parseInt(p.my_stars));
        const avgRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);

        document.getElementById('total-portfolios').textContent = totalPortfolios;
        document.getElementById('avg-rating').textContent = avgRating;
    }

    animateCards() {
        const cards = document.querySelectorAll('.portfolio-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.animationDelay = `${index * 0.1}s`;
            }, index * 50);
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
                this.applyFilters();
                this.updateStats();
                this.updateLastUpdatedTime();
                this.showUpdateNotification();
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

    showUpdateNotification() {
        // Create and show a subtle notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.innerHTML = `
            <i class="fas fa-sync-alt"></i>
            Portfolio updated automatically!
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showError(message) {
        const grid = document.getElementById('portfolio-grid');
        const loading = document.getElementById('loading');
        
        loading.classList.add('hidden');
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #fff;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px; color: #ff6b6b;"></i>
                <h3 style="margin-bottom: 10px;">${message}</h3>
                <p style="opacity: 0.8;">Please check your internet connection and try again.</p>
                <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Retry
                </button>
            </div>
        `;
    }
}

// Initialize the portfolio showcase when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioShowcase();
});

// Add some additional CSS for the notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style); 