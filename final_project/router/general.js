const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username: username, password: password });

  return res
    .status(201)
    .json({ message: "User successfully registered. Now you can login" });
});

// Task 10: Get the book list available in the shop using Promises
public_users.get("/", function (req, res) {
  const getBooksPromise = new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject("No books available");
    }
  });

  getBooksPromise
    .then((bookList) => {
      return res.status(200).send(JSON.stringify(bookList, null, 4));
    })
    .catch((error) => {
      return res.status(500).json({ message: error });
    });
});

// Task 11: Get book details based on ISBN using Promises
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBNPromise = new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found with this ISBN");
    }
  });

  getBookByISBNPromise
    .then((book) => {
      return res.status(200).send(JSON.stringify(book, null, 4));
    })
    .catch((error) => {
      return res.status(404).json({ message: error });
    });
});

// Task 12: Get book details based on author using Async/Await
public_users.get("/author/:author", async function (req, res) {
  const authorParam = req.params.author;

  try {
    const getBooksByAuthor = await new Promise((resolve, reject) => {
      const bookKeys = Object.keys(books);
      let matchingBooks = [];

      bookKeys.forEach((key) => {
        if (books[key].author.toLowerCase() === authorParam.toLowerCase()) {
          matchingBooks.push({
            isbn: key,
            title: books[key].title,
            reviews: books[key].reviews,
          });
        }
      });

      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject("No books found by this author");
      }
    });

    return res.status(200).send(JSON.stringify(getBooksByAuthor, null, 4));
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Task 13: Get all books based on title using Async/Await
public_users.get("/title/:title", async function (req, res) {
  const titleParam = req.params.title;

  try {
    const getBooksByTitle = await new Promise((resolve, reject) => {
      const bookKeys = Object.keys(books);
      let matchingBooks = [];

      bookKeys.forEach((key) => {
        if (books[key].title.toLowerCase() === titleParam.toLowerCase()) {
          matchingBooks.push({
            isbn: key,
            author: books[key].author,
            reviews: books[key].reviews,
          });
        }
      });

      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject("No books found with this title");
      }
    });

    return res.status(200).send(JSON.stringify(getBooksByTitle, null, 4));
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Get book review (Standard retrieve)
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found with this ISBN" });
  }
});

module.exports.general = public_users;
