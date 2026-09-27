FROM node:18-alpine AS builder

WORKDIR /app/movies

# Install dependencies
COPY app/movies/package*.json ./

RUN npm install

# Copy the rest of the application code
COPY app/movies/ .

# Build arguments for API key
ARG VITE_TMDB_KEY
ENV VITE_TMDB_KEY=${VITE_TMDB_KEY}

RUN npm run build

#Serve
FROM nginx:alpine

# Copy the built application from the builder stage to the nginx html directory
COPY --from=builder /app/movies/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]