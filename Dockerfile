# ------- FRONTEND --------
# ----- Stage 1: Build -----
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY client/package*.json ./
RUN npm install

# Copy the rest of the frontend and build
COPY client/ ./
RUN npm run build

# ----- Stage 2: Serve -----
FROM node:18-alpine AS production
WORKDIR /app

# Install 'serve' only
RUN npm install -g serve

# Copy only the built static files from the build stage
COPY --from=build /app/build ./build

# Expose port 3000
EXPOSE 3000

# Serve the app
CMD ["serve", "-s", "build", "-l", "3000", "-n"]