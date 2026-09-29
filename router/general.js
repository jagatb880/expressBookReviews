const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required",
    });
  }

  if (isValid(username)) {
    return res.status(409).json({
      message: "Username already exists",
    });
  }

  users.push({
    username,
    password,
  });

  return res.status(201).json({
    message: "User registered successfully",
  });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  Promise.resolve(books)
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).json({
        message: "Error fetching books",
      });
    });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  const getBook = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  });

  getBook
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((err) => {
      res.status(404).json({
        message: err,
      });
    });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author.toLowerCase();

  const getBooksByAuthor = new Promise((resolve, reject) => {
    const matchingBooks = Object.fromEntries(
      Object.entries(books).filter(
        ([, book]) => book.author.toLowerCase() === author,
      ),
    );

    if (Object.keys(matchingBooks).length > 0) {
      resolve(matchingBooks);
    } else {
      reject("No books found for this author");
    }
  });

  getBooksByAuthor
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(404).json({
        message: err,
      });
    });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title.toLowerCase();

  const matchingBooks = Object.fromEntries(
    Object.entries(books).filter(
      ([, book]) => book.title.toLowerCase() === title,
    ),
  );

  if (Object.keys(matchingBooks).length === 0) {
    return res.status(404).json({
      message: "No books found with this title",
    });
  }

  return res.status(200).json(matchingBooks);
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({
      message: "Book not found",
    });
  }

  return res.status(200).json(book.reviews);
});

public_users.put("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const review = req.query.review;

  const username = req.session.authorization.username;

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review successfully added/updated",
  });
});

module.exports.general = public_users;
