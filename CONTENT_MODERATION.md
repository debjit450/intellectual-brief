# Content Moderation System

This platform implements a comprehensive, multi-layered content moderation system to ensure compliance, safety, and copyright protection.

## Overview

The content moderation system uses **Perspective API as the primary decision-maker** with advanced ML-based detection:

1. **Perspective API (PRIMARY)** - Advanced ML-based toxicity detection with high-confidence thresholds (>0.85)
2. **Keyword flagging (SECONDARY)** - Used only for context when Perspective API also flags content
3. **Copyright detection (TERTIARY)** - Pattern matching for informational purposes only
4. **Pre and post-moderation** - Content checked before and after AI generation

**Important**: The system does NOT rely on AI model (Gemini) for blocking decisions. All blocking decisions are made by Perspective API with high confidence thresholds to minimize false positives.

## Architecture

### Services

- **`services/contentModeration.ts`** - Main moderation service with third-party API integration
- **`utils/safety.ts`** - Legacy keyword filtering (now enhanced with moderation service)

### Integration Points

1. **Article Feed** (`components/NewsFeed.tsx`) - Filters articles before display
2. **Article Generation** (`services/geminiService.ts`) - Pre and post-moderation checks
3. **Article Display** (`components/ArticleDetail.tsx`) - Client-side safety checks

## Features

### Content Categories Detected

- **Violence**: Murder, terrorism, mass shootings, war crimes
- **Sexual Content**: Assault, exploitation, explicit material
- **Self-Harm**: Suicide, self-injury, eating disorders
- **Hate Speech**: Racism, extremism, identity attacks
- **Minors**: Child abuse, underage content
- **Graphic Content**: Gore, graphic violence
- **Copyright**: Infringement, plagiarism, unauthorized reproduction

### Risk Levels

- **Low**: Content passes moderation checks (Perspective API scores <0.60)
- **Medium**: Some concerns flagged but not blocked (scores 0.60-0.75)
- **High**: Significant concerns flagged but only blocked in strict mode (scores 0.75-0.85)
- **Prohibited**: Content blocked immediately (scores >0.85 for critical categories)

### Blocking Thresholds

The system uses **advanced thresholds** to minimize false positives:

- **Critical Blocking**: Only blocks when Perspective API scores >0.85 for:
  - Severe Toxicity
  - Threats
  - Identity Attacks
  - Sexually Explicit Content

- **High Risk Flagging**: Flags but doesn't block (scores 0.75-0.85) unless in strict mode

- **Moderate Risk**: Just flags for review (scores 0.60-0.75)

- **Keywords**: Only used for context when Perspective API also flags content - keywords alone don't block

## API Integration

### Perspective API

The system integrates with Google's Perspective API for toxicity detection:

- **Free Tier**: 1 request/second, 1000 requests/day
- **Get API Key**: https://perspectiveapi.com/
- **Environment Variable**: `PERSPECTIVE_API_KEY`

If the API key is not set, the system falls back to keyword-based filtering only.

### Detected Attributes

- Toxicity
- Severe Toxicity
- Identity Attack
- Insult
- Profanity
- Threat
- Sexually Explicit
- Flirtation

## Usage

### Basic Moderation

```typescript
import { moderateContent } from './services/contentModeration';

const result = await moderateContent(text, {
  checkCopyright: true,
  strictMode: true,
});

if (result.isBlocked) {
  // Handle blocked content
}
```

### Article Moderation

```typescript
import { moderateArticle } from './services/contentModeration';

const result = await moderateArticle(title, summary, source, {
  checkCopyright: true,
  strictMode: true,
});
```

### Batch Moderation

```typescript
import { moderateArticles } from './services/contentModeration';

const results = await moderateArticles(articles, {
  checkCopyright: true,
  strictMode: true,
});
```

## Configuration

### Environment Variables

Set this in your `.env` file (in the project root):

```bash
PERSPECTIVE_API_KEY=your_api_key_here
```

**Note**: The variable is automatically loaded by Vite. After setting it:
1. Restart your dev server (`npm run dev`)
2. The key will be available to the moderation service

If you're using Vite's `VITE_` prefix, you can also use:
```bash
VITE_PERSPECTIVE_API_KEY=your_api_key_here
```

### Options

- `checkCopyright`: Enable copyright detection (default: true)
- `strictMode`: Use stricter blocking rules (default: false)
- `allowUnconfirmed`: Allow unconfirmed content (default: false)

## Fallback Behavior

If the Perspective API is unavailable or not configured:

1. **Content is NOT blocked** - system errs on the side of allowing content
2. Content is flagged for review (medium risk)
3. Keywords are checked but don't trigger blocking
4. Copyright patterns are still detected for informational purposes
5. System logs a warning about API unavailability

**Important**: The system requires Perspective API for blocking decisions. Without it, content is flagged but not blocked to prevent false positives.

## Monitoring

The system logs moderation events:

- `content_blocked_pre_moderation` - Content blocked before processing
- `cached_content_blocked` - Cached content blocked on re-check
- `generated_content_blocked` - AI-generated content blocked

## Compliance

This moderation system helps ensure:

- **Safety**: No violent, sensitive, or triggering content
- **Legal Compliance**: Copyright violation detection
- **Platform Safety**: Protection against harmful content
- **User Protection**: Safe browsing experience

## Best Practices

1. **Always set PERSPECTIVE_API_KEY** for production environments
2. **Monitor moderation logs** for patterns
3. **Review blocked content** periodically to tune thresholds
4. **Update keyword lists** as needed for your use case
5. **Test moderation** with sample content before deployment

## Rate Limiting & Quota Management

The system respects Perspective API quotas:

- **Quota**: 60 requests per minute (as per API dashboard)
- **Rate Limiting**: Automatic rate limiting with request queuing
- **Caching**: 24-hour cache for moderation results to reduce API calls
- **Queue Management**: Requests are queued when quota is reached
- **Usage Monitoring**: Real-time usage tracking and warnings

### How Rate Limiting Works

1. **Immediate Requests**: Up to 60 requests per minute are processed immediately
2. **Queue System**: Additional requests are queued and processed as quota becomes available
3. **Caching**: Identical content is served from cache (24-hour TTL)
4. **429 Handling**: Rate limit errors are handled gracefully with automatic queuing

### Monitoring Usage

Use `getPerspectiveAPIUsage()` to check current usage:

```typescript
import { getPerspectiveAPIUsage } from './services/contentModeration';

const usage = getPerspectiveAPIUsage();
console.log(`Used: ${usage.used}/${usage.limit} (${usage.percentage}%)`);
console.log(`Queued: ${usage.queueLength} requests`);
```

## Limitations

- Perspective API quota: 60 requests/minute (enforced by rate limiter)
- Keyword filtering may have false positives
- Copyright detection is pattern-based, not comprehensive
- Some edge cases may require manual review
- Cached results may not reflect real-time changes

## Support

For issues or questions about content moderation:

1. Check API key configuration
2. Review moderation logs
3. Test with sample content
4. Adjust thresholds if needed

