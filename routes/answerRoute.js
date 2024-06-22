const express = require("express");
const router = express.Router();

const {postAnswer,getAnswer, editAnswer, deleteAnswer} = require("../controller/answerController")

router.post("/answer/:questionId",postAnswer)
router.get("/answer/:questionId",getAnswer)
router.put("/answers/:answerId", editAnswer);
router.delete("/answers/:answerId", deleteAnswer);


module.exports = router