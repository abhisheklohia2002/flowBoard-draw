FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

COPY . .

RUN bun build src/server.ts --outfile server

EXPOSE 3000

CMD ["./server"]