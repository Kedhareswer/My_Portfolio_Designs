// DOM Elements
const portfolioGrid = document.getElementById('portfolio-grid');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const sortSelect = document.getElementById('sort-select');
const portfolioModal = document.getElementById('portfolio-modal');
const ratingModal = document.getElementById('rating-modal');
const closeModalBtns = document.querySelectorAll('.close-modal');

// Portfolio Data
let portfolioData = [];
let currentPortfolioData = [];
let currentPortfolioId = null;

// Initialize the app
async function init() {
    try {
        // Load portfolio data from JSON file
        const response = await fetch('portfolio-data.json');
        const data = await response.json();
        portfolioData = data.portfolios;
        currentPortfolioData = [...portfolioData];
        
        renderPortfolioItems(currentPortfolioData);
        setupEventListeners();
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        renderErrorState('Failed to load portfolio data. Please try again later.');
    }
}

// Render portfolio items
function renderPortfolioItems(items) {
    portfolioGrid.innerHTML = '';
    
    if (items.length === 0) {
        renderEmptyState();
        return;
    }
    
    items.forEach(item => {
        const portfolioItem = createPortfolioItem(item);
        portfolioGrid.appendChild(portfolioItem);
    });
}

// Create a portfolio item element
function createPortfolioItem(item) {
    const portfolioItem = document.createElement('div');
    portfolioItem.className = 'portfolio-item';
    portfolioItem.dataset.id = item.id;
    
    portfolioItem.innerHTML = `
        <div class="portfolio-preview">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='images/placeholder.svg'">
            <div class="portfolio-overlay">
                <span class="view-btn">View Details</span>
            </div>
        </div>
        <div class="portfolio-info">
            <h3>${item.name}</h3>
            <div class="rating">
                <div>
                    <div class="stars">${renderStars(item.myStars)}</div>
                    <div class="rating-label">My Rating</div>
                </div>
                <div>
                    <div class="stars">${renderStars(item.userStars)}</div>
                    <div class="rating-label">User Rating (${item.userCount})</div>
                </div>
            </div>
            <button class="rate-this" data-id="${item.id}">Rate This Design</button>
        </div>
    `;
    
    return portfolioItem;
}

// Render empty state
function renderEmptyState() {
    portfolioGrid.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-search"></i>
            <h3>No portfolios found</h3>
            <p>Try adjusting your search or filter criteria</p>
        </div>
    `;
}

// Render error state
function renderErrorState(message) {
    portfolioGrid.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-circle"></i>
            <h3>Error</h3>
            <p>${message}</p>
        </div>
    `;
}

// Render stars based on rating
function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    // Half star
    if (halfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', e => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Sort functionality
    sortSelect.addEventListener('change', handleSort);
    
    // Portfolio item click
    portfolioGrid.addEventListener('click', handlePortfolioItemClick);
    
    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', e => {
        if (e.target === portfolioModal) {
            closeAllModals();
        }
        if (e.target === ratingModal) {
            closeAllModals();
        }
    });
    
    // Rating stars interaction
    const ratingStarsInput = document.getElementById('rating-stars-input');
    const ratingStars = ratingStarsInput.querySelectorAll('i');
    
    ratingStars.forEach(star => {
        star.addEventListener('click', () => {
            const value = parseInt(star.dataset.value);
            updateRatingStars(value);
        });
    });
    
    // Submit rating
    const submitRatingBtn = document.getElementById('submit-rating');
    submitRatingBtn.addEventListener('click', handleSubmitRating);
}

// Handle search
function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm === '') {
        currentPortfolioData = [...portfolioData];
    } else {
        currentPortfolioData = portfolioData.filter(item => 
            item.name.toLowerCase().includes(searchTerm)
        );
    }
    
    renderPortfolioItems(currentPortfolioData);
}

// Handle sort
function handleSort() {
    const sortValue = sortSelect.value;
    
    switch(sortValue) {
        case 'name-asc':
            currentPortfolioData.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            currentPortfolioData.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'my-stars-desc':
            currentPortfolioData.sort((a, b) => b.myStars - a.myStars);
            break;
        case 'my-stars-asc':
            currentPortfolioData.sort((a, b) => a.myStars - b.myStars);
            break;
        case 'user-stars-desc':
            currentPortfolioData.sort((a, b) => b.userStars - a.userStars);
            break;
        case 'user-stars-asc':
            currentPortfolioData.sort((a, b) => a.userStars - b.userStars);
            break;
    }
    
    renderPortfolioItems(currentPortfolioData);
}

// Handle portfolio item click
function handlePortfolioItemClick(e) {
    const portfolioItem = e.target.closest('.portfolio-item');
    const rateBtn = e.target.closest('.rate-this');
    
    if (rateBtn) {
        const portfolioId = parseInt(rateBtn.dataset.id);
        openRatingModal(portfolioId);
        return;
    }
    
    if (portfolioItem) {
        const portfolioId = parseInt(portfolioItem.dataset.id);
        openPortfolioModal(portfolioId);
    }
}

// Open portfolio modal
function openPortfolioModal(id) {
    const portfolio = portfolioData.find(item => item.id === id);
    
    if (!portfolio) return;
    
    // Set modal content
    document.getElementById('modal-title').textContent = portfolio.name;
    document.getElementById('modal-image').src = portfolio.image;
    document.getElementById('modal-image').alt = portfolio.name;
    document.getElementById('modal-my-stars').innerHTML = renderStars(portfolio.myStars);
    document.getElementById('modal-user-stars').innerHTML = renderStars(portfolio.userStars);
    document.getElementById('modal-user-count').textContent = `${portfolio.userCount} ratings`;
    document.getElementById('modal-comments').textContent = portfolio.comments;
    document.getElementById('modal-link').href = portfolio.link;
    
    // Show modal
    portfolioModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Open rating modal
function openRatingModal(id) {
    currentPortfolioId = id;
    ratingModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Reset rating stars
    updateRatingStars(0);
}

// Close all modals
function closeAllModals() {
    portfolioModal.classList.remove('show');
    ratingModal.classList.remove('show');
    document.body.style.overflow = 'auto';
    currentPortfolioId = null;
}

// Update rating stars in the rating modal
function updateRatingStars(value) {
    const stars = document.querySelectorAll('#rating-stars-input i');
    
    stars.forEach(star => {
        const starValue = parseInt(star.dataset.value);
        
        if (starValue <= value) {
            star.className = 'fas fa-star active';
        } else {
            star.className = 'far fa-star';
        }
    });
}

// Handle submit rating
function handleSubmitRating() {
    if (!currentPortfolioId) return;
    
    const stars = document.querySelectorAll('#rating-stars-input i.active');
    const rating = stars.length;
    
    if (rating === 0) {
        alert('Please select a rating');
        return;
    }
    
    // In a real application, you would send this rating to a server
    // For this demo, we'll just update the local data
    const portfolio = portfolioData.find(item => item.id === currentPortfolioId);
    
    if (portfolio) {
        // Update user rating (weighted average)
        const totalRatings = portfolio.userCount;
        const newTotalRatings = totalRatings + 1;
        const newUserStars = ((portfolio.userStars * totalRatings) + rating) / newTotalRatings;
        
        portfolio.userStars = parseFloat(newUserStars.toFixed(1));
        portfolio.userCount = newTotalRatings;
        
        // Save updated data to localStorage
        savePortfolioData();
        
        // Update the UI
        renderPortfolioItems(currentPortfolioData);
        
        // Show success message
        alert('Thank you for your rating!');
        
        // Close modal
        closeAllModals();
    }
}

// Save portfolio data to localStorage
function savePortfolioData() {
    try {
        localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
    } catch (error) {
        console.error('Error saving portfolio data:', error);
    }
}

// Load portfolio data from localStorage
function loadPortfolioDataFromStorage() {
    try {
        const storedData = localStorage.getItem('portfolioData');
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (error) {
        console.error('Error loading portfolio data from storage:', error);
    }
    return null;
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Try to load data from localStorage first
    const storedData = loadPortfolioDataFromStorage();
    if (storedData) {
        portfolioData = storedData;
        currentPortfolioData = [...portfolioData];
        renderPortfolioItems(currentPortfolioData);
        setupEventListeners();
    } else {
        // If no stored data, load from JSON file
        init();
    }
});