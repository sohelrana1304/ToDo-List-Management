## Project - ToDo List management

### key features
- This project consists of 11 APIs, 3 for Users, 4 for Boards and 4 for Tasks.
- First of all,We need to register/Sign up the user, then verify them via successfull login and then perform a two-step verification by sending them an OTP in their email Id.
- Next step would be to create Board by the authenticated users, the operations they'll be able to perform with their boards are : 
 1) Create Board
 2) Fetch their Boards details nby the board Id
 3) Update Baord
 4) Delete board
 - Final step is to list the tasks by the users itself. They can list their tasks and can work accordingly. There's a status of the task to be added as "Todo", "Doing" or "Done".
    - If the task is in "Todo" status then it can be updated or we can say it is live.
    - Same for the "Doing" status also.
    - But, If the task is in "Done" status, then nothing can be changed or updated on that specific task.
- Used JWT for authentication and authorization, also assigned iat and exp to the JWT token. Sended token to the header as `x-auth-key`.
- Created a branch named `Project/TodoList` and followed all the naming convention in order to convey my work efficiently.
 
## Phase I - User
 ### Model
 - User Model
 ```yaml
{
    enterName : {string, mandatory},
    enterEmail : {string, mandatory, unique},
    password : {String, mandatory , minLen = 8 , maxLen = 15},
      createdAt: {timestamp},
      updatedAt: {timestamp}
}
 ```
## User APIs 
### POST /signUp
- Create a user document from request body. Request body must contain Name, email and password.
- Save password in encrypted format. (used bcrypt library)
- __Response format__
  - _**On success**_ - Return HTTP status 201. Also return the user document. The response should be a JSON object like [this](#successful-response-structure)
  - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)
```yaml
{
    "status": true,
    "message": "User created successfully",
    "data": {
        "enterName": "John Doe",
        "enterEmail": "johndoe@mailinator.com",
        "password": "$2b$10$DpOSGb0B7cT0f6L95RnpWO2P/AtEoE6OF9diIiAEP7QrTMaV29Kmm",
        "_id": "6162876abdcb70afeeaf9cf5",
        "createdAt": "2021-10-10T06:25:46.051Z",
        "updatedAt": "2021-10-10T06:25:46.051Z",
        "__v": 0
    }
}
```

### POST /login
- Allow an user to login only with their email and password.
- On a successful login attempt return the userId and a JWT token contatining the userId, exp, iat.
- __Response format__
  - _**On success**_ - Return HTTP status 200 and JWT token in response body. The response should be a JSON object like [this](#successful-response-structure)
  - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)
```yaml
{
    "status": true,
    "message": "User login successfull",
    "data": {
        "userId": "6165f29cfe83625cf2c10a5c",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MTYyODc2YWJkY2I3MGFmZWVhZjljZjUiLCJpYXQiOjE2MzM4NDczNzYsImV4cCI6MTYzMzg4MzM3Nn0.PgcBPLLg4J01Hyin-zR6BCk7JHBY-RpuWMG_oIK7aV8"
    }
}
```

## Phase II - Board (_Protected routes_)
### Models
- Board Model
```yaml
{
    boardName : {String, mandatory, unique},
    userId : {ObjectId, ref to user's collection, mandatory},
    isDeleted : {Boolean, default : false},
    createdAt: {timestamp},
    updatedAt: {timestamp}
}
```
## Boards API 
### POST /board/:userId
- Create a board document from request body.
- RequestBody must contain Board name.
- __Response format__
  - _**On success**_ - Return HTTP status 201. Also return the board document. The response should be a JSON object like [this](#successful-response-structure)
  - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)

### GET /board/:boardId
- Returns Board details by Board id.
- __Response format__
  - _**On success**_ - Return HTTP status 200. Also return the board document. The response should be a JSON object like [this](#successful-response-structure)
  - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)

### PUT /board/:boardId
- Returns updated Board details after updating the Board document.
- Must check if the board exists or not (isDeleted : true/false),
- __Response format__
  - _**On success**_ - Return HTTP status 200. Also return the updated board document. The response should be a JSON object like [this](#successful-response-structure)
  - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)

  ### DELETE /board/:boardId
  - Delete a board by board id if it's not already deleted
- __Response format__
  - _**On success**_ - Return HTTP status 204. It won't send anything to the response body.
  - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)


## Phase III - Task
### Models
- Task Model
```yaml
{
    boardId : {ObjectId, refs to Board's collection, mandatory},
    task : {String, mandatory, unique},
    status : {String, default : "Todo"},
    isDeleted : {Boolean, default : false},
    createdAt: {timestamp},
    updatedAt: {timestamp}
}
```

## Task API (_Protected routes_)
### POST /board/:boardId/task
- List down all the tasks according to your choice.
- Must check if the board exists or not (isDeleted : true/false).
- Status should be "Todo" at initial stage.
- __Response format__
  - _**On success**_ - Return HTTP status 201. Also return the newly created task document. The response should be a JSON object like [this](#successful-response-structure)
  - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)
```yaml
{
    "status": true,
    "message": "Task created successfully",
    "data": {
        "boardId": "Pending works",
        "task": "have to complete github commits",
        "status": "Todo",
        "isDeleted": false,
        "_id": "6162876abdcb70afeeaf9cf5",
        "createdAt": "2021-10-10T06:25:46.051Z",
        "updatedAt": "2021-10-10T06:25:46.051Z",
        "__v": 0
    }
}
```

### GET /board/:boardId/task/:taskId
- Returns Task details by task id.
- __Response format__
  - _**On success**_ - Return HTTP status 200. Also return the task document. The response should be a JSON object like [this](#successful-response-structure)
  - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)

### PUT /board/:boardId/task/:taskId
- Returns updated task details after updating the task document.
- Must check if the task exists or not (isDeleted : true/false),
- __Response format__
  - _**On success**_ - Return HTTP status 200. Also return the updated task document. The response should be a JSON object like [this](#successful-response-structure)
  - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)

### DELETE /board/:boardId/task/:taskId
  - Delete a task by task id if it's not already deleted
- __Response format__
  - _**On success**_ - Return HTTP status 204. It won't send anything to the response body.
  - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)

## Response

### Successful Response structure
```yaml
{
  status: true,
  message: 'Success',
  data: {

  }
}
```
### Error Response structure
```yaml
{
  status: false,
  message: ""
}
```