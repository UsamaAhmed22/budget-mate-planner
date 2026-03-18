FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lockb ./

RUN bun install --no-frozen-lockfile --ignore-scripts

COPY . .
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN bun run build

FROM nginx:1.27-alpine AS runtime
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]