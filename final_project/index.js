const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const PORT = 5000;

app.use(express.json());

// Session middleware (must come before route handling)
app.use(
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

// JWT Authentication middleware for protected routes
app.use("/customer/auth/*", (req, res, next) => {
  if (req.session.authorization) {
    const token = req.session.authorization['accessToken'];
    jwt.verify(token, "access", (err, user) => {
      if (!err) {
        req.user = user;
        next();
      } else {
        return res.status(403).json({ message: "User not authenticated" });
      }
    });
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});

// Route to fetch books asynchronously (example)
app.get('/async-books', async (req, res) => {
  try {
    const booksList = await getBooks(); // Simulated async book fetching
    res.status(200).json({ books: booksList });
  } catch (error) {
    res.status(500).json({ message: "Error fetching books" });
  }
});

// Simulated async book fetcher
async function getBooks() {
  return new Promise((resolve) => {
    const books = [
      { title: "Book 1", author: "Author 1", isbn: "12345" },
      { title: "Book 2", author: "Author 2", isbn: "67890" },
    ];
    resolve(books);
  });
}

// Apply route handlers
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
