# QR Code Generator & Scanner - Frontend Deployment Guide

## Prerequisites
- Node.js 14.x or higher
- npm or yarn
- Access to your hosting platform (Vercel, Netlify, AWS, etc.)

## Environment Setup

1. Before deployment, update the production environment variables in `.env.production`:

```
VITE_API_URL=https://your-backend-api-url.com
```

Replace `your-backend-api-url.com` with the actual URL where your backend will be deployed.

## Build for Production

1. Install dependencies:
```
npm install
```

2. Build the project:
```
npm run build
```

This will create a `dist` folder with optimized production files.

## Deployment Options

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
```
npm install -g vercel
```

2. Deploy:
```
vercel
```

3. Follow the prompts to configure your deployment.

### Option 2: Netlify

1. Install Netlify CLI:
```
npm install -g netlify-cli
```

2. Deploy:
```
netlify deploy
```

3. Follow the prompts and specify `dist` as your publish directory.

### Option 3: Manual Deployment

Upload the contents of the `dist` folder to your web server or hosting provider.

## Post-Deployment Verification

1. Test the QR code generation functionality
2. Test the QR code scanning functionality 
3. Verify that both components can communicate with the backend API
4. Check that the application is responsive on different devices

## Troubleshooting

- If you see API connection errors, verify that your `.env.production` file has the correct backend URL
- If styles appear broken, ensure that the build process completed successfully
- Check browser console for any JavaScript errors 