FROM node:18-alpine AS nextjs-build

WORKDIR /app

COPY package*.json ./
RUN npm install

ENV NODE_ENV=development

CMD ["npm", "run", "dev"]
