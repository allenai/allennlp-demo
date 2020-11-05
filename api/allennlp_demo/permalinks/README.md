The permalinks service can be run from the root of the repository. (See
README.md there.)

When running, you can POST to the service like this:

```
% curl -H 'Content-Type: application/json;charset=utf-8' -d '{"request_data":{"foo":"bar"}}' http://localhost:8001/
"MQ=="
```

The response `"MQ=="` is an identifier for the POSTed request data.

This request data can be retrieved again like this:

```js
% curl http://localhost:8001/MQ==
{
  "model_id": null, 
  "model_name": null, 
  "request_data": {
    "foo": "bar"
  }, 
  "task_name": null
}
```

To access the database, use psql like this:

```
% psql -h localhost -p 5555 -U postgres demo
psql (12.3, server 11.7)
Type "help" for help.

demo=# select * from queries;
 id | model_name |  request_data  |         timestamp          | requester  | model_id | task_name 
----+------------+----------------+----------------------------+------------+----------+-----------
  1 |            | {"foo": "bar"} | 2020-11-05 18:42:57.918671 |            |          | 
(1 row)
```
