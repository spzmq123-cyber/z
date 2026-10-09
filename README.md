# 🤖 Binance Grid Trading Bot

## 📥 How to Download & Run (كيفية التحميل والتشغيل)

### Method 1: Download as ZIP (الطريقة الأولى: تحميل كملف ZIP)

1. **Download the project**:
   - Click the **"Download"** button in this tool
   - Or click **"Export"** → **"Download ZIP"**
   - Save it to your Desktop

2. **Extract the ZIP**:
   - Right-click the ZIP file
   - Click **"Extract All"** (Windows) or **"Unzip"** (Mac)
   - Extract it to: `C:\Users\YourName\Desktop\binance-bot`

3. **Install Node.js** (if not installed):
   - Go to: https://nodejs.org
   - Download **LTS version**
   - Install it (Next → Next → Install)

4. **Run the bot**:
   - Open the extracted folder
   - **Double-click `setup.bat`** (first time only)
   - Then **double-click `start-bot.bat`**
   - Browser opens automatically at: http://localhost:5173

### Method 2: Using CMD (الطريقة الثانية: باستخدام CMD)

```cmd
:: 1. Navigate to the folder
cd C:\Users\YourName\Desktop\binance-bot

:: 2. Install dependencies (first time only)
npm install

:: 3. Run the bot
npm run dev
```

Then open: http://localhost:5173

---

## 🎯 Quick Start (البدء السريع)

### Step 1: Get Binance API Keys

1. Go to **Binance** → **API Management**
2. Create new API key
3. Enable permissions:
   - ✅ Enable Reading
   - ✅ Enable Spot Trading
   - ❌ **Disable Withdrawals** (for safety!)
4. Copy **API Key** and **Secret Key**

### Step 2: Configure the Bot

1. Open browser: http://localhost:5173
2. Click **⚙️ Settings** tab
3. Enter your API keys
4. **Check "Use Testnet"** (recommended for testing!)
5. Select trading pair (e.g., BTC/USDT)
6. Set parameters:
   - Number of Orders: 3
   - Order Quantity: 0.001
   - Buy Distance: 0.5%
   - Sell Distance: 0.5%
   - TP Distance: 1.5%

### Step 3: Start Trading

1. Click **🟢 Start Bot**
2. Confirm settings
3. Bot starts automatically!
4. Monitor in **📊 Strategy Map** and **📜 Logs**

---

## 📊 How It Works (كيف يعمل)

```
┌─────────────────────────────────────┐
│  🎯 TP BUY LINE (+1.5%)             │  ← Price hits → Close ALL, restart
├─────────────────────────────────────┤
│  📍 BUY #3 (-1.5%)                  │
│  📍 BUY #2 (-1.0%)                  │
│  📍 BUY #1 (-0.5%)                  │
├─────────────────────────────────────┤
│  💰 MARKET PRICE                    │  ← Current price
├─────────────────────────────────────┤
│  📍 SELL #1 (+0.5%)                 │
│  📍 SELL #2 (+1.0%)                 │
│  📍 SELL #3 (+1.5%)                 │
├─────────────────────────────────────┤
│  🎯 TP SELL LINE (-1.5%)            │  ← Price hits → Close ALL, restart
└─────────────────────────────────────┘

🛡️ SAFE ZONE: If price reaches last order → Cancel all, restart
```

**The bot runs 24/7 automatically:**
- Places buy/sell limit orders
- Monitors price in real-time
- Closes everything when TP or safe zone is hit
- Restarts strategy at new price
- Repeats forever until you stop it

---

## ⚙️ Configuration (الإعدادات)

### Settings Explained:

| Setting | Description | Example |
|---------|-------------|---------|
| **API Key** | Your Binance API key | `abc123...` |
| **API Secret** | Your Binance secret | `xyz789...` |
| **Testnet** | Use test environment | ✅ Check for testing |
| **Symbol** | Trading pair | BTC/USDT, ETH/USDT |
| **Num Orders** | Orders per side | 3 |
| **Quantity** | Amount per order | 0.001 BTC |
| **Buy Distance** | Gap between buy orders | 0.5% |
| **Sell Distance** | Gap between sell orders | 0.5% |
| **TP Distance** | Take profit distance | 1.5% |
| **Safe Zone** | Last order protection | 0.3% |

---

## 🛑 How to Stop (كيف توقف)

### Method 1: Click Stop Button
- Click **🔴 Stop Bot** in the interface
- Bot cancels all orders and stops

### Method 2: Close CMD Window
- Close the CMD window
- Or press `Ctrl + C` in CMD

---

## ⚠️ Important Warnings (تحذيرات مهمة)

1. **⚠️ START WITH TESTNET!** - Test everything first with fake money
2. **⚠️ Never enable withdrawals** on your API key
3. **⚠️ Start with small amounts** - You can lose money
4. **⚠️ Monitor regularly** - Check logs and status
5. **⚠️ API keys are stored locally** - Only in your browser
6. **⚠️ Crypto is volatile** - Trade at your own risk

---

## 🐛 Troubleshooting (حل المشاكل)

### Problem: "Node.js is not installed"
**Solution**: Download and install from https://nodejs.org

### Problem: "npm install fails"
**Solution**: Run CMD as Administrator

### Problem: "Port 5173 already in use"
**Solution**: Close other apps or use: `npm run dev -- --port 3000`

### Problem: "WebSocket error"
**Solution**: Check internet connection, or firewall blocking

### Problem: "Blank white page"
**Solution**: Open browser console (F12) and check for errors

### Problem: "Orders not filling"
**Solution**: 
- Check if price is reaching your levels
- Verify you have enough balance
- Check minimum order size on Binance

---

## 📁 File Structure (هيكل الملفات)

```
binance-bot/
├── setup.bat              ← Double-click to install (first time)
├── start-bot.bat          ← Double-click to run the bot
├── README.md              ← This file
├── src/
│   ├── App.tsx            ← Main application
│   ├── components/
│   │   ├── StrategyVisual.tsx  ← Strategy map visualization
│   │   ├── SettingsPanel.tsx   ← Settings UI
│   │   ├── LogsPanel.tsx       ← Activity logs
│   │   └── StatusBar.tsx       ← Status display
│   ├── hooks/
│   │   └── useBinanceBot.ts    ← Bot logic
│   ├── utils/
│   │   └── binance.ts          ← Binance API functions
│   ├── types.ts                ← TypeScript types
│   ├── index.css               ← Styles
│   └── main.tsx                ← Entry point
├── index.html
├── package.json
└── vite.config.ts
```

---

## 🔒 Security (الأمان)

- ✅ API keys stored **only in your browser** (localStorage)
- ✅ Never sent to any server
- ✅ All trading happens directly with Binance
- ✅ Open source - you can review all code
- ✅ Use Testnet first to test safely

---

## 📞 Support (الدعم)

### Common Questions:

**Q: Can I run multiple bots?**
A: Yes, but use different ports: `npm run dev -- --port 3000`

**Q: Will it work if I close my browser?**
A: No, keep the browser tab open

**Q: Can I run it on my phone?**
A: Yes, open http://localhost:5173 on your phone (same WiFi)

**Q: How much money do I need?**
A: Start with minimum: 0.001 BTC (~$50) on Testnet first

**Q: Is it profitable?**
A: No guarantee. Depends on market conditions. Test first!

---

## 🎓 Learning Resources (مصادر التعلم)

- Binance API Docs: https://binance-docs.github.io/apidocs/
- Binance Testnet: https://testnet.binance.vision
- Node.js Docs: https://nodejs.org/docs/

---

## 📝 Changelog (سجل التغييرات)

### Version 1.0.0
- ✅ Initial release
- ✅ Grid trading strategy
- ✅ Real-time WebSocket monitoring
- ✅ Auto-restart on TP/safe zone
- ✅ Visual strategy map
- ✅ Activity logs
- ✅ Testnet support

---

## ⭐ Features (المميزات)

- 🤖 **24/7 Automated Trading** - Runs non-stop
- 📊 **Visual Strategy Map** - See all levels in real-time
- 🛡️ **Safe Zone Protection** - Auto-closes when last order hit
- 🎯 **Take Profit Lines** - Auto-close and restart
- 📜 **Detailed Logs** - Track every action
- 🔒 **Secure** - API keys stored locally only
- 🧪 **Testnet Support** - Test with fake money first
- 🔄 **Auto-Restart** - Continuously cycles strategy
- ⚡ **Real-Time** - WebSocket for instant price updates
- 📱 **Mobile Friendly** - Works on phone browser

---

## 🚀 Quick Commands (أوامر سريعة)

```cmd
:: Install (first time)
setup.bat

:: Run the bot
start-bot.bat

:: Or manually:
npm install
npm run dev
```

---

## 📄 License

This is for educational purposes. Use at your own risk.

---

**Good luck and happy trading! 🚀📈**

**حظاً موفقاً وتداول سعيد! 🚀📈**
