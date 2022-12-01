const mongoose = require('mongoose')
const userModel = require('../models/userModel')
const boardModel = require('../models/boardModel')
const validator = require('../utils/validator')
const todoModel = require('../models/taskModel')


const createBoard = async function (req, res) {
    try {
        const requestBody = req.body
        const userId = req.params.userId

        //Extract body
        const { boardName } = requestBody

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide Details" })
        }

        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId in params." })
        }

        if (!validator.isValid(userId)) {
            return res.status(400).send({ status: false, message: `${userId} is not a valid user id or not present ` })
        }

        if (!validator.isValid(boardName)) {
            return res.status(400).send({ status: false, message: `please right board Name ` })
        }

        const findUser = await userModel.findOne({ _id: userId })
        if (!findUser) {
            return res.status(400).send({ status: false, message: `User doesn't exists by ${userId}` })
        }

        const isBoardNamePresent = await boardModel.findOne({ boardName: boardName })
        if (isBoardNamePresent) {
            return res.status(400).send({ status: false, message: `${boardName} Alredy present` })
        }

        const boardData = { boardName, userId }
        const board = await boardModel.create(boardData)

        return res.status(201).send({ status: true, data: board })
    } catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }

}

const getboardById = async function (req, res) {
    try {
        let boardId = req.params.boardId

        if (!validator.isValidObjectId(boardId)) {
            return res.status(400).send({ status: false, message: "Invalid boardId in params." })
        }

        const searchBoard = await boardModel.findOne({ _id: boardId, isDeleted: false })
        if (!searchBoard) {
            return res.status(400).send({ status: false, message: `${boardId} is not present` })
        }

        const findTodoList = await todoModel.find({ isDeleted: false })

        let taskArr = []
        for (i in findTodoList) {
            if (findTodoList[i].boardId.toString() === boardId) {
                taskArr.push(findTodoList[i])
            }
        }

        const board = searchBoard.toObject()
        board['task'] = taskArr

        return res.status(200).send({ status: true, data: board })
    } catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }


}

const updateBoard = async function (req, res) {
    try {
        let userIdFromToken = req.userId;
        let boardId = req.params.boardId;
        let requestBody = req.body;

        //Extract body
        const { boardName } = requestBody;

        if (!validator.isValidObjectId(boardId)) {
            return res.status(400).send({ status: false, message: "Invalid boardId in params." })
        }

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid requestBody." })
        }

        if (!validator.isValid(boardName)) {
            return res.status(400).send({ status: false, message: `Invalid board name in requestBody.` })
        }

        const findBoard = await boardModel.findOne({ _id: boardId, isDeleted: false })
        if (!findBoard) {
            return res.status(400).send({ status: false, message: `${boardId} is not present` })
        }

        //Authorization
        if (findBoard.userId.toString() != userIdFromToken) {
            return res.status(400).send({ status: false, message: `Unauthorized access! Owner info doesn't match` })
        }

        const updateBoardName = await boardModel.findOneAndUpdate({ _id: boardId }, { boardName: boardName }, { new: true })

        return res.status(200).json({ status: true, message: `Board name updated successfully.`, data: updateBoardName })
    } catch (err) {
        return res.status(500).send({ Error: err.message })
    }
}

const deleteBoardById = async function (req, res) {
    try {
        let boardId = req.params.boardId
        let userIdFromToken = req.userId

        if (!validator.isValidObjectId(boardId)) {
            return res.status(400).send({ status: false, message: "Invalid boardId in params." })
        }

        const findBoard = await boardModel.findOne({ _id: boardId, isDeleted: false })
        if (!findBoard) {
            return res.status(400).send({ status: false, message: `${boardId} is not present` })
        }

        //Authorization
        if (findBoard.userId.toString() != userIdFromToken) {
            return res.status(400).send({ status: false, message: `Unauthorized access! Owner info doesn't match` })
        }

        const deleteBoardData = await boardModel.findOneAndUpdate({ _id: boardId }, { isDeleted: true }, { new: true })
        await todoModel.updateMany({ _id: boardId }, { isDeleted: true })

        return res.status(204).send({ status: true, message: "Board deleted", data: deleteBoardData })
    } catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}


module.exports = {
    createBoard, getboardById, updateBoard, deleteBoardById
}
