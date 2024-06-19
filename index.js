// The index.js file of your application
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const sqlite3 = require('sqlite3').verbose();
const port = 3039;


const route = require("./routes/main");
const signupRouter = require("./routes/signup");
const successSignupRouter = require("./routes/successSignup");
const signinRouter = require("./routes/signin");
const logoutRouter = require("./routes/logout");
//const exportRouter = require("./routes/export");     //router for exporting: not finalized 

  
//sqlite3 db connection
global.db = new sqlite3.Database('./bookshelf.db',function(err) {
  if(err) {
    console.error(err);
    process.exit(1);
  } else {
    console.log("Database is connected");
    global.db.run("PRAGMA foreign_keys=ON");
  }
});

//ejs
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

//json requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//css
app.use(express.static(__dirname + "/"));

//app path
app.use("/", route);
app.use("/signup", signupRouter);
app.use("/successsignup", successSignupRouter);
app.use("/signin", signinRouter);
app.use("/logout", logoutRouter);
app.use("/home", signupRouter);

//app.use("/export", exportRouter);   //router for exporting: not finalized 

//initialize app
app.listen(port, () => {
console.log(`Listening on port: ${port}`);
});