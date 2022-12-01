const userModel = require('../models/userModel')
const boardModel = require('../models/boardModel')
const validator = require('../utils/validator')
const todoModel = require('../models/taskModel')

const createTask = async function (req, res) {
    try {
        let boardId = req.params.boardId
        let requestBody = req.body
        let userIdFromToken = req.userId

        //Extract Body
        let { task, status } = requestBody

        //Validations for boardId
        if (!validator.isValidObjectId(boardId)) {
            return res.status(400).send({ status: false, message: "Invalid boardId in params." })
        }

        if (!validator.isValid(boardId)) {
            return res.status(400).send({ status: false, message: `${boardId} is not a valid board id.` })
        }

        //requestBody validation
        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide user Detaills" })
        }

        if (!validator.isValid(task)) {
            return res.status(400).send({ status: false, message: `Plaese provide task name.` })
        }

        //searching board document
        const findBoard = await boardModel.findOne({ _id: boardId, isDeleted: false })
        if (!findBoard) {
            return res.status(400).send({ status: false, message: `${boardId} is not present` })
        }

        //Authorization for user
        if (findBoard.userId.toString() != userIdFromToken) {
            return res.status(400).send({ status: false, message: `Unauthorized access! Owner info doesn't match` })
        }

        let objForTaskCreation = {}
        objForTaskCreation['boardId'] = boardId

        //searching task in DB to avoid redundancy.
        const searchTask = await todoModel.findOne({ task: task })
        if (searchTask) {
            return res.status(400).send({ status: false, message: `${task} already exists` })
        }

        objForTaskCreation['task'] = task

        if (requestBody.hasOwnProperty('status')) {

            if (!validator.isValid(status)) {
                return res.status(400).send({ status: false, message: `please provide valid status name.` })
            }

            if (!validator.isValidStatus(status)) {
                return res.status(400).send({ status: false, message: `status must be either 'Todo', 'Doing' or 'Done'.` })
            }

            objForTaskCreation['status'] = status
        }

        const finalTaskData = await todoModel.create(objForTaskCreation)
        return res.status(201).send({ status: true, data: finalTaskData })
    } catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}

const getTaskById = async function (req, res) {
    try {
        let boardId = req.params.boardId
        let taskId = req.params.taskId

        //validation fos boardId
        if (!validator.isValidObjectId(boardId)) {
            return res.status(400).send({ status: false, message: "Invalid boardId in params." })
        }
        if (!validator.isValid(boardId)) {
            return res.status(400).send({ status: false, message: `${boardId} is not a valid user id or not present ` })
        }

        //validation for taskId
        if (!validator.isValidObjectId(taskId)) {
            return res.status(400).send({ status: false, message: "Invalid boardId in params." })
        }
        if (!validator.isValid(taskId)) {
            return res.status(400).send({ status: false, message: `${boardId} is not a valid user id or not present ` })

        }

        const findBoard = await boardModel.findOne({ _id: boardId, isDeleted: false })
        if (!findBoard) {
            return res.status(400).send({ status: false, message: `${boardId} is not present` })
        }

        const searchTask = await todoModel.findOne({ _id: taskId, isDeleted: false })
        if (!searchTask) {
            return res.status(400).send({ status: false, message: `Task doesn't exists by ${taskId}.` })
        }

        return res.status(200).send({ status: true, data: searchTask })
    } catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }

}

const updateTask = async function (req, res) {
    try {
        let boardId = req.params.boardId
        let taskId = req.params.taskId
        let requestBody = req.body
        let userIdFromToken = req.userId

        //Validation for boardId
        if (!validator.isValidObjectId(boardId)) {
            return res.status(400).send({ status: false, message: "Invalid boardId in params." })
        }

        //validation for task Id
        if (!validator.isValidObjectId(taskId)) {
            return res.status(400).send({ status: false, message: "Invalid taskId in params." })
        }

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: `Request body cannot be empty.` })
        }

        const findBoard = await boardModel.findOne({ _id: boardId, isDeleted: false })
        if (!findBoard) {
            return res.status(400).send({ status: false, message: `${boardId} is not present` })
        }

        //Authorization
        if (findBoard.userId.toString() != userIdFromToken) {
            return res.status(400).send({ status: false, message: `Unauthorized access! Owner info doesn't match` })
        }

        const findTaskDoc = await todoModel.findOne({ _id: taskId, isDeleted: false })
        const taskStatus = findTaskDoc.status

        if (!findTaskDoc) {
            return res.status(404).send({ status: false, message: `Task doesn't exists by ${taskId}` })
        }
        if (taskStatus === "Done") {
            return res.status(400).send({ status: false, message: `Cannot update,because task is already in Done status.` })
        }

        let obj = {}

        //extract body
        const { task, status } = requestBody

        if (!validator.validString(task)) {
            return res.status(400).send({ sttaus: false, message: `Please provide task name.` })
        }
        if (task) {
            obj['task'] = task;
        }

        if (!validator.validString(status)) {
            return res.status(400).send({ status: false, message: `status cannot be empty.` })
        }
        if (status) {
            if (!validator.isValidStatus(status)) {
                return res.status(400).send({ status: false, message: `status should be either 'Todo','Doing' or 'Done'.` })
            }
            obj['status'] = status
        }

        const updateData = await todoModel.findOneAndUpdate({ _id: taskId }, obj, { new: true })

        return res.status(200).send({ status: true, data: updateData })
    } catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}

const deleteTaskById = async function (req, res) {
    try {
        let boardId = req.params.boardId
        let taskId = req.params.taskId
        let userIdFromToken = req.userId

        //validation for boardId
        if (!validator.isValidObjectId(boardId)) {
            return res.status(400).send({ status: false, message: "Invalid boardId in params." })
        }

        const findBoard = await boardModel.findOne({ _id: boardId, isDeleted: false })

        if (findBoard.userId.toString() != userIdFromToken) {
            return res.status(400).send({ status: false, message: `Unauthorized access! Owner info doesn't match` })
        }

        if (!findBoard) {
            return res.status(400).send({ status: false, message: `${boardId} is not present or alredy deleted` })
        }

        if (!validator.isValidObjectId(taskId)) {
            return res.status(400).send({ status: false, message: "Invalid taskId in params." })
        }

        const findTask = await todoModel.findOne({ _id: taskId, isDeleted: false })

        if (!findTask) {
            return res.status(400).send({ status: false, message: `${taskId} doesn't exists or has been already deleted` })
        }

        await todoModel.findOneAndUpdate({ _id: taskId }, { isDeleted: true }, { new: true })

        return res.status(204).send({ status: false, message: "Task deleted successfully"})
    } catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}


module.exports = {
    createTask, getTaskById, updateTask, deleteTaskById
}