FROM node:22-alpine

WORKDIR /web

# Some Windows/ISP/corporate networks MITM TLS and break npm's cert validation inside containers.
# For local dev we allow turning off strict SSL via build arg.
ARG NPM_STRICT_SSL=0
ARG NPM_REGISTRY=https://registry.npmjs.org/

COPY package.json package-lock.json ./
# npm ci is stricter and can fail if lockfile differs; for local dev we prefer a more forgiving install.
RUN if [ "$NPM_STRICT_SSL" = "0" ]; then npm config set strict-ssl false; npm config set registry http://registry.npmjs.org/; else npm config set registry "$NPM_REGISTRY"; fi \
  && npm config set fund false \
  && npm config set audit false \
  && npm install --no-audit --no-fund

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]

