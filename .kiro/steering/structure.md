# Project Structure

## Root Files
- **index.html**: Main HTML entry point with semantic structure
- **styles.css**: Complete CSS styling with CSS custom properties and component styles
- **script.js**: Main JavaScript application logic in PortfolioNexus class
- **portfolio.json**: Portfolio data source with project metadata (ratings, links)
- **package.json**: Node.js project configuration and scripts
- **README.md**: Comprehensive project documentation

## Folders
- **Images/**: Portfolio preview images (PNG format)
  - Naming convention: `{project_name}.png` (e.g., `Monochromatic_2.png`)
  - Used for portfolio card previews and README documentation
- **.git/**: Git version control
- **.github/**: GitHub-specific configuration
- **.kiro/**: Kiro AI assistant configuration and steering rules
- **node_modules/**: npm dependencies (dev only)

## Code Organization

### HTML Structure
- Semantic HTML5 elements (`<nav>`, `<main>`, `<section>`, `<footer>`)
- BEM-like class naming convention
- Accessibility-focused markup

### CSS Architecture
- CSS Custom Properties for theming (`:root` variables)
- Component-based organization within single file
- Mobile-first responsive design
- Glassmorphism and modern visual effects

### JavaScript Structure
- Single class `PortfolioNexus` containing all application logic
- Methods organized by functionality (rendering, filtering, searching, etc.)
- Event-driven architecture with centralized event listeners
- Async data loading and error handling

## Data Flow
1. **portfolio.json** → JavaScript fetch → DOM rendering
2. User interactions → Event handlers → State updates → Re-rendering
3. Auto-refresh timer → Data reload → UI updates

## Naming Conventions
- **Files**: kebab-case (e.g., `portfolio.json`)
- **CSS Classes**: kebab-case with component prefixes (e.g., `.portfolio-card`)
- **JavaScript**: camelCase for variables/methods, PascalCase for classes
- **Images**: PascalCase matching portfolio names (e.g., `Monochromatic_2.png`)