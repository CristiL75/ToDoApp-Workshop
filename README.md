# Requirements

Build a TODO REST application, that allows the user to perform the following opperations:

- list tasks
- create task
- delete task
- mark task as complete
- execute a task after a specified delay
- execute a task at a specific time

1. Use only nodejs core modules
2. Handle URL Parameters
3. Handle Request Headers
4. Make the application data persistent, by storing it on the disk
5. Implement basic logging functionality
6. Use the `debugger` for development
7. Handle edge cases like: bad input, or missing fields, invalid query params
8. Separate concerns: router, controller, model

# Run

```bash
node server.js
```

# Testing

List: curl -i http://localhost:3000/todos

Create (bad input): curl -i -H "Content-Type: application/json" -d '{}' http://localhost:3000/todos

Create (OK):
curl -i -H "Content-Type: application/json" -d '{"title":"Buy milk","done":false}' http://localhost:3000/todos

Get by id: curl -i http://localhost:3000/todos/<ID_FROM_CREATE>

Delete: curl -i -X DELETE http://localhost:3000/todos/<ID_FROM_CREATE>

Method not allowed: curl -i -X PUT http://localhost:3000/todos

Update: curl -i -X PATCH -H "Content-Type: application/json" -d '{"title":"Buy milk","done":false}' http://localhost:3000/todos/<ID_FROM_CREATE>
