const Model = require('../users/users-model');
/*
  If the user does not have a session saved in the server

  status 401
  {
    "message": "You shall not pass!"
  }
*/
function restricted(req, res, next) {
  if (!req.session || !req.session.user) {
    res.status(401).json({ message: 'You shall not pass!' });
    return;
  } else {
    next();
  }
}

/*
  If the username in req.body already exists in the database

  status 422
  {
    "message": "Username taken"
  }
*/
async function checkUsernameFree(req, res, next) {
  const { username } = req.body;
  const validUser = await Model.findBy({ username });

  if (validUser) {
    res.status(422).json({ message: "Username taken" });
    return;
  }else {
    next();
  }
}

/*
  If the username in req.body does NOT exist in the database

  status 401
  {
    "message": "Invalid credentials"
  }
*/
function checkUsernameExists(req, res, next) {
  if (!req.body.username) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }else {
    next();
  }
}

/*
  If password is missing from req.body, or if it's 3 chars or shorter

  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
*/
function checkPasswordLength(req, res, next) {
  if (!req.body.password || req.body.password.length <= 3) {
    res.status(422).json({ message: "Password must be longer than 3 chars" });
    return;
  }else {
    next();
  }
}

module.exports = {
  restricted,
  checkUsernameFree,
  checkUsernameExists,
  checkPasswordLength,
}// Don't forget to add these to the `exports` object so they can be required in other modules
