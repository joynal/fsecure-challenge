FROM node:14.17.0

# Set a working directory
RUN mkdir /app
WORKDIR /app

# Copy application files
COPY . /app

# Install app dependencies
RUN npm ci

# build project
RUN npm run build

CMD ["node", "dist/main.js"]
