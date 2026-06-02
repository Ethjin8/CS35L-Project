# Rewind
Rewind is a media backlog app for users to keep track of movies and TV shows they're interested in. Beyond just storing what they want to watch, users can also view items available on their streaming services and accumulate a dedicated watchlist by marking movies/shows that they've completed.

### Tech Stack
| Frontend | Backend |
|----------|----------|
| React | Node.js |
| Vite | Express |
| Tailwind CSS | MySQL |

## Features

- Discover movies and TV shows through an API provided by [The Movie Database (TMDB)](https://www.themoviedb.org/?language=en-US)
- Add movies and TV shows to your backlog
- Mark items as "Completed" to build a watch history
- Select your current streaming services, and find items in the backlog OR your search page that are available for streaming
- Receive a random backlog recommendation whenever you reload the page

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MySQL](https://www.mysql.com/) (v8.4+)

## Setup Guide

### 1. Clone the repository

```bash
git clone https://github.com/Ethjin8/Rewind.git
cd Rewind
```

### 2. Database setup

Install MySQL on your computer through the terminal with the following commands:
- Mac: `brew install mysql`
- Windows: Download the installer from https://dev.mysql.com/downloads/installer/
- Linux: `sudo apt install mysql-server`

Run `mysql --version` to check that the client is installed.

The schema.sql file contains the necessary commands to set up your local database in MySQL. The primary database will be called `backlog_db`, with four tables: `users`, `movies_shows`, `streaming_services`, and `refresh_tokens`. Run the following command to initialize the database:

```
mysql -u root -p < schema.sql
```

### 3. Environment variables

Create a `.env` file in the `backend/` directory with the folowing variables:
```
DATABASE_URL=
TMDB_API_KEY=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
PORT=3000
NODE_ENV=development
```

Refer to the `.env.example` file to see this pattern as well.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | MySQL connection string |
| `TMDB_API_KEY` | Yes | API key from TMDB |
| `ACCESS_TOKEN_SECRET` | Yes | JWT access signing secret |
| `REFRESH_TOKEN_SECRET` | Yes | JWT refresh signing secret |
| `PORT` | Optional | Backend server port (default `3000`) |
| `NODE_ENV` | Optional | Environment mode (default `development`) |

#### Database URL
This is the MySQL connection string that actually links the app to the database. For a local install, the typical format is
```
DATABASE_URL=mysql://root:yourpassword@localhost:3306/backlog_db
```

#### JWT Secret Keys
These are used to sign and verify JSON web tokens for authentication.

In terminal, run the following commands:
- `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

This gives you a random 64-byte integer, which you can use to sign your JWT tokens. Run the pair of commands twice to get ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET, then paste those values into your .env file.

### 4. Obtaining a TMDB API Key

Create an account or log in on [TMDB](https://www.themoviedb.org/?language=en-US).

Once you do so, create API for "Personal Use Only" [here](https://www.themoviedb.org/settings/api/request?language=en-US).

Once API is created, you can find the API Key [here](https://www.themoviedb.org/settings/api?language=en-US).
  - Note: DO NOT use the "API Read Access Token", use the one labeled "API Key"

Replace your_tmdb_api_key_here in the .env file with your actual API Key.

## Usage

### Start the Backend

Run the following commands in your terminal:
```bash
cd backend
npm install
npm run devStart
```

### Start the Frontend

Open a second terminal window and run:
```bash
cd frontend
npm install
npm run dev
```

The app should be available at `http://localhost:5173`.

## Troubleshooting

#### `DATABASE_URL is required`
Make sure you created `backend/.env` and added a valid `DATABASE_URL`.

#### `Access denied for user 'root'`
Your MySQL password in `DATABASE_URL` is incorrect. Double-check the password in:
```
DATABASE_URL=mysql://root:your_mysql_password@localhost:3306/backlog_db
```

#### `Unknown database 'backlog_db'`
The schema hasn't been loaded. Run the database setup again:
```bash
mysql -u root -p < schema.sql
```

#### Port already in use
If port `3000` is taken, set a different port in `backend/.env`:
```
PORT=3001
```

## Run Tests

The project includes end-to-end tests using [Playwright](https://playwright.dev/) that cover adding to backlog, marking as watched, removing from backlog, and backlog recommendations.

Before running, make sure MySQL is running and `backend/.env` is configured. The script handles starting and stopping the backend and frontend automatically.

```bash
bash scripts/e2e-tests.sh
```

## Team

- Kairi Ho
- Michael Zheng
- Yifan Fang
- Ethan Jin

Made for CS 35L - Software Construction at UCLA, taught by Professor Tobias Dürschmid.
