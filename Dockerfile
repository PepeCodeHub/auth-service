FROM oven/bun:1 AS base
WORKDIR /app


FROM base AS install
WORKDIR /temp
COPY package.json bun.lockb ./
RUN bun install

FROM install AS publish
WORKDIR /publish
COPY . .

FROM base AS release
WORKDIR /app
COPY --from=publish /publish .
COPY --from=install /temp/node_modules ./node_modules

# Install procps to get pgrep
RUN apt-get update && apt-get install -y procps

COPY healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh

EXPOSE 3000
CMD ["bun", "start"]