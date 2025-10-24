# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json ./
COPY package-lock.json ./

# Install any needed packages
RUN npm ci --production

# Copy the rest of the application's source code
COPY . .

# Make port 3007 available to the world outside this container
EXPOSE 3007

# Define the command to run your app
CMD ["node", "server.js"]



