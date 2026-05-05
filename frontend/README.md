# Braj Accounting - Spatial Ledger Matrix

Braj Accounting is an enterprise-grade, 3D-immersive accounting platform designed to redefine financial visualization. Built with Next.js 16, React Three Fiber, and a high-performance spatial UI, it offers a professional-grade alternative to traditional accounting software.

## Core Pillars
- **Spatial UI**: Immersive 3D data visualizations and physics-based interactions.
- **Precision Ledger**: Real-time double-entry accounting with statutory compliance.
- **Multi-Tenant Architecture**: Robust company-wise data isolation and role-based access.
- **Keyboard-First**: Optimized for professional accounting workflows with deep hotkey support.

## Getting Started

### 1. Environment Configuration
Create a `.env.local` file based on `.env.example`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 2. Development Execution
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the forge.

## Deployment

This project is optimized for **Vercel**. Please refer to the [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md) for detailed instructions on root directory settings and environment variables.

## Tech Stack
- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS 4.
- **Graphics**: React Three Fiber, Three.js, Framer Motion.
- **State**: Zustand (Persistence), TanStack Query.
- **Icons**: Lucide React.
