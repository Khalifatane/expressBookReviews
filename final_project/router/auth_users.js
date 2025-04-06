const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = []; // Stores registered users

// Session configuration
regd_users.use(session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// Check if username is valid (not already taken)
const isValid = (username) => {
  return users.findIndex(user => user.username === username) === -1;
};

// Check if username and password match
const authenticatedUser = (username, password) => {
  return users.find(user => user.username === username && user.password === password);
};

// Task 6: Register User
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Input validation
  if (!username || !password) {
    return res.status(400).json({ 
      message: "Both username and password are required" 
    });
  }

  // Check if user exists
  if (!isValid(username)) {
    return res.status(409).json({ 
      message: "Username already exists" 
    });
  }

  // Register new user
  users.push({ username, password });
  return res.status(201).json({ 
    message: "User successfully registered" 
  });
});

// Task 7: Login User
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      message: "Username and password are required" 
    });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ 
      message: "Invalid username or password" 
    });
  }

  // Create JWT token
  let accessToken = jwt.sign(
    { data: password },
    'access',
    { expiresIn: 60 * 60 } // 1 hour expiration
  );

  // Store in session
  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({ 
    message: "User successfully logged in",
    token: accessToken // Optional: return token to client
  });
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.session.authorization?.accessToken;
  
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, 'access', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Failed to authenticate token" });
    }
    req.user = decoded;
    next();
  });
};

// Task 8: Add/Modify Review (Protected route)
regd_users.put("/auth/review/:isbn", verifyToken, (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Initialize reviews object if it doesn't exist
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add/update review
  books[isbn].reviews[username] = review;
  return res.status(200).json({ 
    message: "Review added/modified successfully",
    book: books[isbn]
  });
});

// Task 9: Delete Review (Protected route)
regd_users.delete("/auth/review/:isbn", verifyToken, (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn] || !books[isbn].reviews) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review found for this user" });
  }

  // Delete review
  delete books[isbn].reviews[username];
  return res.status(200).json({ 
    message: "Review deleted successfully",
    book: books[isbn]
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.authenticatedUser = authenticatedUser;
module.exports.users = users;