# Reset Flow Bot

A Telegram bot designed to guide users through various breathing exercises.

[**Try the Bot Live ➔**](https://t.me/ResetFlowBot)

**Infrastructure:** Hosted on private Cloud VPS (Ubuntu 22.04) using Docker orchestration.

## Technologies Used

* **Node.js & TypeScript**: Core runtime and type-safe development.
* **Telegraf**: Modern Telegram bot framework.
* **MongoDB**: NoSQL database (Self-hosted via Docker).
* **Mongoose**: MongoDB object modeling.
* **i18next**: Multi-language support (EN, RU).
* **Docker & Docker Compose**: Containerization and service orchestration.

## Features

* **Guided Breathing**: Interactive patterns for relaxation and focus.
* **Self-Hosted DB**: Complete privacy and control over user statistics.
* **Multi-language**: Seamless switching between English, Russian, and Hebrew.
* **High Availability**: Automated restart policies via Docker.

## Project Structure

```text
.
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package-lock.json
├── package.json
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

**Clone the repository:**
   ```bash
   git clone https://github.com/21apr/reset-flow-bot.git
   cd reset-flow-bot
   ```

### 1. Local Development (Traditional npm)
Used for writing code and testing features on your local machine.

* **Install dependencies:**
    ```bash
    npm install
    ```
    *Note: This installs all `dependencies` and `devDependencies` (like TypeScript, nodemon, types) needed for compiling and debugging.*
* **Configure environment:** Create a `.env` file based on `.env.example`.
* **Run in dev mode:**
    ```bash
    npm run dev
    ```

### 2. Production Deployment (Docker)
Used for running the bot on the VPS. This method ensures the environment is identical regardless of the server.

* **How it works:**
    Instead of running `npm install` manually on the server, we use `docker compose up --build`.
    * **Optimization:** Inside the `Dockerfile`, we use `npm install --production`. This skips heavy development tools (like compilers or test runners), making the container smaller, faster, and more secure.
    * **Isolation:** You don't need to install Node.js or MongoDB on the server's OS. Docker handles everything inside isolated containers.

* **Deploy command:**
    ```bash
    # Pull latest changes and rebuild containers
    git pull && docker compose up -d --build
    ```

## Maintenance & Logs

To monitor the bot's health on the server:

* **Check logs:** `docker logs -f reset_flow_bot`
* **Check status:** `docker ps`
* **Restart services:** `docker compose restart`

---

## Environment Variables

Key variables required in your `.env` file:
* `BOT_TOKEN`: Your Telegram Bot Father token.

* `MONGO_INITDB_ROOT_USERNAME`: Admin username (used by Docker to initialize the DB).

* `MONGO_INITDB_ROOT_PASSWORD`: Admin password (used by Docker to initialize the DB).

* `MONGODB_URI`: Connection string for your external database (Atlas). Optional

        mongodb+srv://<user>:<password>@cluster... /reset-flow-bot