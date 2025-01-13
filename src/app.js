import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
import bcrypt from 'bcrypt';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// File path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', '../views');

// הגדר קבצים סטטיים
app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use('/js', express.static(path.join(__dirname, '../js')));



// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


// Generate token
function generateVerificationToken() {
    return crypto.randomBytes(20).toString('hex');
}

// // Register user
// app.post('/register', async (req, res) => {
//     const { fullName, email, password } = req.body;

//     try {
//         const userExists = await client.query('SELECT * FROM users WHERE email = $1', [email]);
//         if (userExists.rows.length > 0) {
//             return res.status(400).json({ error: 'User already exists' });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         const verificationToken = generateVerificationToken();

//         await client.query(
//             'INSERT INTO users (full_name, email, password, verification_token, verified) VALUES ($1, $2, $3, $4, $5)',
//             [fullName, email, hashedPassword, verificationToken, false]
//         );

//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: 'Verify your email',
//             html: `<a href="${process.env.BASE_URL || `http://localhost:${port}`}/verify-email?token=${verificationToken}">Verify Email</a>`,
//         };

//         await transporter.sendMail(mailOptions);
//         res.status(200).json({ message: 'User registered successfully. Verification email sent.' });
//     } catch (error) {
//         console.error('Error during registration:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// Verify email
app.get('/verify-email', async (req, res) => {
    const { token } = req.query;

    try {
        const result = await client.query(
            'UPDATE users SET verified = true WHERE verification_token = $1 RETURNING *',
            [token]
        );

        if (result.rows.length > 0) {
            res.send('<h1>Email verified successfully!</h1>');
        } else {
            res.status(400).send('<h1>Invalid or expired verification link.</h1>');
        }
    } catch (error) {
        console.error('Error during email verification:', error);
        res.status(500).send('<h1>Internal server error</h1>');
    }
});

// Views
app.get('/home', (req, res) => res.render('HomePage'));
app.get('/', (req, res) => res.render('SignUp'));

// Server
app.listen(port, () => console.log(`Server running at http://127.0.0.1:${port}`));
