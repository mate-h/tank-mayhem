# tank-mayhem

A multiplayer web physics game inspired by Tank Trouble

<img src="./tank-mayhem.png" alt="Thumbnail" width="520" />

*Note*: This is a work in progress as you can probably tell.


## Production

[tankmayhem.com](https://tankmayhem.com)

## Description

This project was heavily inspired by a game me and my buddies used to kill time with in class, called Tank Trouble (also known as AZ Tank Game). It is definitely from the early Flash days of the internet, and you were supposed to share one keyboard and one computer to play against each other. I decided to take it a step further and recreate the game by taking advantage of the latest capabilities of the web today.

## Installation

Install Docker CLI and run

```bash
docker-compose --env-file ./config/.env.prod up -d
```

For local development server
```bash
docker-compose --env-file ./config/.env.dev up -d
```
