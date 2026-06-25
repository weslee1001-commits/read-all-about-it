FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm install --omit=dev
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "index.js"]
