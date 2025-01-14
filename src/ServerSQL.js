import express from 'express';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
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
app.use(express.static(path.join(__dirname, '../js')));
app.use(express.static(path.join(__dirname, '../css')));
app.use(express.static(path.join(__dirname, '../html')));

// Configure nodemailer for email sending
const transporter = nodemailer.createTransport({
    service: "gmail", // SMTP service provider (can be changed to another service)
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Application password for the email
    },
});

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

// Start the server and listen for incoming HTTP requests
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
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

