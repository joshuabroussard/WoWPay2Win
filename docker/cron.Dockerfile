# -----------------------------------------------------------------------------
FROM node:14 as builder
# -----------------------------------------------------------------------------

WORKDIR /app

# Install dependencies
COPY tsconfig.json              ./
COPY yarn.lock package.json     ./
RUN yarn install

# Build app
COPY build/                     ./build/
COPY src/@types/                ./src/@types/
COPY src/common/                ./src/common/
COPY src/cron/                  ./src/cron/
RUN --mount=type=secret,id=GIT_HASH \
    yarn buildCron

# -----------------------------------------------------------------------------
FROM node:14-alpine
LABEL org.opencontainers.image.source https://github.com/Trinovantes/WoWPay2Win
# -----------------------------------------------------------------------------

ENV NODE_ENV 'production'
WORKDIR /app

# Install dependencies
COPY yarn.lock package.json     ./
RUN yarn install

# Mount points
RUN mkdir -p                    ./src/web/assets/data
RUN mkdir -p                    ./dist/web/data

# Copy app
COPY --from=builder /app/dist/  ./dist/

RUN echo "5 * * * * cd /app && yarn fetchAuctions" >> /etc/crontabs/root
CMD crond -f
