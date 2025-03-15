const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Connect to SQLite database (or create if it doesn't exist)
const db = new sqlite3.Database("./news.db", (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to SQLite database.");
        db.run(`
            CREATE TABLE IF NOT EXISTS articles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL
            )
        `);
    }
});

// Fetch all articles
app.get("/articles", (req, res) => {
    db.all("SELECT * FROM articles", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Add a new article
app.post("/articles", (req, res) => {
    const { title, content } = req.body;
    db.run(
        "INSERT INTO articles (title, content) VALUES (?, ?)",
        [title, content],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ id: this.lastID, title, content });
            }
        }
    );
});

// Delete an article
app.delete("/articles/:id", (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM articles WHERE id = ?", id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Article deleted" });
        }
    });
});

// Update an article
app.put("/articles/:id", (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    db.run(
        "UPDATE articles SET title = ?, content = ? WHERE id = ?",
        [title, content, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ id, title, content });
            }
        }
    );
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
