# Rewind

## Overview
Rewind is a media backlog app for users to keep track of movies and TV shows they're interested in. Beyond just storing what they want to watch, users can also view items available on their streaming services and accumulate a dedicated watchlist by marking movies/shows that they've completed.

### Tech Stack:
| Frontend | Backend |
|----------|----------|
| React | Node.js |
| Vite | Express |
| Tailwind CSS | MySQL |

## Features

- Discover movies and TV shows through an API provided by The Movie Database (TMDB)
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
cd CS35L-Project
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
```

Refer to the `.env.example` file to see this pattern as well.

| Variable | Required |
|----------|----------|
| `DATABASE_URL` | Yes | 
| `TMDB_API_KEY` | Yes |
| `ACCESS_TOKEN_SECRET` | Optional |
| `REFRESH_TOKEN_SECRET` | Optional |

#### Database URL
This is the MySQL connection string that actually links the app to the database. For a local install, the typical format is
```
DATABASE_URL=mysql://root:yourpassword@localhost:3306/backlog_db
```

#### JWT Secret Keys (Optional)
For testing purposes, you may want to sign your own JSON web tokens. For that, you need secret access token and refresh token keys.

In terminal, run the following two commands:
- `node`
- `require('crypto').randomBytes(64).toString('hex')`

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
```
cd backend
npm install
npm run devStart
```

### Start the Frontend

Run the following commands in your terminal:
```
cd frontend
npm install
npm run dev
```

The app should be available at `http://localhost:5173`.

## Team

- Kairi Ho
- Michael Zheng
- Yifan Fang
- Ethan Jin

Made for CS 35L - Software Construction at UCLA, taught by Professor Tobias Dürschmid.
