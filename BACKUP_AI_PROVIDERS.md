# Adding Backup AI Providers

Your OpenAI quota is exceeded! Here's how to add backup providers:

## Option 1: Anthropic Claude (Recommended - Most Generous Free Tier)

1. Get free API key: https://console.anthropic.com/
2. Add to Netlify:
   ```powershell
   netlify env:set VITE_ANTHROPIC_API_KEY "sk-ant-your-key-here"
   ```

## Option 2: Google Gemini (Free Tier Available)

1. Get free API key: https://ai.google.dev/
2. Add to Netlify:
   ```powershell
   netlify env:set VITE_GEMINI_API_KEY "your-gemini-key-here"
   ```

## After Adding Keys

The system will automatically use available providers! Just select them in the dropdown on the demo page.

## Check Your OpenAI Quota

- Visit: https://platform.openai.com/usage
- You might have a low free tier limit
- Consider upgrading or using the free alternatives above

## Current Status

Run this to see what's configured:
```powershell
curl https://pssi.netlify.app/.netlify/functions/ai-health -UseBasicParsing | ConvertFrom-Json
```

You'll see which providers are ready to use!
