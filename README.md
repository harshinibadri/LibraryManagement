# Library Management System
# Overview
The Return Reminder Alert System ensures that students return borrowed books on time by checking due dates daily and sending automated email reminders before the deadline.

# Functionality
✅ The system runs a daily check to identify books due for return.

✅ It sends email reminders to students 2 days before and 1 day before the due date.

✅ Prevents late returns and helps students manage their borrowings efficiently.

# Technologies Used
Node.js – Backend processing

Express.js – API framework

MongoDB – Database for storing borrowed book records

node-cron – Task scheduler to automate daily checks

nodemailer – Email service to send reminders

# How It Works
The system checks the due date of borrowed books every day at a scheduled time.

If a book is due in 2 days or 1 day, an email notification is sent to the student.

The email contains book details and due date as a reminder.

Students receive timely notifications, helping them avoid late fees.

# Process Flow
Student borrows a book → Data is stored in the system with a due date.

Daily check runs to identify books nearing the return date.

Automated email alerts are sent before the deadline.

Student returns the book on time, preventing overdue issues.
