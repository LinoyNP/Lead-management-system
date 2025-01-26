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
import session from 'express-session';
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
app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use('/js', express.static(path.join(__dirname, '../js')));

app.use('/login',(req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
});

// app.use(express.static(path.join(__dirname, '../html')));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', '../views');

// Function to generate a verification token
function generateVerificationToken() {
    return crypto.randomBytes(20).toString('hex'); // Generates a 40-character hex string
}

app.use(session({
    secret:process.env.SESSION_SECRET  ,  
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

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

// ------------------------------------------- intrest form ----------------------------------------------------//

// Endpoint to handle form submission and add lead to the database
app.post('/submitForm', async (req, res) => {
    const { fullName, phone, email, source, country, company , additionalInfo} = req.body;

    // Check if the phone or email already exists in the database
    try {
         const phoneCheck = await client.query('SELECT * FROM leads WHERE phone = $1', [phone]);
         if (phoneCheck.rows.length > 0) {
             return res.status(400).send({ error: 'Lead with this phone number already exists in the system.' });
         }
 
        //  const emailCheck = await client.query('SELECT * FROM leads WHERE email = $1', [email]);
        //  if (emailCheck.rows.length > 0) {
        //      return res.status(400).send({ error: 'Lead with this email already exists in the system.' });
        //  }

        // If phone does not exist, insert the new lead into the database
        const currentDate = new Date();  // Current date and time
        const status = 'New';            // Default status
        const agent = '';                // Empty for now

        // Insert query to add the lead to the database
        const insertQuery = `
            INSERT INTO leads (phone, name, email, location, company, status, joinDate, source, agent, additional_info)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `;

        await client.query(insertQuery, [
            phone, fullName, email, country, company, status, currentDate, source, agent, additionalInfo
        ]);

        res.status(200).send({ success: 'Form submitted successfully. Lead has been added.' });

    } catch (error) {
        console.error("Error processing form submission:", error);
        res.status(500).send({ error: 'Failed to process form submission.' });
    }
});

//---------------------------------------------- leads table ----------------------------------------------------//

// Endpoint to fetch all leads
app.get('/leads', async (req, res) => {
    try {
        const email = req.query.email;
        // const result = await client.query('SELECT * FROM leads;');  // Query to get leads from database
        const result = await client.query('SELECT * FROM leads WHERE agent IN (SELECT full_name FROM users WHERE users.email = $1);', [email]);
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

// Endpoint to update a specific field in a lead
app.put('/leads/:id', async (req, res) => {
    const leadId = req.params.id; 
    const { fieldName, newValue } = req.body; 

    // filed that I can update
    const validFields = ['name', 'phone', 'email', 'location', 'company', 'status', 'source','joindate', 'agent'];
    
    if (!validFields.includes(fieldName)) {
        return res.status(400).send({ error: 'Invalid field name for update.' });
    }

    try {
        // update filed in the database
        const query = `UPDATE leads SET ${fieldName} = $1 WHERE phone = $2`;
        await client.query(query, [newValue, leadId]);
        res.status(200).send({ success: 'Field updated successfully.' });
    } catch (error) {
        console.error("Error updating field:", error);
        res.status(500).send({ error: 'Failed to update field.' });
    }
});

// // Endpoint to chack validation to update agent filed
// app.get('/check-agent', async (req, res) => {
//     const agentName = req.query.agentName;

//     try {
//         const result = await client.query('SELECT * FROM users WHERE full_name = $1', [agentName]);
//         // chack if the agent exists in the database
//         if (result.rows.length > 0) {
//             res.status(200).send({ exists: true });
//         } else {
//             res.status(200).send({ exists: false });
//         }
//     } catch (error) {
//         console.error("Error checking agent:", error);
//         res.status(500).send({ error: 'Failed to check agent' });
//     }
// });


// -------------------------------------- additional query ----------------------------------------------------//

//Endpoint for getting results from the database for show new leads
app.post('/newLeads', async (req, res) => {
    try {
        const query = `SELECT * FROM leads WHERE agent IS NULL OR agent = '';`;
        const result = await client.query(query);
        console.log("Query successful:", result.rows);
        res.json(result.rows); 
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send({ error: 'Failed to fetch data' });
    }
    
});

//Endpoint for getting results from the database according to "search by"
app.post('/searchBy', async (req, res) => {
    console.log('post');
    const { selectedSearchBy, searchValue, agentEmail } = req.body;
    const searchPattern = `${searchValue}%`
    if (selectedSearchBy == "productName")
    {
        
        try {
            let query = `SELECT l.* 
                        FROM products p
                        JOIN leads l ON p.lead_phone = l.phone
                        WHERE p.${selectedSearchBy} LIKE $1 
                        AND l.agent IN ( SELECT full_name FROM users WHERE email = $2);`;
            const resultQueryLeads = await client.query(query, [searchPattern, agentEmail]);
            console.log("Query successful:", resultQueryLeads.rows);
            //Results of the products by which leads are searched
            query = `SELECT p.productName 
                    FROM products p
                    JOIN leads l ON p.lead_phone = l.phone
                    WHERE p.${selectedSearchBy} LIKE $1 
                    AND l.agent IN ( SELECT full_name FROM users WHERE email = $2);`;
            const resultQueryProduct = await client.query(query, [searchPattern, agentEmail]);
            res.json([resultQueryLeads.rows, resultQueryProduct.rows]); 
        } catch (error) {
            console.error("Error fetching data:", error);
            res.status(500).send({ error: 'Failed to fetch data' });
        }

    }

    else{
        try{
            let query = `SELECT * FROM leads WHERE ${selectedSearchBy} LIKE $1 
                        AND agent IN ( SELECT full_name FROM users WHERE email = $2);`;
            const result = await client.query(query, [searchPattern, agentEmail]);
            console.log("Query successful:", result.rows);
            
            //Results of the "Search by" criteria(location,email,company, name) by which leads are searched
            query = `SELECT ${selectedSearchBy} FROM leads WHERE ${selectedSearchBy} LIKE $1 
                        AND agent IN ( SELECT full_name FROM users WHERE email = $2);`;
            
            const resultQueryCriterion =  await client.query(query, [searchPattern, agentEmail]);
            res.json([result.rows, resultQueryCriterion.rows]); 
        } catch (error) {
            console.error("Error fetching data:", error);
            res.status(500).send({ error: 'Failed to fetch data' });
        }    
    }
});

// Search engine for "new leads"
app.post('/searchByForNewLeads', async (req, res) => {
    console.log('post');
    const { selectedSearchBy, searchValue } = req.body;
    const searchPattern = `${searchValue}%`
    if (selectedSearchBy == "productName")
    {
        
        try {
            let query = `SELECT l.* 
                        FROM products p
                        JOIN leads l ON p.lead_phone = l.phone
                        WHERE p.${selectedSearchBy} LIKE $1 
                        AND (l.agent IS NULL OR l.agent = '');`;
            const resultQueryLeads = await client.query(query, [searchPattern]);
            console.log("Query successful:", resultQueryLeads.rows);
            //Results of the products by which leads are searched
            query = `SELECT p.productName 
                    FROM products p
                    JOIN leads l ON p.lead_phone = l.phone
                    WHERE p.${selectedSearchBy} LIKE $1 
                    AND (l.agent IS NULL OR l.agent = '');`;
            const resultQueryProduct = await client.query(query, [searchPattern]);
            res.json([resultQueryLeads.rows, resultQueryProduct.rows]); 
        } catch (error) {
            console.error("Error fetching data:", error);
            res.status(500).send({ error: 'Failed to fetch data' });
        }

    }

    else{
        try{
            let query = `SELECT * FROM leads WHERE ${selectedSearchBy} LIKE $1 
                        AND (agent IS NULL OR agent = '');`;
            const result = await client.query(query, [searchPattern]);
            console.log("Query successful:", result.rows);
            
            //Results of the "Search by" criteria(location,email,company, name) by which leads are searched
            query = `SELECT ${selectedSearchBy} FROM leads WHERE ${selectedSearchBy} LIKE $1 
                        AND (agent IS NULL OR agent = '');`;
            
            const resultQueryCriterion =  await client.query(query, [searchPattern]);
            res.json([result.rows, resultQueryCriterion.rows]); 
        } catch (error) {
            console.error("Error fetching data:", error);
            res.status(500).send({ error: 'Failed to fetch data' });
        }    
    }
});

// ---------------------------------------- DASHBOARD ----------------------------------------------------//

//Endpoint for getting results from database for pie graph
app.post('/peiGraph', async (req, res) => {
    const agentEmail = req.query.email;
    console.log(agentEmail);
    try {
        let queryForStatus = `SELECT COUNT(*) AS new_leads_count
                        FROM leads
                        WHERE status = 'New' AND agent IN ( SELECT full_name FROM users WHERE email = $1);`;
        let result = await client.query(queryForStatus, [agentEmail]);
        const newCount = result.rows[0].new_leads_count;
        console.log('new count:',newCount);
        queryForStatus = `SELECT COUNT(*) AS new_leads_count
                        FROM leads
                        WHERE status = 'In Process' AND agent IN ( SELECT full_name FROM users WHERE email = $1);`;
        result = await client.query(queryForStatus, [agentEmail]);
        const inProccesCount = result.rows[0].new_leads_count;
        
        queryForStatus = `SELECT COUNT(*) AS new_leads_count
                        FROM leads
                        WHERE status = 'Closed' AND agent IN ( SELECT full_name FROM users WHERE email = $1);`;
        result = await client.query(queryForStatus, [agentEmail]);
        const closedCount = result.rows[0].new_leads_count;
        console.log(newCount, inProccesCount, closedCount)
        res.json([newCount, inProccesCount, closedCount]); 
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send({ error: 'Failed to fetch data' });
    }
});


//Endpoint for getting results from database for pie graph
app.post('/barGraphSalesPerformance', async (req, res) => {
    
    try {
        let queryForStatus = `SELECT u.full_name AS agent_name, COUNT(l.phone) AS lead_count
        FROM users u LEFT JOIN leads l ON u.full_name = l.agent AND l.status = 'Closed' 
        GROUP BY u.full_name;`;
        let result = await client.query(queryForStatus);
        console.log(result.rows[0]);
        res.json(result.rows); 
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send({ error: 'Failed to fetch data' });
    }
});


//--------------------------------------------  users ----------------------------------------------------------//

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

        // Create session (Store user data in session)
        req.session.user = {
            id: user.id,
            email: user.email,
        };

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


//LOG OUT

// Logout route
app.post('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Failed to destroy session:', err);
            return res.status(500).json({ message :'Error logging out.'});
        }
        res.clearCookie('connect.sid');  // Cookie name is typically 'connect.sid' for session management
        return res.status(200).json({ message: 'Logged out successfully.' });
    });
});

// ---------------------------------------------- Server ---------------------------------------------------//

// Start the server and listen for incoming HTTP requests
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});