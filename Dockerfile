
FROM node:22.21.1-alpine3.22 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev


FROM node:22.21.1-alpine3.22 AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs \
 && adduser -S nodejs -u 1001
COPY --from=deps /app/node_modules ./node_modules
COPY . .
USER nodejs
EXPOSE 3000
CMD ["npm", "start"]
