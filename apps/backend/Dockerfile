FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Update npm to the latest version
RUN npm install -g npm@10.8.2

# Install NestJS dependencies
RUN npm install



# Copy the rest of your application code to the working directory
COPY . .

# Expose the port that the NestJS application will run on
EXPOSE 4000

# Run NestJS application
CMD ["npm", "run", "start:dev"]