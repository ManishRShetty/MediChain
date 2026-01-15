# Stage 1 - Build React App
FROM node:14-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

ENV backendUrl=http://172.17.0.4:3000
# Build the React app
RUN npm run build

# Stage 2 - Serve React App with Nginx
FROM nginx:alpine

# Copy build files to Nginx public directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Expose port 80 (default port for HTTP)
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
