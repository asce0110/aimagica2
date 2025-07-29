# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIMAGICA is a Next.js-based AI art generation platform that specializes in image-to-image transformation. Users can upload sketches/photos and transform them into artwork using various AI models and artistic styles.

## Key Development Commands

### Development
```bash
npm run dev                    # Start development server
npm run build                  # Production build (Vercel)
npm run build:static          # Static build for Cloudflare Pages
npm run build:pages           # Build for Cloudflare Pages deployment
npm run lint                   # Run ESLint
npm run clean                  # Clean build artifacts and cache
```

### Deployment & Testing
```bash
npm run deploy:vercel         # Deploy to Vercel
npm run deploy:pages          # Deploy to Cloudflare Pages
npm run deploy:cloudflare     # Deploy both Workers and Pages
npm run preview:pages         # Preview Pages build locally
npm run verify:vercel         # Verify Vercel deployment
npm run verify:cloudflare     # Verify Cloudflare deployment
```

### Utility Scripts
```bash
npm run download-gallery-images    # Download gallery images
npm run cache-hero-images          # Cache hero section images
```

## Architecture Overview

### Core Framework
- **Next.js 14** with App Router architecture
- **React 18** with client/server components
- **TypeScript** for type safety
- **Tailwind CSS** for styling with custom design system

### Authentication & Database
- **Supabase** for authentication, database, and file storage
- **NextAuth.js** integration for Google OAuth
- **Row Level Security (RLS)** policies implemented
- **Database migrations** in `/migrations` directory

### UI Components
- **Radix UI** components as foundation
- **Custom UI library** in `/components/ui`
- **shadcn/ui** design patterns
- **Framer Motion** for animations
- **Responsive design** with mobile-first approach

### Key Features Architecture

#### Image Generation Pipeline
1. **Upload Interface** (`/components/generation-interface.tsx`)
2. **API Processing** (`/app/api/generate/image/route.ts`)
3. **Progress Tracking** with real-time streaming
4. **Result Display** with download/sharing options

#### Multi-Platform Deployment
- **Vercel**: Primary hosting with edge functions
- **Cloudflare Pages**: Static site generation
- **Cloudflare Workers**: API endpoints and image processing

### State Management
- **Zustand** for global state
- **React Context** for session management
- **Custom hooks** for reusable logic (`/hooks` directory)

### File Organization

#### Core Directories
- `/app` - Next.js App Router pages and API routes
- `/components` - Reusable React components
- `/lib` - Utility functions and configurations
- `/hooks` - Custom React hooks
- `/types` - TypeScript type definitions
- `/public` - Static assets and images

#### Key Configuration Files
- `next.config.vercel.mjs` - Vercel-specific configuration
- `next.config.static.mjs` - Static build configuration
- `middleware.ts` - Supabase auth middleware
- `tailwind.config.ts` - Tailwind CSS configuration

## Important Implementation Details

### Environment Variables
The project requires multiple environment configurations:
- Supabase credentials for database/auth
- API keys for AI image generation services
- Cloudflare R2 storage configuration
- Google OAuth credentials

### Image Processing
- Supports multiple AI models (KIE-Flux, Stable Diffusion variants)
- Real-time progress streaming during generation
- Image compression and optimization
- R2 cloud storage for generated images

### Database Schema
Key tables include:
- `users` - User profiles and subscription data
- `generated_images` - Image generation records
- `user_subscriptions` - Payment/subscription management
- `image_likes` - User favorites system

### Security Considerations
- Row Level Security (RLS) enabled on Supabase
- API rate limiting and user validation
- Secure file upload handling
- Content policy enforcement

## Development Guidelines

### When Adding New Features
1. Update database schema via migrations in `/migrations`
2. Add TypeScript types in `/lib/supabase.ts`
3. Create API routes following existing patterns
4. Implement UI components with responsive design
5. Test across multiple deployment targets

### Styling Conventions
- Use Tailwind utility classes primarily
- Custom fonts: Fredoka One, Orbitron, Space Grotesk, Exo 2
- Color scheme: Earthy tones (#2d3e2d, #8b7355, #d4a574, #f5f1e8)
- Component variants using `class-variance-authority`

### API Development
- Follow REST conventions in `/app/api` routes
- Implement proper error handling and logging
- Use streaming responses for long-running operations
- Validate user permissions on protected routes

### Testing Deployment
Always test both deployment targets:
```bash
npm run build:static && npm run preview:pages    # Test Cloudflare Pages
npm run build && npm run start                   # Test Vercel build
```

## Common Patterns

### Component Structure
- Use forwardRef for components that need DOM access
- Implement proper TypeScript interfaces
- Follow Radix UI patterns for accessibility
- Include loading and error states

### Data Fetching
- Server components for initial data loading
- Client components for interactive features
- Custom hooks for reusable data logic
- Proper error boundaries for fault tolerance

### Responsive Design
- Mobile-first approach with breakpoint-specific styles
- Touch-friendly interfaces on mobile
- Progressive enhancement for desktop features