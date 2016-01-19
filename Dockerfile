FROM node:4.2

ADD package.json package.json
RUN npm install
ADD . .

EXPOSE 8080
CMD ["node", "ui.js"]
