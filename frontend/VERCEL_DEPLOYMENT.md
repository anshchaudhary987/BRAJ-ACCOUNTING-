# Vercel Deployment Guide - Braj Accounting

This document outlines the steps to deploy the Braj Accounting frontend to Vercel.

## 1. Prerequisites
- Access to the GitHub repository.
- A Vercel account.
- The backend API URL (production).

## 2. Vercel Project Setup
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** > **Project**.
3. Import the repository containing the `masterpiece` folder.
4. **Project Configuration**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend` (Important!)
5. **Environment Variables**:
   - Add `NEXT_PUBLIC_API_URL`: The full URL to your production backend API (e.g., `https://api.yourdomain.com/api`).
6. Click **Deploy**.

## 3. Post-Deployment Verification
- Ensure the landing page loads correctly.
- Test the login flow (requires backend to be up).
- Verify that 3D visualizations (Matka models) render correctly.

## 4. Troubleshooting
- **Build Fails**: Check the build logs in Vercel. Ensure `npm run build` works locally.
- **API Errors**: Verify that `NEXT_PUBLIC_API_URL` is correct and the backend server allows CORS from your Vercel domain.
- **Hydration Errors**: Ensure any 3D components or browser-only features are wrapped in `useEffect` or use the `'use client'` directive.
