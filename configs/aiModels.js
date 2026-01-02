/**
 * AI Model Configuration for Course Generator
 * 
 * You can easily switch between models by changing the model names below.
 * All models are available through OpenRouter API.
 */

export const AI_MODELS = {
  // Course Layout Generation (Structured JSON)
  LAYOUT: {
    // FREE TIER: Fast and free
    model: "google/gemini-2.0-flash-lite-001",
    
    // Alternatives (uncomment to use):
    // model: "google/gemini-2.5-flash", // Paid: Fast and cost-effective
    // model: "anthropic/claude-3.5-sonnet", // Paid: Better instruction following
    // model: "openai/gpt-4o-mini", // Paid: Good balance
    // model: "meta-llama/llama-3.1-70b-instruct", // Paid: Open source option
    
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 3000,
  },

  // Chapter Content Generation (Long-form content)
  CONTENT: {
    // FREE TIER: Free model for content generation
    model: "google/gemini-2.0-flash-lite-001",
    
    // Alternatives (uncomment to use):
    // model: "google/gemini-2.5-flash", // Paid: Good for detailed content
    // model: "anthropic/claude-3.5-sonnet", // Paid: Best for detailed explanations
    // model: "openai/gpt-4o", // Paid: High quality, higher cost
    // model: "google/gemini-2.0-flash-exp", // Paid: Faster alternative
    
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 6000,
  },
};

/**
 * Model Recommendations by Use Case:
 * 
 * 1. FREE TIER (Current Setup) 🆓:
 *    - Layout: google/gemini-2.0-flash-lite-001
 *    - Content: google/gemini-2.0-flash-lite-001
 *    - Best for: Development, testing, zero-cost projects
 *    - Cost: FREE ✅
 * 
 * 2. COST-EFFECTIVE:
 *    - Layout: google/gemini-2.5-flash
 *    - Content: google/gemini-2.5-flash
 *    - Best for: High volume, budget-conscious
 *    - Cost: Low (~$0.10-0.50 per 1M tokens)
 * 
 * 3. BALANCED (Recommended):
 *    - Layout: google/gemini-2.5-flash
 *    - Content: anthropic/claude-3.5-sonnet
 *    - Best for: Quality content with reasonable costs
 *    - Cost: Medium
 * 
 * 4. HIGH QUALITY:
 *    - Layout: anthropic/claude-3.5-sonnet
 *    - Content: anthropic/claude-3.5-sonnet or openai/gpt-4o
 *    - Best for: Premium courses, maximum quality
 *    - Cost: High
 * 
 * 5. SPEED OPTIMIZED:
 *    - Layout: google/gemini-2.0-flash-exp
 *    - Content: google/gemini-2.0-flash-exp
 *    - Best for: Real-time generation, lower latency
 *    - Cost: Low
 */

