# Build the Angular App
# basically, this compiles the Angular project to static HTML and js files.
FROM node:latest as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run build -- --configuration production && \
    echo " Listing /app/dist:" && ls -al /app/dist && \
    echo " Listing /app/dist/client:" && ls -al /app/dist/client && \
    echo " Listing /app/dist/client/browser:" && cat /app/dist/client/browser

# Serve these static files with NGINX.
FROM nginx:1.21.6-alpine
COPY --from=build /app/dist/client /usr/share/nginx/html
RUN ls -al /usr/share/nginx/html && cat /usr/share/nginx/html/index.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
