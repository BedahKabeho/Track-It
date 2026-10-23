# Use Node.js 22 as the base image for our Next.js application.
FROM node:22-alpine

# Set /app as the working directory inside the container.
WORKDIR /app

# Copy package.json and package-lock.json into the container.
# These files contain our frontend dependencies.
COPY package*.json ./

# Install the exact dependencies from package-lock.json.
RUN npm ci

# Copy the remaining frontend project files into the container.
COPY . .

# Document the port used by our Next.js application.
EXPOSE 3000

# Start the Next.js development server.
# 0.0.0.0 allows access from outside the container.
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]