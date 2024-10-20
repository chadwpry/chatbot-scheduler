# Scheduling Assistant

## Overview

This is a simple scheduling assistant that can be used to schedule appointments. It is built with Next.js, Shadcn/UI, Postgres, Drizzle, Zod, Winston, OpenAI, AI SDK from Nextjs, and a few other odds and ends.

The primary goal of this project is to learn how to build a scheduling assistant. The interface to the assistant is a chat interface that allows the user to ask about current booking windows and scheduling a booking window.

## Getting Started

*Notes on docker-compose*

I've created a Dockerfile and a docker-compose.yaml file to make it easier to setup the app. It should be as simple as running `docker compose up` and it will build the app and run it in a container.

However, I noticed the container is not talking to the database. I assume this has to do with the DATABASE_URL environment variable in the .env file not referencing host.docker.internal or similar. I've not had a chance to test it throughly, so beware there be dragons.

In the meantime, starting the database via docker-compose and running the app via pnpm run dev, does work just fine.

### Configuration

1. Copy the .env.example file to .env
2. Add a DATABASE_URL (the default should work with docker-compose)
3. Supply an OpenAI API key

### Database

Use the command below to start the database.

```bash
docker-compose up db
```

### Seeding Booking Windows

Seed your database with a set of predefined booking windows. They can be found in `/src/db/seed.json`

```bash
pnpm run seed
```

### Application

Finally start your local application with the the following.

```bash
pnpm run dev
```

### Viewing the Application

Open [http://localhost:3000](http://localhost:3000) with your browser to view the chat interface. A text input can be found at the bottom of the page for you to ask questions.
