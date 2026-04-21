FROM node:22-alpine

WORKDIR /app

# Package'larni o'rnatish
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean

# Barcha kodni copy qilish
COPY . .

# Prisma client generatsiya qilish
RUN npx prisma generate

# Build qilish
RUN yarn build

EXPOSE 4000

# Productionda ishga tushirish (to'g'ri yo'l)
CMD ["sh", "-c", "npx prisma db push && node dist/main.js"]