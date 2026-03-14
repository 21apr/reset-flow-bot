# Reset Flow Bot

A Telegram bot designed to guide users through various breathing exercises.

[**Try the Bot Live ➔**](https://t.me/ResetFlowBot)
Hosted on Render with automated CI/CD.

## Technologies Used

*   **Node.js**: The runtime environment.
*   **TypeScript**: The programming language.
*   **Telegraf**: Telegram bot framework.
*   **Mongoose**: MongoDB object modeling tool.
*   **i18next**: Internationalization framework.
*   **GoogleGenAI**: Gemini API for AI integration.
*   **MongoDB**: Database for storing user data.

## Features

*   Guided breathing exercises with different patterns.
*   User statistics tracking.
*   Multi-language support (English, Russian, Hebrew).

## Project Structure

```text
.
├── .gitignore
├── package-lock.json
├── package.json
├── Procfile // need for work with Render
├── README.md
├── tsconfig.json
└── src
    ├── bot
    │   ├── features
    │   ├── keyboards
    │   └── utils
    ├── db
    │   └── mongoDB
    ├── shared
    │   ├── i18n
    │   └── utils
    └── index.ts
```

## Setup and Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/21apr/reset-flow-bot.git](https://github.com/21apr/reset-flow-bot.git)
   cd reset-flow-bot
   ```

2. **Install dependencies:**

    ```bash
    npm install
    ```
    Configure environment variables:
    Create a .env file in the root directory and fill in the values (see .env.example for reference).

3. **Run the bot:**

    Development:
        ```bash
        npm run dev
        ```

    Production:
        ```bash
        npm run start
        ```