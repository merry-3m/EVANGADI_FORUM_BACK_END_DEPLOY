// * function for answer

//= db connection

const dbConnection = require("../db/dbConfig");

// =status code

const { StatusCodes } = require("http-status-codes");

async function postAnswer(req, res) {
    // ` answer for specific question
    const {questionId} = req.params
    // console.log(questionId);


    // ` expected data from user
    const {  answer  } = req.body;

    // ` user from authMiddleware
    const {userid} = req.user

    // ` Check if answer is provided
    if (!answer) {
        return res
           .status(StatusCodes.BAD_REQUEST)
           .json({ message: "answer is required" });
    }

    // ` post answer
    try {

        // ` Check if the question exists by using question id
        const [question] = await dbConnection.query("SELECT * FROM questions WHERE questionid = ?", [questionId]);

        if (!question.length) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Question not found" });
        }
// `
        const insertAnswer = await dbConnection.query(`
        INSERT INTO answers ( answer, userid, questionid) VALUES (?, ?, ?)`,
    [ answer, userid, questionId])

    // ` to access the newly posted answer on the page. when the answer id (primary key) is the last inserted id

    const [newAnswer] = await dbConnection.query(`
    SELECT a.answer, u.username
    FROM answers a
    JOIN users u ON a.userid = u.userid
    WHERE a.answerid = LAST_INSERT_ID()
    `)
    res.status(StatusCodes.CREATED).json({
        message: "Answer Posted Successfully",
        insertAnswer,
        answerResult : newAnswer[0]
    });
    // console.log(insertAnswer);
    console.log(newAnswer[0]);

    } catch (error) {
        console.error("Error posting answer:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Something Went Wrong",
            error: error.message
        }); 
    }
}




// * function to get answer
async function getAnswer (req,res) {
    // ` get answer for specific question
    const {questionId} = req.params
    // console.log(questionId);

    try {
        const [result] = await dbConnection.query(`
        SELECT a.*, u.username
        FROM answers a
        JOIN users u ON a.userid = u.userid
        WHERE a.questionid =?
        `,
        [questionId])
        
        res.status(StatusCodes.OK).json(result);
        console.log(result);
    } catch (error) {
        console.error("Error getting questions:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Can't get the answer",
            error: error.message
        });
     }

}

// * edit answer
async function editAnswer(req, res) {
    const { answerId } = req.params;
    const { answer } = req.body;
    const { userid } = req.user;

    // Check if answer is provided
    if (!answer) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ message: "Answer is required" });
    }

    try {
        // Check if the answer exists and belongs to the authenticated user
        const [existingAnswer] = await dbConnection.query(
            "SELECT * FROM answers WHERE answerid = ? AND userid = ?",
            [answerId, userid]
        );

        if (!existingAnswer.length) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Answer not found or user not authorized to edit" });
        }

        // Update the answer
        const updateResult = await dbConnection.query(
            "UPDATE answers SET answer = ? WHERE answerid = ?",
            [answer, answerId]
        );

        res.status(StatusCodes.OK).json({
            message: "Answer updated successfully",
            updatedAnswerId: answerId
        });
    } catch (error) {
        console.error("Error editing answer:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Something went wrong",
            error: error.message
        });
    }
}

// * delete answer

async function deleteAnswer(req, res) {
    const { answerId } = req.params;
    const { userid } = req.user;

    try {
        // Check if the answer exists and belongs to the authenticated user
        const [existingAnswer] = await dbConnection.query(
            "SELECT * FROM answers WHERE answerid = ? AND userid = ?",
            [answerId, userid]
        );

        if (!existingAnswer.length) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Answer not found or user not authorized to delete" });
        }

        // Delete the answer
        const deleteResult = await dbConnection.query(
            "DELETE FROM answers WHERE answerid = ?",
            [answerId]
        );

        res.status(StatusCodes.OK).json({
            message: "Answer deleted successfully",
            deletedAnswerId: answerId
        });
    } catch (error) {
        console.error("Error deleting answer:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Something went wrong",
            error: error.message
        });
    }
}

module.exports = { postAnswer, getAnswer, editAnswer, deleteAnswer};

