# Perspective API Quota Management

## Overview

The system has been configured to respect the Perspective API quota limits:
- **60 requests per minute** for AnalyzeComment operations
- Both global and per-user limits apply

## Implementation

### 1. Rate Limiting
- **Automatic rate limiting** with request queuing
- Tracks requests in a rolling 60-second window
- Queues requests when quota is reached
- Processes queue automatically as quota becomes available

### 2. Caching
- **24-hour cache** for moderation results
- Reduces API calls significantly
- Cache key based on content hash
- Identical content served instantly from cache

### 3. Request Management
- **Sequential processing** for batch operations
- Automatic queue management
- 1-second minimum delay between requests
- Graceful handling of 429 (rate limit) errors

### 4. Usage Monitoring
- Real-time usage tracking
- Warnings when usage exceeds 80%
- Queue length monitoring
- Usage statistics available via `getPerspectiveAPIUsage()`

## How It Works

### Single Request Flow
1. Check cache first (instant if cached)
2. Acquire rate limit permit (waits if needed)
3. Make API request
4. Cache result for 24 hours
5. Return result

### Batch Request Flow
1. Process articles sequentially
2. Each article checks cache first
3. Only uncached articles use API quota
4. Small delays between requests
5. Queue manages overflow

### Rate Limit Handling
- When quota reached: Requests are queued
- Queue processing: Automatic as quota frees up
- 429 errors: Handled gracefully, request queued for retry
- No data loss: All requests eventually processed

## Configuration

The quota limits are defined in `contentModeration.ts`:

```typescript
const PERSPECTIVE_API_QUOTA = {
  REQUESTS_PER_MINUTE: 60,
  REQUESTS_PER_SECOND: 1,
  BURST_SIZE: 10,
};
```

## Monitoring

### Check Usage
```typescript
import { getPerspectiveAPIUsage } from './services/contentModeration';

const usage = getPerspectiveAPIUsage();
console.log(`Used: ${usage.used}/${usage.limit}`);
console.log(`Percentage: ${usage.percentage}%`);
console.log(`Queued: ${usage.queueLength} requests`);
```

### Dev Mode Warnings
- Automatic warnings when usage > 80%
- Console logs show current usage
- Queue length displayed

## Best Practices

1. **Enable Caching**: Always enabled by default (24-hour TTL)
2. **Batch Processing**: Use `moderateArticles()` for multiple items
3. **Monitor Usage**: Check usage periodically in production
4. **Handle Queues**: System handles automatically, but monitor queue length
5. **Cache Strategy**: Longer cache = fewer API calls

## Performance

### With Caching
- **First request**: ~1-2 seconds (API call)
- **Cached requests**: <10ms (instant)
- **Cache hit rate**: Typically 70-90% for news articles

### Without Caching
- **Sequential**: 60 requests/minute max
- **Queue wait**: Depends on current usage
- **Average delay**: ~1 second per request when at limit

## Error Handling

### 429 Rate Limit Errors
- Automatically detected
- Request queued for retry
- No manual intervention needed
- System continues processing

### API Failures
- Graceful degradation
- Falls back to keyword filtering
- Content not blocked (errs on side of allowing)
- Logs warnings for monitoring

## Optimization Tips

1. **Increase Cache TTL**: For stable content, increase cache duration
2. **Batch Operations**: Group multiple checks together
3. **Pre-filter**: Use keyword checks before API calls
4. **Monitor Patterns**: Identify high-usage patterns
5. **Cache Warming**: Pre-cache frequently accessed content

## Quota Dashboard

The system respects the quotas shown in your Perspective API dashboard:
- AnalyzeComment: 60/minute
- ListAttributes: 60/minute (not used currently)
- SuggestCommentScore: 60/minute (not used currently)

All limits are enforced automatically.

