const router = require('express').Router();
const employer = require('../employerController');
router.post('/create-user', employer.create_user)



module.exports = router;