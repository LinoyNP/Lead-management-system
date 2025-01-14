import express from 'express';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto'; // Importing crypto for token generation
import path from 'path';
import { fileURLToPath } from 'url';
// import { Pool } from 'pg'; // Using PostgreSQL
import pkg from 'pg';
const { Pool } = pkg;

// קבלת הנתיב של הקובץ הנוכחי
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// הגדרת משתני סביבה
dotenv.config();

const app = express();
const port = 3000;

// חיבור לדאטהבייס של PostgreSQL
const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

// Middleware להגדרות
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', '../views');

// הגדר קבצים סטטיים
app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use('/js', express.static(path.join(__dirname, '../js')));

// Nodemailer Transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// פונקציה ליצירת טוקן
function generateVerificationToken() {
    return crypto.randomBytes(20).toString('hex');
}

// רישום משתמש חדש
app.post('/register', async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        // בדיקה אם המשתמש כבר קיים
        const userExists = await pool.query('SELECT * FROM public.users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists.Please log in instead!' });
        }

        // יצירת טוקן אימות
        const verificationToken = generateVerificationToken();

        // הכנסת נתוני המשתמש לדאטהבייס
        await pool.query(
            'INSERT INTO public.users (full_name, email, password, verification_token, verified) VALUES ($1, $2, $3, $4, $5)',
            [fullName, email, password, verificationToken, false]
        );

        // שליחת מייל לאימות
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify your email',
            html: `
                 <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Email Verification</title>
                    </head>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; background-color: #f9f9f9;">
                            <h2 style="color: #333;">Hello ${fullName},</h2>
                            <p style="font-size: 16px; color: #555;">Thank you for registering with us!</p>
                            <p style="font-size: 16px; color: #555;">Please verify your email address by clicking the link below:</p>
                            <a href="http://localhost:${port}/verify-email?token=${verificationToken}" style="font-size: 16px; color: #fff; background-color: #4CAF50; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify your email</a>
                            <p style="font-size: 16px; color: #555;">If you did not request this registration, please ignore this email.</p>
                            <hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;">
                            <p style="font-size: 14px; color: #777;">If you need assistance, please contact us at <a href="mailto:support@yourwebsite.com">support@yourwebsite.com</a></p>
                        </div>
                    </body>
                </html>
            `,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'User registered successfully. Verification email sent.' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// אימות משתמש
app.get('/verify-email', async (req, res) => {
    const { token } = req.query;

    try {
        // עדכון הסטטוס של המשתמש אם הטוקן תקין
        const result = await pool.query(
            'UPDATE public.users SET verified = true WHERE verification_token = $1 RETURNING *',
            [token]
        );

        if (result.rows.length > 0) {
            res.send(`
                    <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                        <h1 style="color: #4CAF50;">Email Verified Successfully!</h1>
                        <p style="font-size: 18px; color: #555;">Your email has been successfully verified. You will be redirected to the homepage shortly...</p>
                        <p style="font-size: 16px; color: #888;">If you are not automatically redirected, <a href="/HomePage.ejs" style="color: #007BFF;">click here</a>.</p>
                        <script>
                            setTimeout(() => {
                                window.location.href = '/home';
                            }, 5000); 
                        </script>
                    </div>
            `);
        } else {
            res.status(400).send('<h1>Invalid or expired verification link.</h1>');
        }
    } catch (error) {
        console.error('Error during email verification:', error);
        res.status(500).send('<h1>Internal server error</h1>');
    }
});


// מסך הרשמה
app.get('/', (req, res) => {
    res.render('SignUp');
});

// מסך הבית
app.get('/home', (req, res) => {
    res.render('homePage');
});

// מסך הבית
app.get('/login', (req, res) => {
    res.render('loginPage');
});

// מסך הבית
app.get('/re-register', (req, res) => {
    res.render('signUp');
});




// הפעלת השרת
app.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}`);
});



