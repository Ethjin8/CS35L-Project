# Rewind
Rewind is a media backlog app for movies and TV show fans to keep track of their watchlist and see when a movie
becomes available on their streaming service, as well as keep track of their watch history.
with a React/Vite frontend, an Express backend, a MySQL database, and TMDB for movie data.

## Key Features

Write later.

## Prerequisites

### Clone the repository:

##### `git clone https://github.com/Ethjin8/Rewind.git`

##### `cd CS35L-Project`

### Set Up Backend:

##### `cd backend`

1. Database Setup: MySQL

Run `mysql --version` in your terminal to check that the client is installed.

If not, install MySQL on your computer with the following commands:
- Mac: `brew install mysql`
- Windows: Download the installer from https://dev.mysql.com/downloads/installer/
- Linux: `sudo apt install mysql-server`

Again, run `mysql --version` in your terminal to check that the client is installed.

The schema.sql file contains the necessary commands to set up your local database in MySQL. The primary database will be called `backlog_db`. To run it, simply type `mysql -u root -p < schema.sql`.
If that doesn't work, just simply run `mysql -u root -p` then enter your mysql password. Then, `source schema.sql;`
In the .env file in backend folder, replace DATABASE_URL's password with your real MySQL password.

2. API Setup

Create an account or log in on TMDB: https://www.themoviedb.org/?language=en-US
After logged in, create API for "Personal Use Only": https://www.themoviedb.org/settings/api/request?language=en-US
Once API is created, you can find the API Key here (NOT API Read Access Token): https://www.themoviedb.org/settings/api?language=en-US
Replace your_tmdb_api_key_here in .env file with your API Key.

3. (Optional for testing) Get JWT Token Secret Keys:

In terminal, run the following two commands:
- `node`
- `require('crypto').randomBytes(64).toString('hex')`

This gives you a random 64-byte integer, which you can use to sign your JWT tokens. Run the pair of commands twice to get ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET, then paste those values into your .env file.

## Run Backend

Open a new terminal. Then type:
##### `cd Backend`

##### `npm install`

##### `npm run devStart`

## Run Frontend

Open a new terminal. Then type:

##### `cd frontend`

##### `npm install`

##### `npm run dev`

##### The frontend should run on:
```text
http://localhost:5173
```

Open that URL in your browser.

## Run Tests

Pre-setup: MySQL running, .env set up, node.js installed

In terminal run:

#### 'bash scripts/e2e-tests.sh'
