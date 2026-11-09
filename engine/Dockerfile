FROM node:22-alpine
WORKDIR /app
COPY . .
ENV HOST=0.0.0.0
EXPOSE 8787
USER node
CMD ["node","server.mjs"]
