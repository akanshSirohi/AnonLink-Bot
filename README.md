# 🚀 AnonLink Bot - Anonymous Chat Bot

## 🌟 Overview

The **AnonLink Bot** securely connects Telegram users for private, anonymous conversations, prioritizing user privacy and a smooth chatting experience. Built with **Cloudflare Workers** and **Durable Objects**, the bot efficiently manages user pairings and message routing without the need for traditional servers.

## 🎯 Features

* **Anonymous Chat Pairing:** Matches users randomly while safeguarding user identities.
* **Multimedia Support:** Effortlessly forwards text, images, videos, and other supported media types.
* **Gender Identification:** Introduce yourself easily with `/male` or `/female`.
* **Intuitive Commands:** Simple commands (`/search`, `/stop_search`, `/next`, `/stop`) enhance the user experience.
* **Quick Reply Keyboards:** Fast and convenient keyboards for quick interactions.
* **Feedback Integration:** Automatically provides feedback links after conversations.
* **Cloudflare Powered:** Fully serverless setup via Cloudflare Workers and Durable Objects.

*Note: Poll messages are currently unsupported.*

## 📋 Supported Commands

| Command        | Description                             |
| -------------- | --------------------------------------- |
| `/start`       | Initiate interaction with the bot       |
| `/search`      | Search for a chat partner               |
| `/stop_search` | Cancel ongoing search                   |
| `/stop`        | Terminate the active chat session       |
| `/next`        | End current chat and find a new partner |
| `/male`        | Identify yourself as male               |
| `/female`      | Identify yourself as female             |

### 📒 Registering Commands for Better UX

To enhance user experience, it's recommended to register your bot commands so users see them when they type `/`.

#### 🔧 Option 1: Use [BotFather](https://t.me/BotFather)

1. Open BotFather.
2. Send `/setcommands`.
3. Select your bot.
4. Enter commands in the following format:

```
search - 🔍 Search for partner
stop - 🚩 Stop current dialog
next - 🆕 Search for a new partner
```

#### 📎 Option 2: Register via Webhook (Optional)

If you prefer automation or want to include it in your deployment process:

```http
POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setMyCommands
Content-Type: application/json

{
  "commands": [
    { "command": "search", "description": "🔍 Search for partner" },
    { "command": "stop", "description": "🚩 Stop current dialog" },
    { "command": "next", "description": "🆕 Search for a new partner" },
  ]
}
```

### 🪜 View Registered Commands

To view the currently registered commands:

```http
GET https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMyCommands
```

#### 📄 Example Response:

```json
{
    "ok": true,
    "result": [
        {
            "command": "search",
            "description": "🔍 Search for partner"
        },
        {
            "command": "stop",
            "description": "🚩 Stop current dialog"
        },
        {
            "command": "next",
            "description": "🆕 Stop current dialog and search for new partner"
        }
    ]
}
```

## 🛠️ Installation

### Prerequisites

* **Node.js 18+**
* **Wrangler 4+**
* Telegram Bot Token

### Installation Steps

1. **Clone Repository and Install Dependencies**

```bash
git clone https://github.com/yourname/AnonChatBot.git
cd AnonChatBot
npm install
```

2. **Local Environment Configuration**

Create a secure `.dev.vars` file (ensure it's excluded from version control):

```env
TELEGRAM_BOT_TOKEN=<your-token>
```

### 🔑 Obtaining Your Telegram Bot Token

* Visit Telegram's [BotFather](https://t.me/BotFather).
* Send `/newbot` command and copy the generated token.
* Place this token into `.dev.vars` for local use and securely manage it for production.

## 🧪 Local Debugging

### Set Up ngrok (Initial Configuration)

```bash
ngrok config add-authtoken <token>
```

### Run the Worker Locally

```bash
wrangler dev
```

*The default port is `8787`.*

### Expose Local Worker with ngrok

```bash
ngrok http 8787
```

### Configure Telegram Webhook

Set webhook using Telegram API:

```http
POST https://api.telegram.org/bot<token>/setWebhook?url=<ngrok-url>
```

## 🚢 Production Deployment

### Securely Manage Secrets

* Go to the Cloudflare Dashboard:

  * **Workers & Pages** > Your Worker
  * **Settings** > **Variables and Secrets**
  * Add your `TELEGRAM_BOT_TOKEN` secret.

### Publish Your Worker

```bash
wrangler publish
```

### Configure Production Webhook

Set up your webhook via Telegram API with the deployed worker URL.

## 🤝 Contributing

* Fork the repository.
* Create a new feature branch.
* Commit your enhancements clearly.
* Open a descriptive Pull Request.

---

🎉 **Happy chatting and happy coding!**
