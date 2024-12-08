# Use the official Nginx unprivileged image as the base image
FROM docker.io/nginxinc/nginx-unprivileged:alpine

# Copy the game files to the Nginx HTML directory
COPY . /usr/share/nginx/html

# Expose port 8080 (default for unprivileged Nginx)
EXPOSE 8080

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]