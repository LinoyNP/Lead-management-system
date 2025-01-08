// Function to connect to the database for Users collection
async function connectToUsersDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB Users database!");
        const db = client.db("UserManagement");
        return db.collection("Users");
    } catch (err) {
        console.error("Failed to connect to Users MongoDB:", err);
        throw err;
    }
}


// User registration
app.post("/register", async (req, res) => {
    const { fullName, email, password } = req.body;
  
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
  
    try {
      const usersCollection = await connectToUsersDB();
  
      // Check if the user already exists
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
  
      // Create a new user with verification token
      const verificationToken = generateVerificationToken();
      const newUser = {
        fullName,
        email,
        password,
        verified: false,
        verificationToken,
        createdAt: new Date(),
      };
  
      // Save the user in the database
      await usersCollection.insertOne(newUser);
  
      
      // Send verification email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Please Verify Your Account",
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
      res.status(200).json({ message: "User registered successfully. Please check your email to verify your account." });
    } catch (err) {
      console.error("Error registering user:", err);
      res.status(500).json({ error: "Error registering user" });
    }
  });
  
  // Email verification
  app.get("/verify-email", async (req, res) => {
    const { token } = req.query;
  
    if (!token) {
      return res.status(400).send("<h1>Invalid or missing token.</h1>");
    }
  
    try {
      const usersCollection = await connectToUsersDB();
  
      // Find user by token
      const user = await usersCollection.findOne({ verificationToken: token });
  
      if (!user) {
        return res.status(400).send("<h1>Invalid or expired verification link.</h1>");
      }
  
      // Update user status to verified
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { verified: true }, $unset: { verificationToken: "" } }
      );
  
      /*res.send("<h1>Your email has been successfully verified! You can now log in.</h1>");*/
      res.send(`
        <h1>Your email has been successfully verified! You can now log in.</h1>
        <p><a href="http://localhost:${port}/login">Click here to log in</a></p>
      `);
      
    } catch (err) {
      console.error("Error verifying email:", err);
      res.status(500).send("<h1>Error verifying email.</h1>");
    }
  });
  
  // User login
  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
  
    try {
      const usersCollection = await connectToUsersDB();
  
      // Find user by email and password
      const user = await usersCollection.findOne({ email, password });
  
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
  
      if (!user.verified) {
        return res.status(403).json({ error: "Please verify your email before logging in" });
      }
  
      res.status(200).json({ message: "Login successful", user });
    } catch (err) {
      console.error("Error logging in:", err);
      res.status(500).json({ error: "Error logging in" });
    }
  });
  
