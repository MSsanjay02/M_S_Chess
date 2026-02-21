# Deployment Guide

## Frontend Deployment (Vercel)

### Step 1: Prepare Your Repository
1. Make sure all your code is committed and pushed to GitHub

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Set Environment Variables
1. In your Vercel project settings, go to "Environment Variables"
2. Add the following variable:
   - **Key**: `VITE_SOCKET_URL`
   - **Value**: Your Render backend URL (e.g., `https://your-app.onrender.com`)
   - **Environment**: Production, Preview, Development

### Step 4: Deploy
1. Click "Deploy"
2. Wait for the build to complete
3. Your frontend will be live!

---

## Backend Deployment (Render)

### Step 1: Prepare Your Repository
1. Make sure all your code is committed and pushed to GitHub

### Step 2: Deploy to Render
1. Go to [render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `ms-chess-backend` (or your preferred name)
   - **Environment**: Node
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Step 3: Set Environment Variables
1. In your Render service settings, go to "Environment"
2. Add the following variables:
   - **NODE_ENV**: `production`
   - **PORT**: `5000` (or leave empty for Render to assign)

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for the build to complete
3. Copy your service URL (e.g., `https://ms-chess-backend.onrender.com`)

### Step 5: Update Frontend Environment Variable
1. Go back to Vercel
2. Update the `VITE_SOCKET_URL` environment variable with your Render backend URL
3. Redeploy the frontend

---

## Important Notes

### CORS Configuration
The backend is already configured to accept requests from any origin. If you want to restrict it:
- Update `backend/src/server.ts` to only allow your Vercel domain

### Socket.io Configuration
- Make sure your Render backend URL is accessible
- The frontend will automatically connect to the backend using the `VITE_SOCKET_URL` environment variable

### Testing Locally Before Deployment
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Test all features
4. Make sure everything works before deploying

### Troubleshooting

**Frontend can't connect to backend:**
- Check that `VITE_SOCKET_URL` is set correctly in Vercel
- Make sure the backend is running and accessible
- Check browser console for connection errors

**Backend not starting:**
- Check Render logs for errors
- Make sure `npm run build` completes successfully
- Verify all dependencies are in `package.json`

**CORS errors:**
- Update backend CORS settings to include your Vercel domain
- Check that Socket.io CORS is configured correctly

---

## Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed to Render
- [ ] Backend URL copied
- [ ] Frontend deployed to Vercel
- [ ] `VITE_SOCKET_URL` set in Vercel
- [ ] Both services are running
- [ ] Tested end-to-end functionality
