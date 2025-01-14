import nodemailer from 'nodemailer';
import crypto from 'crypto';
import User from './models/User.js';  // שימוש ב-`import`

// פונקציה לאימות סיסמה
export function validatePassword(password) {
  const passwordErrors = [];
  if (password.length < 8) passwordErrors.push("Password must be at least 8 characters long.");
  if (!/[A-Z]/.test(password)) passwordErrors.push("Password must contain at least one uppercase letter (A-Z).");
  if (!/[a-z]/.test(password)) passwordErrors.push("Password must contain at least one lowercase letter (a-z).");
  if (!/\d/.test(password)) passwordErrors.push("Password must contain at least one digit (0-9).");
  return passwordErrors;
}
 
const handleRegister = async (event) => {
  event.preventDefault();
  const name = event.target.name.value;
  const email = event.target.email.value;
  const password = event.target.password.value;

  // בדיקת תקינות הסיסמה
  const passwordErrors = validatePassword(password);
  if (passwordErrors.length > 0) {
    alert(passwordErrors.join('\n')); // הצגת הודעת שגיאה
    return;
  }

  // בדיקת תקינות האימייל
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailPattern.test(email)) {
    alert('The email format is invalid.');
    return;
  }

  // שליחת הבקשה לשרת
  try {
    const response = await fetch('http://localhost:3002/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.text();
    alert(data); // הודעת הצלחה או שגיאה
  } catch (error) {
    alert('Error during registration: ' + error.message);
  }
};


// reset password

const resetPasswordDisplay = async (req, res) => {
  let employer = await Employer.findOne({email:req.params.email})
  if (employer) {
     res.render('../views/resetPasswordEmployer', employer);
  } 
  else {
      return res.status(400).send('That email is error!');
  }
}
const resetPassword = async (req, res) => {

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt);
  let employer = await Employer.findOneAndUpdate({email: req.params.email}, { password: password}, {new: true });
  res.redirect(`/employer/homePage/${req.params.email}`);
}
