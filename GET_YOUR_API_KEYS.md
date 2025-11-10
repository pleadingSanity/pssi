# 🔑 Get ALL Your API Keys - Step by Step

You're already signed in! Let me help you grab each key:

---

## ✅ STEP 1: OpenAI (You're Paying For This!)

**I just opened:** https://platform.openai.com/api-keys

**What to do:**
1. Click "Create new secret key"
2. Name it "PSSI-App"
3. Copy the key (starts with `sk-`)
4. **PASTE IT HERE:** ___________________________

---

## ✅ STEP 2: Anthropic Claude

**Open this:** https://console.anthropic.com/settings/keys

**What to do:**
1. Click "Create Key"
2. Name it "PSSI"
3. Copy it (starts with `sk-ant-`)
4. **PASTE IT HERE:** ___________________________

---

## ✅ STEP 3: Google Gemini (FREE!)

**Open this:** https://aistudio.google.com/app/apikey

**What to do:**
1. Click "Create API Key"
2. Select your project (or create new)
3. Copy the key
4. **PASTE IT HERE:** ___________________________

---

## 🚀 BONUS: Other AI Services (If You Have Them)

### Replicate (For Llama, Stable Diffusion, etc.)
- Get key: https://replicate.com/account/api-tokens
- **PASTE HERE:** ___________________________

### Hugging Face (For Open Source Models)
- Get key: https://huggingface.co/settings/tokens
- **PASTE HERE:** ___________________________

---

## ⚡ Once You Paste All Keys

I'll run these commands to add them to your app:

```powershell
netlify env:set VITE_OPENAI_API_KEY "sk-your-openai-key"
netlify env:set VITE_ANTHROPIC_API_KEY "sk-ant-your-anthropic-key"
netlify env:set VITE_GEMINI_API_KEY "your-gemini-key"
netlify env:set VITE_REPLICATE_API_KEY "your-replicate-key"  # Optional
netlify env:set VITE_HUGGINGFACE_API_KEY "your-hf-key"  # Optional
```

## 📝 PASTE YOUR KEYS BELOW (I'll auto-detect them)

Just paste all your keys in your next message, one per line, and I'll automatically set them up!

**Example:**
```
sk-proj-abc123...
sk-ant-xyz789...
AIzaSy...
r8_abc123...
hf_abc123...
```

Ready? Start pasting! 🔑
