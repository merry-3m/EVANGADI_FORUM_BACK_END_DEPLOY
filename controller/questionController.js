// * function for question

//= db connection

const dbConnection = require("../db/dbConfig");

// =status code

const { StatusCodes } = require("http-status-codes");

const { v4: uuidv4 } = require("uuid");

// * function for question

async function askQuestion(req, res) {
  const dateAsked = new Date();
  // console.log(dateAsked);
  // ` expected data
  const { title, description, tag, id } = req.body;

  // ` user from authMiddleware
  const { userid } = req.user;

  //` Check if title, description, and tag are provided
  if (!title || !description) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Title, Description are required",
    });
  }

  //` Generate a unique question ID
  const questionid = uuidv4();

  // `post the question in database by try catch
  try {
    const result = await dbConnection.query(
      `INSERT INTO questions (questionid, title, description, tag, userid, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [questionid, title, description, tag, userid, dateAsked]
    );

    // Format the created_at date before sending the response
    const formattedDateAsked = new Date(dateAsked).toISOString();

    console.log(formattedDateAsked);

    // Send a success response with formatted date
    res.status(StatusCodes.CREATED).json({
      message: "Question Posted Successfully",
      questionId: questionid,
      created_at: formattedDateAsked, // Include formatted date in response
    });
  } catch (error) {
    console.error("Error posting question:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Something Went Wrong",
      error: error.message,
    });
  }
}

// * function for question home page
async function getQuestions(req, res) {
  // ` get all questions from database
  try {
    // ` select the question from questions table and link questions table with users table to know about who asked each question.
    const [result] = await dbConnection.query(`
    SELECT q.id, q.title, q.description,q.questionid, q.created_at ,u.username
            FROM questions q
            JOIN users u ON q.userid = u.userid
            ORDER BY q.id DESC
    `);
    //` Send a success response
    res.status(StatusCodes.OK).json(result);
    // console.log(result);
  } catch (error) {
    console.error("Error getting questions:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Something Went Wrong",
      error: error.message,
    });
  }
}

// * function for question detail page
// ~ access specific question by id

async function specificQuestion(req, res) {
  // ` get a question based on question id

  const { questionId } = req.params;
  //   console.log(questionId);

  // ` select the question from questions table and link questions table with users table to know about who asked each question.
  try {
    const [result] = await dbConnection.query(
      `
        SELECT q.*, u.username
        FROM questions q
        JOIN users u ON q.userid = u.userid
        WHERE q.questionid = ?
        `,
      [questionId]
    );

    res.status(StatusCodes.OK).json(result);
    // console.log(result);
  } catch (error) {
    console.error("Error getting questions:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Something Went Wrong",
      error: error.message,
    });
  }
}

// * function for search question

async function searchQuestionsByTag(req, res) {
  // const searchQuery = req.query.q || "";
  const { searchQuery } = req.body;
  try {
    const sqlQuery = `
            SELECT q.id, q.title, q.description, q.questionid, u.username, q.tag
            FROM questions q
            JOIN users u ON q.userid = u.userid
            WHERE q.tag LIKE ? OR q.title LIKE ? OR q.description LIKE ?
        `;
    const queryParams = [
      `%${searchQuery}%`,
      `%${searchQuery}%`,
      `%${searchQuery}%`,
    ];

    console.log("Executing SQL Query:");
    console.log(sqlQuery);
    console.log("With Parameters:");
    console.log(queryParams);

    const [result] = await dbConnection.query(sqlQuery, queryParams);

    console.log("Query Result:");
    console.log(result);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    console.error("Error searching questions:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Something Went Wrong",
      error: error.message,
    });
  }
}

async function unansweredQuestion(req, res) {
  console.log("start fetching unanswered questions");
  try {
      const [result] = await dbConnection.query(`
          SELECT q.id, q.title, q.description, q.questionid, u.username, q.tag
          FROM questions q
          JOIN users u ON q.userid = u.userid
          LEFT JOIN answers a ON q.questionid = a.questionid
          WHERE a.questionid IS NULL
      `);

      console.log("Fetched unanswered questions:", result);
      res.status(StatusCodes.OK).json(result);
  } catch (error) {
      console.error("Error fetching unanswered questions:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Something went wrong",
          error: error.message,
      });
  }
}
async function editQuestion(req, res) {
  const { questionId } = req.params;
  const { title, description, tag } = req.body;
  const { userid } = req.user; // Assuming you have authentication middleware

  try {
    const [result] = await dbConnection.query(
      `
      UPDATE questions 
      SET title = ?, description = ?, tag = ?
      WHERE questionid = ? AND userid = ?
      `,
      [title, description, tag, questionId, userid]
    );

    if (result.affectedRows === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Question not found or user not authorized to edit",
      });
    }

    res.status(StatusCodes.OK).json({
      message: "Question updated successfully",
    });
  } catch (error) {
    console.error("Error editing question:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
}

async function deleteQuestion(req, res) {
  const { questionId } = req.params;
  const { userid } = req.user; // Assuming you have authentication middleware

  try {
    const [result] = await dbConnection.query(
      `
      DELETE FROM questions
      WHERE questionid = ? AND userid = ?
      `,
      [questionId, userid]
    );

    if (result.affectedRows === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Question not found or user not authorized to delete",
      });
    }

    res.status(StatusCodes.OK).json({
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "You Can't delete the question",
      error: error.message,
    });
  }
}



module.exports = {
  askQuestion,
  getQuestions,
  specificQuestion,
  searchQuestionsByTag,
  unansweredQuestion,
  editQuestion,
   deleteQuestion
};
