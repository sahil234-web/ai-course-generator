# AI Models Guide for Course Generator

## Quick Model Recommendations

### 🆓 **FREE TIER Setup (No Cost)**
- **Course Layout**: `google/gemini-2.0-flash-lite-001` ✅ (Current - FREE)
- **Chapter Content**: `google/gemini-2.0-flash-lite-001` ✅ (Current - FREE)
- **Best for**: Testing, development, low-budget projects

### 🎯 **Recommended Setup (Balanced Quality & Cost)**
- **Course Layout**: `google/gemini-2.5-flash` ⭐
- **Chapter Content**: `anthropic/claude-3.5-sonnet` ⭐ (Recommended upgrade)

### 💰 **Budget-Friendly Setup**
- **Course Layout**: `google/gemini-2.5-flash`
- **Chapter Content**: `google/gemini-2.5-flash`

### ⚡ **Speed-Optimized Setup**
- **Course Layout**: `google/gemini-2.0-flash-exp`
- **Chapter Content**: `google/gemini-2.0-flash-exp`

### 🏆 **Premium Quality Setup**
- **Course Layout**: `anthropic/claude-3.5-sonnet`
- **Chapter Content**: `anthropic/claude-3.5-sonnet` or `openai/gpt-4o`

---

## Model Comparison

### For Course Layout (Structured JSON Generation)

| Model | Speed | Cost | JSON Quality | Best For |
|-------|-------|------|--------------|----------|
| `google/gemini-2.0-flash-lite-001` | ⚡⚡⚡ | 🆓 FREE | ⭐⭐⭐ | **Current - FREE tier** |
| `google/gemini-2.5-flash` | ⚡⚡⚡ | 💰 | ⭐⭐⭐ | Good balance |
| `anthropic/claude-3.5-sonnet` | ⚡⚡ | 💰💰 | ⭐⭐⭐⭐⭐ | Best instruction following |
| `openai/gpt-4o-mini` | ⚡⚡⚡ | 💰 | ⭐⭐⭐⭐ | Good alternative |
| `meta-llama/llama-3.1-70b-instruct` | ⚡⚡ | 💰💰 | ⭐⭐⭐ | Open source option |

### For Chapter Content (Long-form Content Generation)

| Model | Speed | Cost | Content Quality | Best For |
|-------|------|------|-----------------|----------|
| `google/gemini-2.0-flash-lite-001` | ⚡⚡⚡ | 🆓 FREE | ⭐⭐⭐ | **Current - FREE tier** |
| `google/gemini-2.5-flash` | ⚡⚡⚡ | 💰 | ⭐⭐⭐ | Fast & cheap |
| `anthropic/claude-3.5-sonnet` | ⚡⚡ | 💰💰 | ⭐⭐⭐⭐⭐ | **Best for detailed content** |
| `openai/gpt-4o` | ⚡⚡ | 💰💰💰 | ⭐⭐⭐⭐⭐ | Premium quality |
| `google/gemini-2.0-flash-exp` | ⚡⚡⚡⚡ | 💰 | ⭐⭐⭐ | Speed priority |

---

## How to Change Models

### Option 1: Edit Configuration File (Recommended)
Edit `configs/aiModels.js`:

```javascript
export const AI_MODELS = {
  LAYOUT: {
    model: "anthropic/claude-3.5-sonnet", // Change this
    // ...
  },
  CONTENT: {
    model: "anthropic/claude-3.5-sonnet", // Change this
    // ...
  },
};
```

### Option 2: Direct API Route Edit
Edit the model name directly in:
- `app/api/course/layout/route.jsx` (for course layout)
- `app/api/courses/[courseId]/content/route.js` (for chapter content)

---

## Model Details

### Google Gemini Models

#### `google/gemini-2.0-flash-lite-001` 🆓 **FREE TIER**
- **Pros**: **100% FREE**, fast, good for JSON generation, perfect for testing
- **Cons**: Slightly less capable than paid versions, may have rate limits
- **Use Case**: Development, testing, low-budget projects, learning
- **Cost**: **FREE** ✅
- **Status**: Currently active in your configuration

#### `google/gemini-2.5-flash`
- **Pros**: Very fast, cost-effective, good JSON generation
- **Cons**: Less detailed for long content
- **Use Case**: High-volume generation, budget projects
- **Cost**: Low

#### `google/gemini-2.0-flash-exp`
- **Pros**: Fastest, experimental features
- **Cons**: May be less stable
- **Use Case**: Speed-critical applications
- **Cost**: Low

### Anthropic Claude Models

#### `anthropic/claude-3.5-sonnet` ⭐ **RECOMMENDED**
- **Pros**: Excellent instruction following, great for detailed content, reliable JSON
- **Cons**: Slightly slower, higher cost
- **Use Case**: Quality-focused courses, detailed explanations
- **Cost**: Medium

#### `anthropic/claude-3-haiku`
- **Pros**: Fast, cheaper than Sonnet
- **Cons**: Less capable than Sonnet
- **Use Case**: Quick content generation
- **Cost**: Low-Medium

### OpenAI Models

#### `openai/gpt-4o`
- **Pros**: Highest quality, excellent reasoning
- **Cons**: Most expensive, slower
- **Use Case**: Premium courses, maximum quality
- **Cost**: High

#### `openai/gpt-4o-mini`
- **Pros**: Good quality, cheaper than GPT-4o
- **Cons**: Less capable than GPT-4o
- **Use Case**: Balanced quality and cost
- **Cost**: Medium

### Meta Llama Models

#### `meta-llama/llama-3.1-70b-instruct`
- **Pros**: Open source, good performance
- **Cons**: Requires more tokens, slower
- **Use Case**: Open source preference
- **Cost**: Medium

---

## Testing Different Models

1. **Start with current setup** (Gemini 2.5 Flash) - baseline
2. **Test Claude 3.5 Sonnet** for chapter content - likely quality improvement
3. **Compare results** - check content quality, speed, and costs
4. **Adjust based on needs** - prioritize quality, speed, or cost

---

## Cost Considerations

### 🆓 **FREE Models**
- **`google/gemini-2.0-flash-lite-001`**: **100% FREE** ✅ (Currently active)
  - Perfect for development and testing
  - No credit card required
  - May have rate limits

### 💰 **Paid Models**
- **Gemini models**: ~$0.10-0.50 per 1M tokens
- **Claude Sonnet**: ~$3-15 per 1M tokens
- **GPT-4o**: ~$5-30 per 1M tokens

**Tip**: 
1. Start with **FREE** `gemini-2.0-flash-lite-001` for testing ✅
2. Upgrade to paid models for production if quality matters
3. Monitor usage in OpenRouter dashboard

---

## Performance Tips

1. **Use different models for different tasks**:
   - Fast model (Gemini) for layout
   - Quality model (Claude) for content

2. **Adjust temperature**:
   - Lower (0.3-0.5) for structured JSON
   - Higher (0.7-0.9) for creative content

3. **Monitor token usage**:
   - Layout: 2000-3000 tokens usually sufficient
   - Content: 4000-6000 tokens for detailed chapters

---

## Need Help?

- Check OpenRouter model list: https://openrouter.ai/models
- Monitor usage in OpenRouter dashboard
- Test models with small batches first

