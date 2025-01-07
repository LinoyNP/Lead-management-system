import express from 'express';
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';

import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto'; // Importing crypto for token generation
dotenv.config();


const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

 
// Nodemailer Transporter configuration
const transporter = nodemailer.createTransport({
    service: "gmail", // SMTP service provider (can be changed to another service)
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Application password for the email
    },
  });

  // Define the generateVerificationToken function before its usage
function generateVerificationToken() {
    return crypto.randomBytes(20).toString('hex'); // Generates a 40-character hex string
}


// Registration endpoint (example)
app.post('/register', (req, res) => {
    const { fullName, email, password } = req.body;

    // Generate a unique verification token when user registers
    /*const verificationToken = generateVerificationToken();

    // Example: Save the user data along with the verification token (you could save this to a database)
    /*const user = { fullName, email, password, verificationToken, verified: false };

    // For now, we store users in a temporary array
    /*users.push(user); */

    // Send the verification email
    /*sendVerificationEmail(email, verificationToken);*/

    // Respond back that the user is registered

    res.status(200).send('User registered successfully.');
});


// Send email with the token
app.post('/send-email', async (req, res) => {
    try {
        const { email, subject, message } = req.body;
        const verificationToken = generateVerificationToken(); // Create the token

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject,
            html: `${message} <a href="http://localhost:3000/verify-email?token=${verificationToken}">click here to verify your email.</a>`
        };

        await transporter.sendMail(mailOptions);

        // אם המייל נשלח בהצלחה, מחזירים סטטוס 200
        res.status(200).send({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);

        // במקרה של שגיאה, מחזירים סטטוס 500
        res.status(500).send({ error: 'Failed to send email' });
    }
});

// Send email endpoint
/*app.post('/send-email', (req, res) => {
    const { email, subject, message } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.status(500).send('Failed to send email.');
        } else {
            console.log('Email sent:', info.response);
            res.status(200).send('Email sent successfully.');
        }
    });
});*/

// Function to send verification email with the token link
/*function sendVerificationEmail(userEmail, verificationToken) {
    const mailOptions = {
        from: process.env.EMAIL_USER, // The sender's email address
        to: userEmail, // Recipient's email address
        subject: 'Account Verification', // Subject of the email
        html: `<p>Click <a href="http://localhost:3000/verify-email?token=${verificationToken}">here</a> to verify your email address and activate your account.</p>`,
        // The body of the email, which includes the verification link
    };

    // Sending the email using Nodemailer
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error); // Log if there's an error
        } else {
            console.log('Verification email sent:', info.response); // Log the success
        }
    });
}*/

// Verification endpoint (when the user clicks the verification link in their email)
app.get('/verify-email', (req, res) => {
    const { token } = req.query; // Extract the token from the query parameter

    // Find the user by the verification token
    const user = users.find(u => u.verificationToken === token); 

    if (user) {
        // If the token matches, mark the user as verified
        user.verified = true;
        res.send('<h1>Your email has been successfully verified!</h1>'); // Send a success message to the user
    } else {
        // If the token is invalid or expired, show an error message
        res.send('<h1>Invalid or expired verification link.</h1>');
    }
});

// Example users array to temporarily store users (can be replaced with a database)
let users = [];



// URI MongoDB
const uri = "mongodb+srv://chayami:KXwRU0GteUWetJY4@leadsmanagement.aoz66.mongodb.net/?retryWrites=true&w=majority&appName=LeadsManagement";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

//connecting to MongoDB
async function connectToDB() {
    try {
        await client.connect();
        const db = client.db("LeadsTable");
        console.log("Connected to database: Leads");
        return db.collection("Leads table");  
    } catch (err) {
        console.error("Connection failed:", err); 
        throw err;
    }
}

app.get("/leads", async (req, res) => {
    try {
        const leadsCollection = await connectToDB();
        const leads = await leadsCollection.find({}).toArray();
        console.log("Leads fetched:", leads);
        res.json(leads);
    } catch (err) {
        console.error("Failed to fetch leads:", err);
        res.status(500).send("Error fetching leads");
    }
});

// add new lead
app.post("/leads", async (req, res) => {
    const newLead = req.body;
    const phone = newLead.phone;

    console.log("Adding lead:", newLead); 

    // mast get phone number because is a ID
    if (!phone) {
        return res.status(400).json({ error: "Phone number is required" });
    }

    try {
        const leadsCollection = await connectToDB();

        const leadWithPhoneAsId = {
            _id: phone,  // phone is the ID
            ...newLead,
        };

        const result = await leadsCollection.insertOne(leadWithPhoneAsId);
        console.log("Lead added:", result); 
        res.json({ message: "Lead added successfully", lead: result.ops[0] });
    } catch (err) {
        console.error("Failed to add lead:", err);
        res.status(500).json({ error: "Failed to add lead" });
    }
});

// update Lead
app.put("/leads/:id", async (req, res) => {
    const leadId = req.params.id;
    const { field, value } = req.body;

    try {
        const leadsCollection = await connectToDB();
        const result = await leadsCollection.updateOne(
            { _id: new ObjectId(leadId) },
            { $set: { [field]: value } }
        );
        res.json({ message: "Lead updated", result });
    } catch (err) {
        console.error("Failed to update lead:", err);
        res.status(500).send("Error updating lead");
    }
});

// hearing requests for port 3000
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});



