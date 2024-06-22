const mysql2 = require("mysql2")
 

// ` connect node with db, use createPool (to have a lot of connection)

const dbConnection = mysql2.createPool({
    user: process.env.USER,
    database:process.env.DATABASE,
    host:process.env.HOST,
    password:process.env.PASSWORD,
    connectionLimit:10,
    // port
    
})
console.log(process.env.USER);

// ` to check the createPool connection

// dbConnection.execute("select 'test' ", (err,res)=>{
//     if (err){
//         console.log(err.message);
//     } else{
//         console.log(res)
//     }
    
// })

// ` export db b/c  we want this db in our controller to access different data

module.exports = dbConnection.promise()