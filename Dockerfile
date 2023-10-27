# Use Node.js 20.9.0 as the base image
FROM node:20.9.0

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and yarn.lock files to the container
COPY package.json yarn.lock ./

# Install the dependencies using Yarn
RUN yarn install

# Copy the rest of the application files to the container
COPY . .

# Expose port 3000 (if your application uses this port)
EXPOSE 3000

# Start the application
CMD [ "yarn", "dev" , "--host"]