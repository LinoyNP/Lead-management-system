import express from 'express';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto'; 
import mongoose from 'mongoose';
import User from './models/User.js'; 

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// פונקציה לבדוק חוזק סיסמה
function validatePassword(password) {
  const passwordErrors = [];
  if (password.length < 8) passwordErrors.push("Password must be at least 8 characters long.");
  if (!/[A-Z]/.test(password)) passwordErrors.push("Password must contain at least one uppercase letter.");
  if (!/[a-z]/.test(password)) passwordErrors.push("Password must contain at least one lowercase letter.");
  if (!/\d/.test(password)) passwordErrors.push("Password must contain at least one digit.");
  return passwordErrors;
}

// פונקציה לבדוק אם האימייל כבר קיים במערכת
async function checkEmailExists(email) {
  const user = await User.findOne({ email });
  return user !== null;
}

// נתיב להרשמה
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // בדיקת אם האימייל כבר קיים במערכת
  const emailExists = await checkEmailExists(email);
  if (emailExists) {
    return res.status(400).send('<h1>Email already exists. Please use the "Forgot Password" option.</h1>');
  }

  // בדיקת חוזק הסיסמה
  const passwordErrors = validatePassword(password);
  if (passwordErrors.length > 0) {
    return res.status(400).send(`<h1>Password error: ${passwordErrors.join(' ')}</h1>`);
  }

  // יצירת טוקן אימות
  const verificationToken = crypto.randomBytes(20).toString('hex');
  
  try {
    // יצירת משתמש חדש
    const user = new User({ name, email, password, verificationToken, emailVerified: false });
    await user.save();

    // שליחת המייל עם קישור האימות
    const verificationLink = `https://yourwebsite.com/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email Address',
      html: `<p>Click the link below to verify your email address:</p><a href="${verificationLink}">${verificationLink}</a>`,
    });

    res.send('<h1>Registration successful. Please check your email for the verification link.</h1>');
  } catch (error) {
    res.status(500).send('<h1>Something went wrong. Please try again later.</h1>');
  }
});

// נתיב לאימות אימייל
app.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).send('<h1>Invalid or expired token</h1>');
    }

    // עדכון סטטוס האימייל כמאומת
    user.emailVerified = true;
    user.verificationToken = null;
    await user.save();

    res.send(`
      <h1>Email verified successfully!</h1>
      <p>Redirecting to your dashboard...</p>
      <script>
        setTimeout(() => {
          window.location.href = '/try1.ejs'; 
        }, 3000);
      </script>
    `);
  } catch (error) {
    res.status(500).send('<h1>Something went wrong. Please try again later.</h1>');
  }
});

// הפעלת השרת
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
