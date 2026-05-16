const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  let usersWithSameName = users.filter((user) => {
    return user.username === username;
  });
  return usersWithSameName.length === 0;
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  let validUsers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validUsers.length > 0;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: password }, "access", {
      expiresIn: 60 * 60,
    });
    req.session.authorizaton = {
      accessToken,
      username,
    };
    return res.status(200).json({ message: "Customer successfully logged in" });
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  const username = req.session.authorization
    ? req.session.authorization.username
    : null;

  if (!review) {
    return res
      .status(400)
      .json({ message: "Review content is required in query parameters" });
  }

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  // 2. Check if book exists and update review map
  if (books[isbn]) {
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
    books[isbn].reviews[username] = review;

    return res.status(200).json({
      message: "Review successfully added/updated",
      reviews: books[isbn].reviews,
    });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  // 1. Retrieve the username from the active session
  const username = req.session.authorization
    ? req.session.authorization.username
    : null;

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  // 2. Verify if the book exists
  if (books[isbn]) {
    let bookReviews = books[isbn].reviews;

    // 3. Check if this specific user has posted a review for this book
    if (bookReviews && bookReviews[username]) {
      // Delete only this user's review property from the object
      delete bookReviews[username];

      return res.status(200).json({
        message: `Review for ISBN ${isbn} posted by user '${username}' successfully deleted`,
        reviews: bookReviews,
      });
    } else {
      return res
        .status(404)
        .json({
          message: `No review found for user '${username}' under this book`,
        });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
