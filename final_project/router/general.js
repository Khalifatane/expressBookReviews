const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 0: User Registration
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if user already exists
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "User already exists." });
    }

    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully!" });
});

// Task 1: Get All Books
public_users.get('/', function (req, res) {
    return res.status(200).json({ books: books });
});

// Task 2: Get Book by ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn]);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Task 3: Get Books by Author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const booksByAuthor = [];

    for (const isbn in books) {
        if (books[isbn].author === author) {
            booksByAuthor.push(books[isbn]);
        }
    }

    if (booksByAuthor.length > 0) {
        return res.status(200).json({ books: booksByAuthor });
    } else {
        return res.status(404).json({ message: "No books found by this author" });
    }
});

// Task 4: Get Books by Title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const booksByTitle = [];

    for (const isbn in books) {
        if (books[isbn].title === title) {
            booksByTitle.push(books[isbn]);
        }
    }

    if (booksByTitle.length > 0) {
        return res.status(200).json({ books: booksByTitle });
    } else {
        return res.status(404).json({ message: "No books found with this title" });
    }
});

// Task 5: Get Book Reviews
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn] && books[isbn].reviews) {
        return res.status(200).json({ reviews: books[isbn].reviews });
    } else {
        return res.status(404).json({ message: "No reviews found for this book" });
    }
});

// Task 10: Get All Books (Async/Await)
public_users.get('/async', async function (req, res) {
    try {
        const bookList = await new Promise((resolve) => {
            resolve(books);
        });
        return res.status(200).json({ books: bookList });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books" });
    }
});

// Task 11: Get Book by ISBN (Async/Await)
public_users.get('/async/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const book = await new Promise((resolve, reject) => {
            if (books[isbn]) {
                resolve(books[isbn]);
            } else {
                reject("Book not found");
            }
        });
        return res.status(200).json(book);
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

// Task 12: Get Books by Author (Async/Await)
public_users.get('/async/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const filteredBooks = await new Promise((resolve) => {
            const result = [];
            for (const isbn in books) {
                if (books[isbn].author === author) {
                    result.push(books[isbn]);
                }
            }
            resolve(result);
        });

        if (filteredBooks.length > 0) {
            return res.status(200).json({ books: filteredBooks });
        } else {
            return res.status(404).json({ message: "No books found by this author" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books" });
    }
});

// Task 13: Get Books by Title (Async/Await)
public_users.get('/async/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const filteredBooks = await new Promise((resolve) => {
            const result = [];
            for (const isbn in books) {
                if (books[isbn].title === title) {
                    result.push(books[isbn]);
                }
            }
            resolve(result);
        });

        if (filteredBooks.length > 0) {
            return res.status(200).json({ books: filteredBooks });
        } else {
            return res.status(404).json({ message: "No books found with this title" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books" });
    }
});

module.exports.general = public_users;
