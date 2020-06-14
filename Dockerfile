FROM node:13-alpine

COPY . /code
WORKDIR /code

RUN npm install
RUN npm run build

CMD ["npm", "run", "serve"]