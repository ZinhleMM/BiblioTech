
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

-- users 
CREATE TABLE users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
  user_name VARCHAR(50) UNIQUE NOT NULL, 
  password VARCHAR(50) NOT NULL, 
  email VARCHAR(50) UNIQUE NOT NULL, 
  reading_status VARCHAR(30),
  fav_author VARCHAR(60),
  fav_genre VARCHAR(50),
  current_read VARCHAR(50),
  user_description VARCHAR(360)


);

-- index necessary columns
CREATE INDEX users_user_name_idx ON users (user_name);

-- all books
CREATE TABLE books (
  book_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
  ISBN VARCHAR(17) UNIQUE NOT NULL,
  title VARCHAR(50) NOT NULL,
  author VARCHAR(60) NOT NULL,
  genre VARCHAR(50) NOT NULL,
  year INT(4),
  platform VARCHAR(50), 
  editors VARCHAR(50),
  description VARCHAR(360),
  publisher VARCHAR(50),
  publisher_loc VARCHAR(50),
  series VARCHAR(50),
  volume_number VARCHAR(50),
  format VARCHAR(50),
  language VARCHAR(50),
  editions INTEGER,
  tags VARCHAR(150),
  overall_rating REAL(5), 
  reviews VARCHAR(680)
);

-- users books
CREATE TABLE usersBooks (
  userBook_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
  ISBN VARCHAR(17) UNIQUE NOT NULL,
  wishlist INTEGER(1),
  rating INTEGER(1), 
  loan_to INTEGER, 
  notes VARCHAR(360), 
  progress INTEGER(3), 
  share INTEGER(1),
  FOREIGN KEY(loan_to) REFERENCES users(user_id)  
);

-- users bookshelf
CREATE TABLE bookshelf (
  shelf_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
  -- shelfBook_id INTEGER,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(360),
  row INTEGER,
  col INTEGER
  -- FOREIGN KEY(shelfBook_id) REFERENCES books(book_id)  
);

INSERT INTO users (user_name, password, email, fav_author, fav_genre, current_read, user_description) VALUES 
("mr_andersson", "secretPW", "test@app.nu", "Tolkien", "Fantasy", "The Hobbit", "Fantasy and Science Fiction fan");    -- remember: preferably no '', "", or `` for keys with SQLite3

INSERT INTO books (`book_id`,`ISBN`,`title`,`author`,`description`,`genre`
,`year`,`overall_rating`) VALUES 
(0,'4343343434', 'book title', 'author', 'good book','horror', '2015-12-18', 3.3);

INSERT INTO usersBooks (userBook_id, ISBN, wishlist, rating,notes, progress, share) VALUES 
(0, '4343343434', 1, 2.5, "no notes", 55, 1);

INSERT INTO bookshelf (shelf_id, name, description, row, col) VALUES 
(0, "new shelf", "this is a description text: lorem ipsum...", 1, 1);

COMMIT;
