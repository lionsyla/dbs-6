# Dardan's Barbershop - PWA Installation Guide

This app is now a **Progressive Web App (PWA)** - much simpler than a native iOS app!

## ✅ Benefits

- **No App Store needed** - Install directly from Safari
- **Looks & feels native** - Full screen, home screen icon
- **Instant updates** - Changes go live immediately
- **Works on all devices** - iOS, Android, desktop

## 📱 How to Install on iPhone/iPad

1. **Deploy your app** to a hosting service:
   - Vercel (recommended): `npm install -g vercel && vercel`
   - Netlify: Drag the `dist` folder after running `npm run build`
   - Any static hosting

2. **Open Safari** on your iPhone/iPad

3. **Visit your deployed URL** (e.g., `https://dardans-barbershop.vercel.app`)

4. **Tap the Share button** (square with arrow pointing up)

5. **Scroll down and tap "Add to Home Screen"**

6. **Tap "Add"** in the top right

7. **Done!** The app icon appears on your home screen like a native app

## 🚀 Quick Deploy to Vercel (Free)

```bash
# Install Vercel CLI
npm install -g vercel

# Build the app
npm run build

# Deploy (follow prompts)
vercel

# Or deploy to production immediately
vercel --prod
```

## 🎨 Features

- ✅ Full screen mode (no browser bars)
- ✅ Custom app icon on home screen
- ✅ Offline support (basic)
- ✅ Native iOS status bar styling
- ✅ Splash screen support
- ✅ All booking functionality works perfectly

## 🔧 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Notes

- **HTTPS required** - PWAs only work on HTTPS (Vercel/Netlify provide this automatically)
- **iOS 16.4+** has full PWA support (most iPhones from 2020+)
- **No Xcode needed!**
- **No App Store approval process!**
