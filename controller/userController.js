// * function for user


//= db connection

const dbConnection = require("../db/dbConfig");

// = to hash the password

const bcrypt = require("bcrypt");

// =status code

const { StatusCodes } = require("http-status-codes");

// = JWT

const jwt = require("jsonwebtoken");


// ` we use async because our db is promise

// * function for register
async function register(req, res) {
  // ` expected data
  const { username, firstname, lastname, email, password } = req.body;

  //` check if the data is available
  if (!username || !firstname || !lastname || !email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "please provide required information" });
  }

  //    ` if all the data are sent
  try {
    // ` check if the user already exist (where -> to filter)

    // ` when it gets executed it contains two values [data,table structure] . so destructure it (instead of --> const user , const [user] to get the data (the first index))

    const [user] = await dbConnection.query(
      "SELECT username,userid from users where username = ? or email = ?",
      [username, email]
    );

    // return res.json({user:user})  //! to check the [user]

    // ` if the user already exist the array length will be > 0
    if (user.length > 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "user already existed" });
    }

    // ` check the password before it sent to the db
    if (password.length < 8) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "password must be at least 8 characters" });
    }

    // ` encrypt password before it stored in db
    const salt = await bcrypt.genSalt(10); //` to generate random string

    const hashedPassword = await bcrypt.hash(password, salt);

    // ` to insert the data in db
    // \  use the hashedPassword
    await dbConnection.query(
      "INSERT INTO users (username,firstname,lastname,email,password) VALUES (?,?,?,?,?)",
      [username, firstname, lastname, email, hashedPassword]
    );

    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "user registered successfully" });

  } catch (error) {
    console.log(error.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, try again later" });
  }
}


// * function for login
async function login(req, res) {
    // ` expected data
  const { email, password } = req.body;

  //` check if the data is available
  if (!email ||!password) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "please provide required information" });
  }

//   ` if there are data

  try {

    // ` check if the user already exist (where -> to filter)
    // ` to access only the data destructure user 
    const [user] = await dbConnection.query(
      "SELECT userid,username,password from users where email =?",
    [email]);

      // return  res.json({user:user})  //! to check the [user]

      // ` if there isn't any user exist, because we only get [user] array. when the email we put is already exist in db.
      // ` if the email the user insert doesn't watch with the email in db the array value will be 0 which means(no user) 
      if (user.length === 0) {
        return res
         .status(StatusCodes.BAD_REQUEST)
         .json({ msg: "user does not exist" });
      } 

      // ` compare password
//: bcrypt.compare(actualPassword, hashedPassword access from the above[user]);
      const isMatch = await bcrypt.compare(password, user[0].password);
      // ` if the password doesn't match

      if (!isMatch) {
        return res
         .status(StatusCodes.BAD_REQUEST)
         .json({ msg: "password is incorrect" });
      } 

      // ` if the password match, JWT(Json Web Token)
    //   return  res.json({user:user[0].password}) //! to check the hashed password


    // ` create a token, [user] from selected db(line 103)

    const username = user[0].username
    const userid = user[0].userid

    const token = jwt.sign(
      {
        username,
        userid,
      },
       process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return  res.status(StatusCodes.OK).json({msg: "users login successfully " , token, username})  //! to check the token

  } catch (error) {
    console.log(error.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, try again later" });
  }
}



// * function for checkUser
async function checkUser(req, res) {
    // ` access userid & username from the authMiddleware
    const {username,userid} = req.user
  res.status(StatusCodes.OK).json({msg:"Valid user", username, userid})
//   res.send("check user");
}


// * reset password
async function resetPassword(req, res)  {
  const { email, newPassword } = req.body;

  try {
      // Find the user by email
      const [user] = await dbConnection.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (user.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate hash for the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user's password with the new hashed password
      await dbConnection.query(
        "UPDATE users SET password = ? WHERE email = ?",
        [hashedPassword, email]
      );

      res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
}






module.exports = { register, login, checkUser, resetPassword };
