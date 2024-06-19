const express = require("express");
const session = require('express-session');   //session authentication
const router = express.Router();
const fetch = require("node-fetch");
const notifier = require('node-notifier');
const bookFunctions = require("./bookFunctions.js");
const collectionList = require("./collectionList.js");

///////////////////////// USER sections /////////////////////////////////
//init session
router.use(session({
  secret: '$ecret_key!',
  resave: false,
  saveUninitialized: true,
  user_authed: false
}));

//authentication function:
//'user' = body from signin page   
//'user_authed' = boolean status of the session parameter (updted to true when user succesfully signs in)
//usage can be found in route handler below "/"
function authentication(req, res, next) {
  user = req.session.user;
  if (user == req.session.user && req.session.user_authed) { //deny access if session user doesn't match user from signin
    next();
  } else {
    res.render("home.ejs");  
  }
};

//settings get
router.get("/settings",  authentication,   (req, res, next) => {
  global.db.get('SELECT * FROM users WHERE email = ?', user, function (err, rows) {
    if (err || !rows) {
      next(err)
      return;
    } else { 
      res.render("settings.ejs", {user:rows});
    }
  })
});

//settings posts
router.post("/settings", authentication, (req, res, next) => {
  global.db.run('UPDATE users SET user_name = ?,fav_author = ?, fav_genre = ?, current_read = ?, user_description = ? WHERE email = ?',
  req.body.user_name,
  req.body.fav_author,
  req.body.fav_genre,
  req.body.current_read,
  req.body.user_description,
  user,
  function (err) {
    if (err) {
      res.send('Username already taken!');
      res.end();
      return;
    } else{
        res.redirect('/settings'); 
      }
  })
});

//index: get all books from db
router.get("/",  authentication,   (req, res, next) => {
  global.db.all('SELECT * FROM books', function (err, rows) {
    if (err) {
      next(err);
      return;
      //res.redirect('/home'); 
    } else {
      const books = rows.map((row) => ({
        title:row.title,
        book_id: row.book_id,
        isbn: row.ISBN,
        author: row.author,
        description: row.description,
        type: row.type,
        rating: row.rating,
        loan_to: row.loan_to,
        notes: row.notes,
        progress: row.likes
      }));
      //res.render('home', { books: books });  //makes edit and delte book actions inaccessible
      res.render('index', { books: books });
    }
  });
});

/////////////////////////// COLLECTION PAGE ROUTES ////////////////////////
router.get("/collectionList", authentication, (req,res) => {
  
  global.db.all('SELECT * FROM books', function (err, rows) {
    if (err) {
      next(err);
      return;
    } else {
      const books = rows.map((row) => ({
        title:row.title,
        book_id: row.book_id,
        isbn: row.ISBN,
        author: row.author,
        description: row.description,
        type: row.type,
        rating: row.rating,
        loan_to: row.loan_to,
        notes: row.notes,
        progress: row.likes
      }));
      res.render('collectionList.ejs', { books: books });
    }
  });
});
/////////////  Handles edit and delete buttons from collection list cards //////////////////////////
// launches editBook.ejs for given book id or deletes book
router.post("/editBook", (req, res, next) => {
  
  //selectedBook = JSON.parse(req.body.addBook);
  if(req.body.editBook != undefined) // user is editing entry
  {
    editBook = req.body.editBook;   
    editQuery = "SELECT * FROM books WHERE book_id=?";
    global.db.get(editQuery, editBook, (err, result) => {
      if (err) {
        next(err);
        return;
      }
      selected = {title:result.title, author:result.author, year:result.year, isbn:result.ISBN, publisher:result.publisher, publisher_loc:result.publisher_loc, description:result.description, book_id:editBook};

      //redirect to index
      res.render('edit_book', { bookData: selected });
    }); 

  }
  else if(req.body.deleteBook != undefined) // user wants to delete book
  {
    deleteBook = req.body.deleteBook; 
    deleteQuery = "DELETE FROM books WHERE book_id=?";
    
    global.db.run(deleteQuery, deleteBook, (err, result) => {
      if (err) {
        next(err);
        return;
      }
    
      //redirect to index
      res.redirect("/");
    });
  }
});

////////////////////  EDITS BOOK DATA //////////////////////
router.post("/edit_book_data", (req,res, next) => {
  if(req.body.saveChanges != undefined)
  {
    
    book = {title:req.body.title, author:req.body.author, isbn:req.body.isbn, publisher:req.body.publisher, publisher_loc:req.body.pubLOC, year:req.body.year, description:req.body.description, book_id:req.body.book_id};
    if(bookFunctions.validateBook(book))
    { 
      
      editQuery = "Update books SET title=?,author=?,isbn=?,publisher=?,publisher_loc=?,year=?,description=? WHERE book_id=?"; 
      
      const entry = [book.title, book.author,book.isbn, book.publisher, book.publisher_loc,  book.year, book.description, book.book_id];

      //execute query
      global.db.run(editQuery, entry, (err, result) => {
        if (err) {
          next(err);
          console.log("Error entering book into database.");
          notifier.notify({title:"Alert!",message:"Book could not be edited",
            sound: true, wait: true});
          return;
        }
        //redirect to index
        res.redirect("/");
      });
    }

  }
  else
  {
    //redirect to index
    res.redirect("/");
  }
  
});


///////////////////////// ADD BOOK FUNCTIONS  /////////////////////////////////
// add_book.ejs with no information supplied
// this function passes an essentially empty JSON object to the add_book.ejs 

router.get("/add", authentication, (req, res) => {

  currentYear = new Date().getFullYear(); // default to current year so they can manually tick down to publication date

  defaultValues = {isbn:"",title:"",author:"",year:currentYear,publisher:"",publisher_loc:"",genre:"dunsail"};

  res.render("add_book.ejs",{bookData:defaultValues});
});

//add new book to db and return to index (book list)
router.post("/add", authentication, (req, res, next) => {
    const { isbn, title, author, description, genre } = req.body;

    //query
    const query = "INSERT INTO books (ISBN,title, author, description, genre) VALUES (?, ?, ?,?, ?)";
    const entry = [isbn, title, author, description, "dunsail"];
  
    //execute query
    global.db.run(query, entry, (err, result) => {
      if (err) {
        next(err);
        return;
      }
      //redirect to index
      res.redirect("/");
    });
});

// this function takes a JSON object representing the user's selection from search_results.ejs and populates the fields
// of add_book.ejs with that data
router.post("/add_bookFromSearch", authentication, (req, res, next) => {
  selectedBook = JSON.parse(req.body.addBook);
  res.render("add_book.ejs",{bookData:selectedBook});  // refresh page with the values pulled
});

// This route handles the add book form on add_book.ejs
router.post("/add_book", authentication, async (req, res, next) => {
  
  // if/else chain checks for which button the user pressed
  if(req.body.clearBook != undefined) // user clicked clear, resets page
  {
    res.redirect("/add");
  }
  else if(req.body.addBook !=undefined) // user wants to add book to database
  {
    book = {title:req.body.title, author:req.body.author, isbn:req.body.isbn, publisher:req.body.publisher, publisher_loc:req.body.pubLOC, year:req.body.year, description:req.body.description};
    if(bookFunctions.validateBook(book))
    {
      // create query and array with values
      const query = "INSERT INTO books (ISBN, title, author, year, publisher, publisher_loc, description, genre) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
      const entry = [book.isbn, book.title, book.author, book.year, book.publisher, book.publisher_loc, book.description, "dunsail"];

      //execute query
      global.db.run(query, entry, (err, result) => {
        if (err) {
          next(err);
          console.log("Error entering book into database.");
          notifier.notify({title:"Alert!",message:"Book could not be added to database.",
            sound: true, wait: true});
          return;
        }
        //redirect to index
        res.redirect("/");
      });
    }
  }
  else if(req.body.searchBook != undefined) 
  {//
    results = await bookFunctions.searchBook(req, res); // searches for the book and sends results ot search_results.ejs
    res.render("search_results.ejs",{bookData:results});  // refresh page with the various search
  }
});


///////////////////////// SHELF sections /////////////////////////////////
router.get("/create_shelf", authentication, (req, res) => {
  res.render("create_shelf.ejs",{shelfData:{name:"", description:""}});
});

//add new book to db and return to index (book list)
router.post("/add_shelf", authentication, (req, res, next) => {
    const {name, description} = req.body;
    const query = "INSERT INTO bookshelf (name, description) VALUES (?, ?)";
    const entry = [name, description];
  
    global.db.run(query, entry, (err, result) => {
      if (err) {
        next(err);
        return;
      }
      res.redirect("/collectionList");    //assumes this is the page for bookshelfs
    });
});


module.exports = router;