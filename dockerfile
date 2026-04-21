FROM node:22-alpine

WORKDIR /app

# Dependencies
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean

# Barcha kodni nusxa ko'chirish
COPY . .

# Prisma generatsiya
RUN npx prisma generate

# Build (dist papkasi yaratiladi)
RUN yarn build

# Debug uchun: dist papkasi borligini tekshirish
RUN ls -la dist

EXPOSE 4000

# Eng to'g'ri va ishonchli ishga tushirish
CMD ["node", "dist/main.js"]