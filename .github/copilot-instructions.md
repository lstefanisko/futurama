# GitHub Copilot Instructions

## Project Overview
This is a React + TypeScript + Vite application called "Futurama" (AI Oracle) that generates AI-powered future predictions using Google's Gemini AI. The app allows users to explore predictions across different categories, years, and regions, with features including image generation, audio narration, and deep temporal analysis.

## Technology Stack
- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **AI Services**: Google Gemini AI (@google/genai)
- **Backend/Auth**: Supabase
- **Payment**: Paddle
- **Styling**: CSS/TSX (component-scoped)

## Project Structure
```
/
├── components/          # React components (AuthModal, PredictionCard, WorldMap, etc.)
├── services/            # Service layer (geminiService, supabaseService, paddleService)
├── App.tsx             # Main application component
├── types.ts            # TypeScript type definitions and enums
├── translations.ts     # Multi-language translations
├── index.tsx           # Application entry point
├── vite.config.ts      # Vite configuration
└── tsconfig.json       # TypeScript configuration
```

## Development Commands
- **Install dependencies**: `npm install`
- **Run dev server**: `npm run dev`
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`

## Environment Variables
Required environment variables (configure in `.env.local`):
- `API_KEY` or `GEMINI_API_KEY`: Gemini AI API key
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

## Coding Conventions

### TypeScript
- Use **strict mode** enabled in tsconfig.json
- Define all types explicitly - avoid `any`
- Use enums for fixed sets of values (e.g., `Category`, `Language`)
- Prefer interfaces for object shapes
- Use type aliases for union types

### React Components
- Use **functional components** with hooks (useState, useEffect, useMemo)
- Define props interfaces with descriptive names (e.g., `PredictionCardProps`)
- Use React.FC type annotation for components
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks when appropriate

### File Naming
- React components: PascalCase with `.tsx` extension (e.g., `PredictionCard.tsx`)
- Services: camelCase with `.ts` extension (e.g., `geminiService.ts`)
- Types: Use singular names (e.g., `types.ts`)
- Configuration: Use standard names (e.g., `vite.config.ts`, `tsconfig.json`)

### Code Style
- Use single quotes for strings
- Use arrow functions for component definitions and callbacks
- Prefer const over let
- Use template literals for string interpolation
- Keep functions pure when possible
- Handle async operations with async/await syntax

### State Management
- Use React hooks (useState, useEffect) for component state
- Supabase for authentication and data persistence
- Pass callbacks via props for parent-child communication
- Use context sparingly - prefer prop drilling for shallow hierarchies

### Error Handling
- Implement proper error handling for async operations
- Provide user-friendly error messages
- Use try-catch blocks for API calls
- Set error state to display issues to users (e.g., `setAudioError(true)`)

### Multi-language Support
- All user-facing strings should be in the `translations` object
- Support multiple languages: en, sk, de, pl, es, fr, it, ja, pt, zh
- Use the `Language` type for language selection
- Access translations via `translations[lang]`

### API Integration
- All Gemini AI interactions should go through `services/geminiService.ts`
- All Supabase operations should go through `services/supabaseService.ts`
- Handle loading states for async operations
- Implement proper error boundaries

### Security
- Never commit API keys or secrets to the repository
- Use environment variables for sensitive configuration
- Validate user input before processing
- Follow secure authentication patterns with Supabase

## Testing
Currently, there is no test infrastructure in the project. When adding tests:
- Follow the repository structure
- Test critical user flows (prediction generation, authentication)
- Mock external API calls (Gemini, Supabase)

## Performance Considerations
- Use useMemo for expensive computations
- Implement loading states for better UX
- Optimize images and assets
- Lazy load components when appropriate

## Common Tasks

### Adding a New Component
1. Create a new file in `/components` with PascalCase naming
2. Define a props interface
3. Export as a React.FC
4. Import and use in parent components

### Adding a New Service
1. Create a new file in `/services` with camelCase naming
2. Export individual functions (not classes)
3. Handle errors appropriately
4. Document complex logic with comments

### Adding a New Type
1. Add to `types.ts`
2. Use enums for fixed sets of values
3. Use interfaces for object shapes
4. Export all public types

### Adding Translations
1. Add new keys to all language objects in `translations.ts`
2. Ensure consistency across all languages
3. Use descriptive key names

## Important Notes
- This is a production application - avoid breaking changes
- Test all AI integrations thoroughly before committing
- Respect API rate limits and quotas
- Consider user experience for loading states and errors
- Maintain backwards compatibility with existing data structures
