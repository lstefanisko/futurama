# Copilot Instructions for Futurama Project

## Project Overview

**Futurama** is a futuristic AI-powered prediction application built with React, TypeScript, and Vite. The app generates scientifically-grounded predictions about future events across multiple categories (Technology, Society, Environment, Health, Space) using Google's Gemini AI API. It features authentication, data persistence, premium subscriptions, and multi-language support.

**Live App**: https://ai.studio/apps/drive/1pyUR3KrJzSxD8_AT0GxjPrLo7cJfPILN

## Architecture & Tech Stack

### Core Technologies
- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6.0
- **Language**: TypeScript 5.7 (strict mode enabled)
- **Styling**: Inline styles and CSS (no CSS framework)
- **Module System**: ESNext with ES modules

### External Integrations
1. **Google Gemini AI** (`@google/genai` v1.34.0)
   - Model: `gemini-3-pro-preview` for predictions
   - Model: `gemini-2.5-flash-image` for image generation
   - Model: `gemini-2.5-flash-preview-tts` for text-to-speech
   - Features: Google Search tools, thinking budget (32768), grounding metadata
   
2. **Supabase** (`@supabase/supabase-js` v2.48.1)
   - Authentication (email-based)
   - PostgreSQL database for predictions and tasks
   - Real-time subscriptions for auth state changes
   
3. **Paddle** (`@paddle/paddle-js` v2.0.0)
   - Payment processing
   - Subscription management

## Project Structure

```
/
├── .github/                    # GitHub configuration
├── components/                 # React components
│   ├── AdComponent.tsx
│   ├── AuthModal.tsx
│   ├── Carousel.tsx
│   ├── PredictionCard.tsx
│   ├── PricingSection.tsx
│   ├── TaskList.tsx
│   ├── VisionStream.tsx
│   └── WorldMap.tsx
├── services/                   # External service integrations
│   ├── geminiService.ts       # Google Gemini AI integration
│   ├── paddleService.ts       # Paddle payment integration
│   └── supabaseService.ts     # Supabase database & auth
├── App.tsx                     # Main application component
├── index.tsx                   # Application entry point
├── types.ts                    # TypeScript type definitions
├── translations.ts             # Multi-language translations
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
└── .env.example               # Environment variable template
```

## Development Workflows

### Local Development
1. **Install dependencies**: `npm install`
2. **Set environment variables**: Copy `.env.example` to `.env.local` and configure:
   - `VITE_GOOGLE_GENAI_API_KEY`: Google Gemini API key
   - `VITE_SUPABASE_URL`: Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
   - `VITE_PADDLE_CLIENT_TOKEN`: Paddle client token
   - `VITE_PADDLE_ENVIRONMENT_ID`: Paddle environment (1=prod, 2=sandbox)
3. **Run development server**: `npm run dev`
4. **Build for production**: `npm run build`
5. **Preview production build**: `npm run preview`

### Environment Variables
- Environment variables are accessed via `process.env` and defined in `vite.config.ts`
- Vite requires the `VITE_` prefix for client-side environment variables
- The Gemini API key uses `API_KEY` (without VITE_ prefix) and is defined separately in vite.config.ts

## Coding Conventions & Best Practices

### TypeScript
- **Strict mode enabled**: All code must comply with TypeScript strict checks
- **Type safety**: Always use explicit types, avoid `any`
- **Interface definitions**: All data structures defined in `types.ts`
- **Enums**: Use TypeScript enums for categorical data (e.g., `Category`, `Language`)
- **No implicit returns**: Functions should have explicit return types

### React Components
- **Functional components**: Use React.FC for all components
- **Hooks**: Use React hooks (useState, useEffect, etc.) following React 19 best practices
- **Props typing**: All component props must be typed using interfaces
- **State management**: Local state with useState, no global state management library
- **Side effects**: Use useEffect with proper dependency arrays

### Code Style
- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required at end of statements
- **Naming conventions**:
  - Components: PascalCase (e.g., `PredictionCard.tsx`)
  - Functions: camelCase (e.g., `getFuturePrediction`)
  - Constants: camelCase for regular constants, UPPER_CASE for true constants
  - Types/Interfaces: PascalCase (e.g., `Prediction`, `UserProfile`)
  - Enums: PascalCase with UPPER_CASE values

### Error Handling
- **Async/await**: Use try-catch blocks for async operations
- **User-facing errors**: Provide localized error messages based on `lang` parameter
- **Service errors**: Log to console with descriptive messages
- **Fallbacks**: Always provide fallback values (e.g., empty arrays, null checks)
- **Optional chaining**: Use `?.` for safe property access on potentially undefined objects

### API Integration Patterns

#### Gemini AI Service
```typescript
// Always use structured output with JSON schema
// Include thinking budget for complex reasoning
// Utilize Google Search tools for real-time data
// Handle grounding metadata for source citations
// Support multi-language responses using languageMap
```

#### Supabase Service
```typescript
// Always check if supabase client is initialized
// Use null checks before database operations
// Return empty arrays/null on errors, don't throw
// Log errors to console for debugging
// Use upsert for idempotent operations
```

### Multi-language Support
- **Supported languages**: en, sk, de, pl, es, fr, it, ja, pt, zh
- **Translation file**: `translations.ts` contains all UI strings
- **Language parameter**: Pass `lang` to all user-facing functions
- **Gemini responses**: Use `languageMap` to request responses in specific languages

### Data Models

#### Prediction
Core data structure for future predictions with:
- Basic info: id, title, summary, analysis
- Scoring: probability (0-100), impactLevel (Low/Medium/High/Critical)
- Metadata: year, category, timestamp, imageUrl, sources
- Geographic data: regionalImpact array with region, value, description

#### User Profile
- Authentication: id, email (from Supabase)
- Subscription: is_pro (boolean)
- Usage tracking: predictions_count

#### Task
- Task management: id, text, completed, createdAt
- Associated with predictions via prediction_id

## Integration Points

### Google Gemini AI
- **Authentication**: API key via environment variable
- **Models used**:
  - `gemini-3-pro-preview`: Primary prediction generation with structured JSON output
  - `gemini-2.5-flash-image`: Image generation and editing
  - `gemini-2.5-flash-preview-tts`: Text-to-speech conversion
- **Configuration**:
  - thinkingBudget: 32768 for deep reasoning
  - googleSearch tool for real-time data
  - responseMimeType: "application/json" for structured output
  - responseSchema: Defined inline for type safety
- **Grounding**: Extracts source citations from grounding metadata

### Supabase
- **Tables**:
  - `predictions`: Stores user's generated predictions
  - `tasks`: Task lists associated with predictions
- **Authentication**: Email-based auth with session management
- **Real-time**: Auth state changes via onAuthStateChange subscription
- **Operations**: upsert for idempotent writes, ordered queries by timestamp

### Paddle
- **Purpose**: Payment processing and subscription management
- **Environment**: Configurable for sandbox (2) or production (1)
- **Implementation**: Details in `paddleService.ts`

## Common Patterns

### Async Operations
```typescript
// Pattern: Loading state + error handling + data update
const [isLoading, setIsLoading] = useState(false);

const handleAsyncOperation = async () => {
  setIsLoading(true);
  try {
    const result = await someAsyncFunction();
    setData(result);
  } catch (error) {
    console.error('Operation failed:', error);
    // Show user-friendly error message
  } finally {
    setIsLoading(false);
  }
};
```

### Conditional Rendering
```typescript
// Always check for null/undefined before rendering
{user && <UserComponent user={user} />}
{isLoading ? <Loader /> : <Content />}
{data?.length > 0 ? <List data={data} /> : <EmptyState />}
```

### Service Initialization
```typescript
// Always check if service is initialized before use
if (!supabase) {
  console.warn('Service not initialized');
  return fallbackValue;
}
```

## Testing & Quality

### Testing Strategy
- **No existing test infrastructure**: Tests should be added following React Testing Library patterns
- **Focus areas**: Component rendering, user interactions, API integration mocks
- **Coverage**: Aim for critical paths (auth, predictions, payments)

### Build & Deployment
- **Build command**: `npm run build`
- **Output directory**: `dist/`
- **Entry point**: `index.html`
- **Environment**: Production builds require all environment variables set

## Security Considerations

### API Keys
- **Never commit API keys**: Use `.env.local` for local development
- **Client-side exposure**: Be aware that Vite-bundled env vars are exposed to client
- **Supabase RLS**: Rely on Row Level Security for data access control

### Authentication
- **Session management**: Handle via Supabase auth state changes
- **Protected routes**: Check user state before rendering protected content
- **Token refresh**: Handled automatically by Supabase client

### Data Validation
- **Input sanitization**: Validate and sanitize user inputs
- **Type checking**: Leverage TypeScript for compile-time safety
- **API responses**: Parse and validate Gemini AI JSON responses

## Performance Considerations

### Optimization Strategies
- **Lazy loading**: Consider code splitting for routes
- **Memoization**: Use React.memo for expensive components
- **Debouncing**: Implement for user input (search, filters)
- **Image optimization**: Compress generated images before storage
- **Caching**: Cache predictions in local state to avoid redundant API calls

### Bundle Size
- **Current dependencies**: Keep bundle size minimal
- **Tree shaking**: Vite handles automatic tree shaking
- **Dynamic imports**: Use for heavy components or features

## Troubleshooting

### Common Issues
1. **"AI Signal Lost" error**: Check Gemini API key and quota
2. **Supabase connection**: Verify URL and anon key in environment variables
3. **Build failures**: Ensure all dependencies installed with `npm install`
4. **Type errors**: Run `npx tsc --noEmit` to check for type issues
5. **Environment variables not loading**: Check variable names have `VITE_` prefix (except API_KEY)

### Debugging
- **Console logs**: Check browser console for service errors
- **Network tab**: Monitor API requests and responses
- **Vite dev server**: Hot module replacement shows build errors instantly
- **TypeScript**: Use `--watch` mode for continuous type checking

## Contributing Guidelines

### Code Changes
1. **Minimal changes**: Make surgical, focused modifications
2. **Type safety**: Ensure all new code is properly typed
3. **Error handling**: Add appropriate error handling and user feedback
4. **Localization**: Add translations for new UI strings in `translations.ts`
5. **Documentation**: Update this file if adding new patterns or integrations

### Pull Requests
1. **Test locally**: Run `npm run dev` and verify changes
2. **Build check**: Run `npm run build` to ensure production build works
3. **Type check**: Run `npx tsc --noEmit` to verify types
4. **Clear description**: Explain what changed and why

## AI Coding Agent Guidance

When working on this codebase as an AI coding agent:

1. **Understand the context**: This is a production application with real users and external API integrations
2. **Respect type safety**: Never use `any` or bypass TypeScript checks
3. **Maintain patterns**: Follow existing code patterns and conventions
4. **Handle errors gracefully**: Users should always see helpful, localized error messages
5. **Consider internationalization**: All user-facing text must support multiple languages
6. **Test integrations**: When modifying service files, consider API rate limits and error scenarios
7. **Preserve functionality**: Don't break existing features when adding new ones
8. **Security first**: Never expose API keys or compromise authentication
9. **Performance aware**: Consider the impact of changes on bundle size and runtime performance
10. **Document changes**: Update comments and this file when adding significant new features

## Key Files to Review

When making changes, consider reviewing these files:

- **`types.ts`**: For understanding data structures
- **`translations.ts`**: For adding/modifying UI text
- **`App.tsx`**: For understanding app state and routing
- **`services/geminiService.ts`**: For AI integration patterns
- **`services/supabaseService.ts`**: For database patterns
- **`vite.config.ts`**: For environment variable configuration

## Resources

- **React 19 Docs**: https://react.dev/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Vite Guide**: https://vitejs.dev/guide/
- **Google Gemini API**: https://ai.google.dev/docs
- **Supabase Docs**: https://supabase.com/docs
- **Paddle Docs**: https://developer.paddle.com/

---

**Last Updated**: 2025-12-31
**Project Version**: 1.0.0
**Maintainer**: lstefanisko
