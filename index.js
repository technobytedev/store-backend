require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const { sequelize, User, UserDetails } = require('./models');
const { or } = require('sequelize');
const validator = require('validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;


const app = express();
const port = 8000;

// Middleware to parse JSON bodies
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;
const BEARER_JWT_EXPIRES_IN = process.env.BEARER_JWT_EXPIRES_IN;

//---------------------------LOGIN-----------------------------------//
app.post('/login', async (req, res) => {
  
  try {
    const { username, password } = req.body;
    const user = await User.findAll({
      where: {
        username: username,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User or Email not found' });
    }

    const match = await bcrypt.compare(password, user[0].password);

    if (!match) {
       return res.status(404).json({ error: 'Incorrect password. '});
    }

    // Generate a JWT
   const bearerToken = jwt.sign(
     { id: user[0].id,
       username: user[0].username
     },
     JWT_SECRET,
     { expiresIn: BEARER_JWT_EXPIRES_IN }
   );
    const response = {
      message: "Logged in successfully.",
      data: user,
      bearerToken: bearerToken
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error loggin user:', error);
    res.status(500).json({ error: 'Unable to login user' });
  }
});

app.get('/', async (req, res) => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    res.send('Hello World!');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    res.status(500).send('Unable to connect to the database');
  }
});


//---------------------------REGISTRATION-----------------------------------//
app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  let errors = {};
  
  if (!username) {
    errors.username = 'Username is required.';
  }
  if (username.length < 6) {
    errors.username = `Username must be at least 6 characters long.`
  }
  
  if (!password) {
    errors.password = 'Password is required.';
  }

  const passwordOptions = {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  };

  const validatePassword = (password, options) => {
    const { minLength, minLowercase, minUppercase, minNumbers, minSymbols } = options;
    const errorMessages = [];

    if (password.length < minLength) {
      errorMessages.push(`Password must be at least ${minLength} characters long.`);
    }
    if ((password.match(/[a-z]/g) || []).length < minLowercase) {
      errorMessages.push(`Password must contain at least ${minLowercase} lowercase letter(s).`);
    }
    if ((password.match(/[A-Z]/g) || []).length < minUppercase) {
      errorMessages.push(`Password must contain at least ${minUppercase} uppercase letter(s).`);
    }
    if ((password.match(/[0-9]/g) || []).length < minNumbers) {
      errorMessages.push(`Password must contain at least ${minNumbers} number(s).`);
    }
    if ((password.match(/[\W_]/g) || []).length < minSymbols) {
      errorMessages.push(`Password must contain at least ${minSymbols} symbol(s).`);
    }

    return errorMessages.length ? errorMessages : true;
  };
    
  const passwordValidationResult = validatePassword(password, passwordOptions);

  if (passwordValidationResult !== true) {
    errors.password = passwordValidationResult;
  }

  if(!validator.isEmail(email)) {
     errors.email = 'Please enter a valid email.'
  } 

  if (!email) {
    errors.email = 'Email is required.';
  }

  if (errors.password) {
    return res.status(400).json({ message: "Signup error.", error: errors });
  }

  const existingUsers = await User.findOne({
      where: { email: email }
  });
  
  if (existingUsers) {
    errors.email = 'Email already registered.'
  }

  if (Object.keys(errors).length) {
    return res.status(400).json({ message: "Signup error.", error: errors });
  }

  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedPassword = bcrypt.hashSync(password, salt);

  console.log("hashedPassword ")
  console.log(hashedPassword)

  try {
    const newUser = await User.create({ username, password: hashedPassword, email });
    res.status(201).json({ message: "Registered successfully.", data: newUser });
  } catch (error) {
    console.error('Error inserting user:', error);
    res.status(500).json({ error: 'Unable to insert user.' });
  }
});

// Route to get all users
app.get('/users', async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        message: "Error! Token was not provided."
      });
    }

    // Verify the token
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        message: "Error! Invalid token.",
        error: error.message
      });
    }

    // Retrieve all users
    const users = await User.findAll();

    // Construct response
    const response = {
      data: users
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ error: 'Unable to retrieve users' });
  }
});


// Route to update a user
app.put('/user/update', async (req, res) => {
  try {
    const { id, username, password, email } = req.body;
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        message: "Error! Token was not provided."
      });
    }

    // Verify the token
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        message: "Error! Invalid token.",
        error: error.message
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.username = username;
    user.password = password;
    user.email = email;
    await user.save();

    const response = {
      message: "User updated successfully.",
      data: user,
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Unable to update user' });
  }
});

// Add User Details
app.post('/user-detail/add', async (req, res) => {
  try {
    const { userId, firstname, lastname  } = req.body;
    const user = await UserDetails.create({ userId, firstname, lastname });

    const response = {
      message: "User detail added successfully.",
      data: user
    }

    res.status(201).json(response);

  } catch (error) {
    console.error('Error inserting user:', error);
    res.status(500).json({ error: 'Unable to insert user' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
