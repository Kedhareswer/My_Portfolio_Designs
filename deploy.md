# Portfolio Showcase Deployment Guide

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies (optional)
npm install

# Start local server
npm run dev
# or
npm start

# Open http://localhost:8080 in your browser
```

## 📦 Deployment Options

### 1. GitHub Pages (Recommended)
1. Push your code to a GitHub repository
2. Go to repository Settings → Pages
3. Select source: Deploy from a branch
4. Choose `main` branch and `/ (root)` folder
5. Your site will be available at `https://yourusername.github.io/repository-name`

**Auto-update setup:**
- Any changes to `portfolio.json` will automatically update the live site
- The JavaScript checks for updates every 30 seconds
- No additional setup needed!

### 2. Netlify
1. Connect your GitHub repository to Netlify
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `./`
3. Deploy!

**Auto-update setup:**
- Netlify automatically rebuilds when you push changes
- The site will update automatically when you modify `portfolio.json`

### 3. Vercel
1. Import your project from GitHub
2. No build configuration needed
3. Deploy!

**Auto-update setup:**
- Vercel automatically redeploys on git push
- Updates happen in real-time

### 4. Static Web Hosting
Upload these files to any static web hosting service:
- `index.html`
- `styles.css`
- `script.js`
- `portfolio.json`
- `Images/` folder

## 🔄 How Auto-Updates Work

The website automatically checks for updates to `portfolio.json` every 30 seconds:

1. **Fetch Latest Data**: JavaScript fetches the latest `portfolio.json`
2. **Compare**: Compares with current data
3. **Update UI**: If changes detected, updates the interface
4. **Notify User**: Shows a subtle notification about the update

## 📝 Adding New Portfolios

1. **Add Image**: Place your portfolio image in the `Images/` folder
2. **Update JSON**: Add your portfolio data to `portfolio.json`:
   ```json
   {
     "Your_New_Portfolio": {
       "github_link": "https://github.com/yourusername/your-portfolio",
       "live_link": "https://your-portfolio.com",
       "my_stars": "5"
     }
   }
   ```
3. **Update Image Mapping**: Edit `script.js` to map your portfolio key to the image filename in the `getImageName()` function
4. **Save & Deploy**: The website will automatically update!

## 🎨 Customization

### Colors
Edit `styles.css` to change the color scheme:
```css
body {
    background: linear-gradient(135deg, #your-color1 0%, #your-color2 100%);
}
```

### Descriptions
Edit the `getPortfolioDescription()` function in `script.js` to customize portfolio descriptions.

### Auto-refresh Interval
Change the update check interval in `script.js`:
```javascript
// Check every 60 seconds instead of 30
this.autoRefreshInterval = setInterval(async () => {
    // ... 
}, 60000);
```

## 🛠️ File Structure
```
portfolio-showcase/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
├── portfolio.json      # Portfolio data (auto-updates)
├── package.json        # Project configuration
├── deploy.md           # This file
└── Images/            # Portfolio images
    ├── Monochromatic_2.png
    ├── Diary.png
    └── ...
```

## 🔧 Troubleshooting

### CORS Issues (Local Development)
If you encounter CORS errors when running locally:
1. Use `npm start` instead of opening the HTML file directly
2. Or use a local server like Live Server extension in VS Code

### Images Not Loading
1. Check image filenames match exactly (case-sensitive)
2. Ensure images are in the `Images/` folder
3. Update the `getImageName()` function mapping

### Auto-updates Not Working
1. Check browser console for errors
2. Ensure `portfolio.json` is accessible
3. Verify the JSON syntax is valid

## 📱 Mobile Responsiveness
The website is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🎯 Features
- ✅ Automatic data updates
- ✅ Search functionality
- ✅ Filter by rating
- ✅ Responsive design
- ✅ Beautiful animations
- ✅ Social media links
- ✅ Error handling
- ✅ Loading states
- ✅ Keyboard shortcuts (Ctrl+K to search)

## 📈 Performance
- Lightweight (< 100KB total)
- Fast loading times
- Efficient update checking
- Optimized images
- Minimal dependencies

Enjoy your beautiful portfolio showcase! 🎨✨ 