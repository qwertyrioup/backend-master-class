#----------- STAGE 1 : Build the application ----------------
FROM node:20-alpine as builder


WORKDIR /app

COPY package*.json ./


RUN npm ci


COPY . .


RUN npm run build


#----------- STAGE 2 : Run the application ----------------
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist


EXPOSE 3000

ENV PORT=3000
CMD ["npm", "run", "start"]

















