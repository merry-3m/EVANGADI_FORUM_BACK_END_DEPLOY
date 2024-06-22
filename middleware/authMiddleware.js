// * To verify the token
// -

// =status code

const { StatusCodes } = require("http-status-codes");

// = JWT

const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  // ` check if it's not authorized
  // ` check if the authorization header is  empty
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // console.log("Authorization header missing or invalid");
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Not Authorized" });
  }

  //` Extract the token from the authorization header

  const token = authHeader.split(" ")[1];

  //  console.log(authHeader); //` the authHeader contain bearer
  //  console.log(token);  //` the string we got after jwt sign

  // ` verify the token

  try {
    const { username, userid } = jwt.verify(token, process.env.JWT_SECRET);

    // return res.status(StatusCodes.OK).json({data}) //! to access data before it destructure into  {username,userid} check this by using(checkUser function)
    // ` attach the decoded(destructure) data to the request object
    req.user = { username, userid };
    next();
  } catch (error) {
    // console.log("Token verification failed:", error.message);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication Invalid" });
  }
}

module.exports = authMiddleware;
