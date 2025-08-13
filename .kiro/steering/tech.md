# Technology Stack

## Frontend Stack
- **HTML5**: Semantic markup with modern web standards
- **CSS3**: Advanced styling with CSS Grid, Flexbox, and CSS Custom Properties
- **Vanilla JavaScript (ES6+)**: Modern JavaScript features, no frameworks
- **Font Awesome 6.4.0**: Icon library for UI elements
- **Google Fonts**: Inter and Space Grotesk font families

## Build System
- **Static Site**: No build process required - runs directly in browser
- **http-server**: Development server for local testing
- **No bundling**: Direct file serving for simplicity

## Development Tools
- **Node.js**: For development server only
- **npm**: Package management for dev dependencies

## Common Commands

```bash
# Start development server
npm start
# or
npm run dev

# Install dependencies
npm install

# No build step needed
npm run build  # Just echoes "Static site - no build needed"
```

## Architecture Patterns
- **Class-based JavaScript**: Main application logic in `PortfolioNexus` class
- **Event-driven**: DOM event listeners for user interactions
- **Async/Await**: Modern promise handling for data fetching
- **CSS Custom Properties**: Dynamic theming system
- **Modular CSS**: Component-based styling approach

## Performance Optimizations
- **Lazy loading**: Efficient rendering of portfolio cards
- **Hardware acceleration**: CSS transforms for smooth animations
- **Debounced search**: Optimized search input handling
- **Memory efficient**: Optimized DOM manipulation