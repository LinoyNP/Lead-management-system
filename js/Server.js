//npm install cors in the cmd before the use

import express from 'express';
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';

import cors from 'cors';
import dotenv from 'dotenv';
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

app.post('/send-email', async (req, res) => {
    try {
        const { email, subject, message } = req.body;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject,
            text: message,
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

// Registration endpoint (example)
app.post('/register', (req, res) => {
    const { fullName, email, password } = req.body;

    // Registration logic here (e.g., save user to database)

    res.status(200).send('User registered successfully.');
});



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



