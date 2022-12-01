const express = require('express');
const router = express.Router();
const middleware = require('../middleware/auth')
const userController = require('../controllers/userController')
const boardController = require('../controllers/boardController')
const taskController = require('../controllers/taskController')


//User's APIs -> Sign up, Login and Enter OTP.
router.post('/SignUp', userController.signUp)
router.post('/login', userController.login)

//Board's APIs -> Create board, Fetch Board by its Id, Update Board and delete Board.
router.post('/board/:userId', middleware.userAuth, boardController.createBoard)
router.get('/board/:boardId', middleware.userAuth, boardController.getboardById)
router.put('/board/:boardId', middleware.userAuth, boardController.updateBoard)
router.delete('/board/:boardId', middleware.userAuth, boardController.deleteBoardById)

//Task's APIs -> Create task, fetch Task By Id, Update the task and delete task.
router.post('/board/:boardId/task', middleware.userAuth, taskController.createTask)
router.get('/board/:boardId/task/:taskId', middleware.userAuth, taskController.getTaskById)
router.put('/board/:boardId/task/:taskId', middleware.userAuth, taskController.updateTask)
router.delete('/board/:boardId/task/:taskId', middleware.userAuth, taskController.deleteTaskById)

module.exports = router
