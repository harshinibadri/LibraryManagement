const express = require("express");
const fs = require("fs");
const cors = require("cors");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(cors()); 
const FILE_PATH = "books.json"; 
app.get("/", (req, res) => {
    res.send("Library Management API is Running!");
});
app.post("/issueBook", (req, res) => {
    try {
        const bookData = req.body;
        if (!bookData.email || !bookData.bookTitle) {
            return res.status(400).json({ message: "Missing email or book title" });
        }

        const issueDate = new Date(bookData.issueDate || new Date()); 
        const dueDate = new Date(issueDate);
        dueDate.setDate(issueDate.getDate() + 14); 

        bookData.issueDate = issueDate.toISOString();
        bookData.dueDate = dueDate.toISOString();
        bookData.status = "Borrowed";

        let books = [];
        if (fs.existsSync(FILE_PATH)) {
            try {
                books = JSON.parse(fs.readFileSync(FILE_PATH, "utf-8")) || [];
            } catch (error) {
                console.error("Error parsing books.json:", error);
                books = [];
            }
        }
        books.push(bookData);
        fs.writeFileSync(FILE_PATH, JSON.stringify(books, null, 2));

        res.json({ 
            message: "📚Book issued successfully!", 
            dueDate: dueDate.toDateString() 
        });
    } catch (error) {
        res.status(500).json({ message: "Error issuing book", error: error.message });
    }
});
async function sendEmail(studentName, email, book, dueDate) {
    if (!email) {
        console.log(`Skipping email: No email provided for book '${book}'`);
        return;
    }
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS  
        }
    });

    let mailOptions = {
        from: `"Return Alert" <${process.env.EMAIL_USER}>`,  // Custom sender name
        to: email,
        subject: "⏳Your Book Due Date is Almost Here!",
        html: `
            <h3>Hello <b>${studentName}</b>,</h3>
            Time flies when you're lost in a good book! Just a quick reminder that <b>${book}</b> is due on <b>${dueDate}</b>.
            Be sure to return or renew it before then.
            <h3>Happy reading!📚</h3>
            <h3><b>Your Library Team</b></h3>
        `
    };    
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Reminder sent to ${email} for book '${book}'`);
    } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
    }
}
cron.schedule("43 10 * * *", () => {
    console.log("Checking for due book reminders...");
    if (!fs.existsSync(FILE_PATH)) {
        console.log("No issued books found.");
        return;
    }
    let books;
    try {
        books = JSON.parse(fs.readFileSync(FILE_PATH, "utf-8")) || [];
    } catch (error) {
        console.error("Error reading books.json:", error);
        return;
    }
    let today = new Date();
    let todayStr = today.toDateString();
    books.forEach(book => {
        if (!book.email || !book.bookTitle) return; 
        let dueDate = new Date(book.dueDate);
        let reminderDate1 = new Date(dueDate);
        reminderDate1.setDate(dueDate.getDate() - 2); 
        let reminderDate2 = new Date(dueDate);
        reminderDate2.setDate(dueDate.getDate() - 1); 

        if ((todayStr === reminderDate1.toDateString() || todayStr === reminderDate2.toDateString()) && book.status === "Borrowed") {
            console.log(`Sending Reminder: ${book.email} - '${book.bookTitle}' due on ${dueDate.toDateString()}`);
            sendEmail(book.studentName, book.email, book.bookTitle, dueDate.toDateString());
        }
    });
});
app.listen(4000, () => console.log(`Server running at http://localhost:4000`));
