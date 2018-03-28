// // Set up MySQL connection.
// var mongoose = require("mongoose");

// if (process.env.MONGODB_URI){
//     mongoose.Promise = Promise;
//     mongoose.connect(MONGODB_URI, {
//       useMongoClient: true
//     });
// }else {
//   var connection = mysql.createConnection({
//     port: 3306,
//     host: "localhost",
//     user: "root",
//     password: "",
//     database: "_db"
//   });
// }

// // Make connection.
// connection.connect(function(err) {
//   if (err) {
//     console.error("error connecting: " + err.stack);
//     return;
//   }
//   console.log("connected as id " + connection.threadId);
// });

// // Export connection for use.
// module.exports = connection;