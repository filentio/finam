FROM node:22-alpine

WORKDIR /web

COPY package.json package-lock.json ./
# npm ci is stricter and can fail if lockfile differs; for local dev we prefer a more forgiving install.
RUN npm install --no-audit --no-fund

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]

