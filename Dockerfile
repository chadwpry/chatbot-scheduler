# Use a Node.js base image
FROM node:20

RUN apt-get update -y
RUN apt-get install iputils-ping -y

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
RUN corepack install -g pnpm@latest

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json pnpm-lock.yaml ./
COPY .env.production .env

# Install dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN pnpm run build

# Expose the port Next.js runs on
EXPOSE 3000

# Start the Next.js app in production mode
CMD ["pnpm", "run", "start"]
