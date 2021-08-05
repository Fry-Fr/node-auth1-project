const bcrypt = require('bcryptjs');
const router = require('express').Router();
const Model = require('../users/users-model');
const {
  checkUsernameFree,
  checkUsernameExists,
  checkPasswordLength,
} = require('./auth-middleware'); // Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!


/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */
router.post('/register', checkUsernameExists, checkPasswordLength, checkUsernameFree, (req, res, next) => {
  const { username, password } = req.body;
  const passwordHash = bcrypt.hashSync(password, 8);

  Model.add({ username, password: passwordHash })
    .then(newUser => {
      res.json(newUser);
    })
    .catch(err => next(err))
});


/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */
router.post('/login',checkUsernameExists, checkPasswordLength, (req, res, next) => {
  const { username, password } = req.body;

  Model.findBy({ username })
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
        res.json({ message: `Welcome ${user.username}!` });
      }else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    })
    .catch(err => next(err))
});


/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */
router.get('/logout', (req, res, next) => {
  if (req.session && req.session.user) {
    req.session.destroy(err => {
      res.json({ message: "Logged out" });
    });
  }else {
    res.json({ message: "no session" });
  }
});

 
module.exports = router; // Don't forget to add the router to the `exports` object so it can be required in other modules
