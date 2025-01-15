import express from 'express';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Client } = pkg;

// Get the current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up dotenv for environment variables
dotenv.config();
const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Set up static file directories
// app.use(express.static(path.join(__dirname, '../js')));
// app.use(express.static(path.join(__dirname, '../css')));
// הגדר קבצים סטטיים
app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use('/js', express.static(path.join(__dirname, '../js')));

// app.use(express.static(path.join(__dirname, '../html')));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', '../views');

// Function to generate a verification token
function generateVerificationToken() {
    return crypto.randomBytes(20).toString('hex'); // Generates a 40-character hex string
}

// Endpoint to fetch all leads
app.get('/leads', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM leads');  // Query to get leads from database
        res.json(result.rows);  // Return leads as JSON
    } catch (error) {
        console.error("Error fetching leads:", error);
        res.status(500).send({ error: 'Failed to fetch leads' });
    }
});

// Endpoint to fetch products for a specific lead based on phone number
app.get('/leads/:id/products', async (req, res) => {
    const leadId = req.params.id;
    try {
        // Query to fetch product name and view date for the given lead phone number
        const result = await client.query('SELECT productName, viewDate FROM products WHERE lead_phone = $1', [leadId]);
        res.json(result.rows); // Return products as JSON
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send({ error: 'Failed to fetch products' });
    }
});

//Endpoint for getting results from the database according to "search by"
app.post('/searchBy', async (req, res) => {
    console.log('post');
    const { selectedSearchBy, searchValue } = req.body;
    const searchPattern = `${searchValue}%`
    if (selectedSearchBy == "productName")
    {
        
        try {
            const query = `SELECT l.* 
                        FROM products p
                        JOIN leads l ON p.lead_phone = l.phone
                        WHERE p.${selectedSearchBy} LIKE $1;
                        `;
            const result = await client.query(query, [searchPattern]);
            console.log("Query successful:", result.rows);
            res.json(result.rows); 
        } catch (error) {
            console.error("Error fetching data:", error);
            res.status(500).send({ error: 'Failed to fetch data' });
        }

    }

    else{
        try{
            const query = `SELECT * FROM leads WHERE ${selectedSearchBy} LIKE $1`;
            const result = await client.query(query, [searchPattern]);
            console.log("Query successful:", result.rows);
            res.json(result.rows); 
        } catch (error) {
            console.error("Error fetching data:", error);
            res.status(500).send({ error: 'Failed to fetch data' });
        }    
    }

});


// Connect to PostgreSQL database
const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL, // Database URL from .env file
});

client.connect()
    .then(() => console.log("Connected to PostgreSQL"))
    .catch((err) => {
        console.error("Connection error", err.stack);
        process.exit(1); // Exit if connection fails
    });    



// Endpoint to handle form submission and add lead to the database
app.post('/submitForm', async (req, res) => {
    const { fullName, phone, email, source, country, company } = req.body;

    // Check if the phone or email already exists in the database
    try {
         const phoneCheck = await client.query('SELECT * FROM leads WHERE phone = $1', [phone]);
         if (phoneCheck.rows.length > 0) {
             return res.status(400).send({ error: 'Lead with this phone number already exists in the system.' });
         }
 
         const emailCheck = await client.query('SELECT * FROM leads WHERE email = $1', [email]);
         if (emailCheck.rows.length > 0) {
             return res.status(400).send({ error: 'Lead with this email already exists in the system.' });
         }

        // If phone does not exist, insert the new lead into the database
        const currentDate = new Date();  // Current date and time
        const status = 'New';            // Default status
        const agent = '';                // Empty for now

        // Insert query to add the lead to the database
        const insertQuery = `
            INSERT INTO leads (phone, name, email, location, company, status, joinDate, source, agent)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;

        await client.query(insertQuery, [
            phone, fullName, email, country, company, status, currentDate, source, agent
        ]);

        res.status(200).send({ success: 'Form submitted successfully. Lead has been added.' });

    } catch (error) {
        console.error("Error processing form submission:", error);
        res.status(500).send({ error: 'Failed to process form submission.' });
    }
});

// Endpoint to update a specific field in a lead
app.put('/leads/:id', async (req, res) => {
    const leadId = req.params.id; // Get the lead ID from the URL parameter
    const { field, value } = req.body; // Extract the field and value from the request body

    // Construct the dynamic SQL query
    const query = `UPDATE leads SET ${field} = $1 WHERE phone = $2`;

    try {
        // Execute the query with parameterized values
        await client.query(query, [value, leadId]);
        res.status(200).send({ success: `Lead with phone ${leadId} updated successfully.` });
    } catch (error) {
        console.error("Error updating lead:", error);
        res.status(500).send({ error: 'Failed to update the lead.' });
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Nodemailer Transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


// רישום משתמש חדש
app.post('/register', async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        // בדיקה אם המשתמש כבר קיים
        const userExists = await client.query('SELECT * FROM public.users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists.Please log in instead!' });
        }

        // יצירת טוקן אימות
        const verificationToken = generateVerificationToken();
        const hashedPassword = await bcrypt.hash(password, 10); // 10 הוא ה-salt rounds

        // הכנסת נתוני המשתמש לדאטהבייס
        await client.query(
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
        const result = await client.query(
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
                            }, 3000); 
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
    res.render('HomePage');
});

 app.get('/login', (req, res) => {
    res.render('loginPage');
});

app.get('/register', (req, res) => {
    res.render('signUp');
});

app.get('/reset-password', (req, res) => {
    res.render('resetPassword');
});

app.get('/addLeadForm', (req, res) => {
    res.render('interestForm');
});


app.get('/personalProfile', (req, res) => {
    res.render('personalProfile');
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});


//LOGIN

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
  
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
  
    try {
        // Find user by email in the database
        const result = await client.query('SELECT * FROM public.users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'This email is not registered. Please check your email or register.' });
        }

        const user = result.rows[0];

        // Check if the user is verified
        if (!user.verified) {
            return res.status(401).json({ error: 'This email is not registered. Please check your email or register.' });
        }
    
        // // Check password
        // const isPasswordValid = await bcrypt.compare(password, user.password);
        // if (!isPasswordValid) {
        //     return res.status(401).json({ error: 'The password you entered is incorrect. Please try again.' });
        // }

        // Check password (without bcrypt)
        if (password !== user.password) {
            return res.status(401).json({ error: 'The password you entered is incorrect. Please try again.' });
        }

    
        // Generate JWT
        const token = jwt.sign({ email: user.email, id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
        res.status(200).json({ message: 'Login successful', token });
        // res.redirect('/home');

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
  

// PASSWORD RESET

app.get('/reset-password', (req, res) => {
    res.render('resetPassword');
});

app.get('/set-new-password', (req, res) => {
    res.render('setNewPassword');
});


  
// PASSWORD RESET
  
app.get('/password-reset', (req, res) => {
    res.status(200).json({ message:'This is the password reset page placeholder.'});
});
  
app.post('/api/reset-password', async (req, res) => {
    const { email } = req.body;
    try {
        const result = await client.query('SELECT * FROM public.users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'This email is not registered.' });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            // text: `Click the link below to reset your password.\n\nhttp://localhost:3000/set-new-password?email=${email}`,
            html: `
            <p>Hello,</p>
            <p>We received a request to reset your password. You can reset your password by clicking the link below:</p>
            <p>
                <a href="http://localhost:3000/set-new-password?email=${email}" style="color: #007BFF; text-decoration: none; font-weight: bold;">
                    Reset Your Password
                </a>
            </p>
            <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
            <p>Thank you,<br>Your Website Team</p>
        `    
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Password reset link has been sent to your email.' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred. Please try again later.' });
    }
});

app.post('/api/set-new-password', async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }

    try {
        // Update password in DB without encryption
        const result = await client.query('UPDATE public.users SET password = $1 WHERE email = $2', [newPassword, email]);
        if (result.rowCount === 0) {
            return res.status(400).json({ message: 'User not found.' });
        }
        res.send({ message: 'Password has been successfully changed!' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred. Please try again later.' });
    }
});


//   // Placeholder routes for registration and password reset
//   app.get('/register', (req, res) => {
//     res.status(200).send('This is the registration page placeholder.');
//   });


// Start the server and listen for incoming HTTP requests
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

