# log-analyzer

It shows parallel logs that generated by PROCESS WARP with fluentd.

## Get start

* Setup PostgreSQL and create schema, create table according to etc/schema.sql.
* Output PORCESS WARP's log, save it to PostgreSQL by fluentd.
* Copy etc/config.sample.json to etc/config.json, and edit it.
* Install require modules by npm.

```sh
$ cd <checkout dir>/src
$ npm install
```

* Launch application with Node.js
```sh
$ node index.js
```

* Access to ```http://<hostname>:3000/```, and you can search logs by keyword!

## Licence

MIT
