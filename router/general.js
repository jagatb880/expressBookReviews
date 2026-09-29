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
public_users.get("/", async function (req, res) {
  try {
    return res.status(200).json(books);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching books",
    });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  try {
    const isbn = req.params.isbn;

    const book = await Promise.resolve(books[isbn]);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    return res.status(200).json(book);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching book",
    });
  }
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  try {
    const author = req.params.author.toLowerCase();

    const matchingBooks = await Promise.resolve(
      Object.fromEntries(
        Object.entries(books).filter(
          ([, book]) => book.author.toLowerCase() === author
        )
      )
    );

    if (Object.keys(matchingBooks).length === 0) {
      return res.status(404).json({
        message: "No books found for this author",
      });
    }

    return res.status(200).json(matchingBooks);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching books by author",
    });
  }
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  try {
    const title = req.params.title.toLowerCase();

    const matchingBooks = await Promise.resolve(
      Object.fromEntries(
        Object.entries(books).filter(
          ([, book]) => book.title.toLowerCase() === title
        )
      )
    );

    if (Object.keys(matchingBooks).length === 0) {
      return res.status(404).json({
        message: "No books found with this title",
      });
    }

    return res.status(200).json(matchingBooks);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching books by title",
    });
  }
});

// Get book review
public_users.get("/review/:isbn", async function (req, res) {
  try {
    const isbn = req.params.isbn;

    const reviews = await Promise.resolve(
      books[isbn] ? books[isbn].reviews : null
    );

    if (!reviews && !books[isbn]) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    return res.status(200).json(reviews);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching reviews",
    });
  }
});

// Add/Update review
public_users.put("/review/:isbn", async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const review = req.query.review;

    const username = req.session.authorization.username;

    await Promise.resolve(
      (books[isbn].reviews[username] = review)
    );

    return res.status(200).json({
      message: "Review successfully added/updated",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error updating review",
    });
  }
});

module.exports.general = public_users;
