// ` Express route

const express = require("express");
const router = express.Router();


const { askQuestion,getQuestions,specificQuestion, searchQuestionsByTag, unansweredQuestion, editQuestion, deleteQuestion} = require("../controller/questionController")

router.post("/all-questions",askQuestion)

router.get("/questions",getQuestions)

router.get("/questions/:questionId", specificQuestion)
// Route for searching questions by tag

// router.get('/questions/search', searchQuestionsByTag);
router.post('/questions/search', searchQuestionsByTag);

// 
router.get('/question/unanswered', unansweredQuestion);

// Route to edit a specific question by questionId
router.put("/questions/:questionId", editQuestion);

// Route to delete a specific question by questionId
router.delete("/questions/:questionId", deleteQuestion);

module.exports = router