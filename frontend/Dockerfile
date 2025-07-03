# Purpose: Defines the Docker image for the React frontend application, served by Nginx.

# --- Stage 1: Build the React application ---
# Use an official Node.js image as a parent image for the build stage.
# Choose an LTS version (e.g., 18, 20).
FROM node:20-alpine as builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
# This takes advantage of Docker layer caching. If these files haven't changed,
# npm install/yarn install won't re-run unless necessary.
COPY package.json package-lock.json ./
# If using yarn:
# COPY package.json yarn.lock ./

# Install dependencies
RUN npm install
# If using yarn:
# RUN yarn install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Build the application for production
RUN npm run build
# This should create a /app/dist directory with your static files.

# --- Stage 2: Serve the application with Nginx ---
# Use an official Nginx image as a parent image.
# 'alpine' versions are smaller.
FROM nginx:1.25-alpine

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration file from your project
# Assumes nginx.conf is in the same directory as this Dockerfile (or relative path if elsewhere)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output from the 'builder' stage to Nginx's web root directory
# Default Nginx web root is /usr/share/nginx/html
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (which Nginx listens on by default in the container)
EXPOSE 80

# Command to run Nginx in the foreground when the container starts
CMD ["nginx", "-g", "daemon off;"]