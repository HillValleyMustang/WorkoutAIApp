# Overview

FitTracker Pro is an AI-powered fitness tracking application that helps users manage their workouts, track progress, and receive personalized coaching insights. The app features a full-stack architecture with React frontend, Express backend, PostgreSQL database, and Google Gemini AI integration for intelligent workout recommendations and equipment analysis.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side application is built with React and TypeScript, utilizing a modern component-based architecture:

- **Framework**: React with TypeScript for type safety and better developer experience
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: React Query for server state management and caching
- **Authentication**: Firebase Authentication with Google sign-in integration
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

The frontend follows a modular structure with reusable components, custom hooks for business logic, and separate pages for different app sections (Dashboard, Workout, Exercises, Progress, Profile).

## Backend Architecture

The server-side uses Express.js with TypeScript in an ESM module setup:

- **Framework**: Express.js with middleware for request logging and error handling
- **Authentication**: Firebase Admin SDK for token verification
- **API Design**: RESTful API with protected routes using JWT tokens
- **File Uploads**: Multer middleware for handling image uploads (equipment analysis)
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development

The backend implements a clean separation of concerns with dedicated service layers for AI integration and Firebase authentication.

## Data Storage Solutions

**Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Design**: Normalized relational structure with tables for users, exercises, workouts, workout sets, personal records, and AI insights
- **Migrations**: Drizzle Kit for database schema management and migrations
- **Connection**: Neon Database serverless PostgreSQL for production deployment

**Data Models**:
- Users with Firebase UID linking, profile information, and health notes
- Exercises with categories (UpperA, LowerA, UpperB, LowerB), muscle groups, and unilateral support
- Workouts with volume tracking and duration measurement
- Workout sets with support for both bilateral and unilateral exercises
- Personal records and AI insights for progress tracking

## Authentication and Authorization

**Authentication Provider**: Firebase Authentication
- Google OAuth integration for seamless user sign-in
- Firebase Admin SDK for server-side token verification
- JWT tokens passed via Authorization headers for API access
- User registration automatically creates local user records

**Authorization Pattern**: 
- Protected routes using middleware that verifies Firebase tokens
- User context maintained throughout the application
- Automatic token refresh handled by Firebase client SDK

## AI Integration Architecture

**AI Provider**: Google Gemini API integration
- **Workout Progression**: Analyzes user's exercise history and profile to suggest optimal weight/rep progressions
- **Equipment Analysis**: Computer vision capabilities to analyze gym equipment photos and suggest relevant exercises
- **Safety Considerations**: AI takes user health notes into account when providing recommendations
- **Response Format**: Structured JSON responses for consistent data handling

The AI service layer abstracts the Gemini API calls and provides typed interfaces for different AI features, ensuring maintainable and testable code.

# External Dependencies

## Core Dependencies
- **@google/genai**: Google Gemini AI integration for workout recommendations and equipment analysis
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm & drizzle-kit**: Type-safe ORM and migration tools for database management
- **firebase-admin**: Server-side Firebase authentication and user management

## UI and Frontend
- **@radix-ui/***: Comprehensive set of accessible UI primitives for building the component library
- **@tanstack/react-query**: Server state management, caching, and data synchronization
- **tailwindcss**: Utility-first CSS framework with custom design system
- **chart.js**: Data visualization for progress tracking and analytics
- **wouter**: Lightweight routing solution for single-page application navigation

## Development and Build Tools
- **vite**: Fast build tool and development server with TypeScript support
- **typescript**: Type safety across the entire application stack
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast JavaScript bundler for production builds

## Authentication and Security
- **firebase**: Client-side authentication and user management
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **multer**: File upload handling for equipment image analysis

The application is designed as a monorepo with shared TypeScript schemas between client and server, ensuring type consistency across the full stack.