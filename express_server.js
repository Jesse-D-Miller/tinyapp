const { name } = require("ejs");
const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser());
const PORT = 8080; //default port
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

//===========================================================>Data Storage

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  QuxY1J: {
    userId: "QuxY1J",
    email: "kaladin@windrunners.com",
    password: "protect-heal-lead",
  },
  NZRbQO: {
    userId: "NZRbQO",
    email: "shallan@lightweavers.org",
    password: "truths-and-illusions",
  },
  n7xlMf: {
    userId: "n7xlMf",
    email: "dalinar@bondsmiths.gov",
    password: "unite-them",
  },
  gtLj8R: {
    userId: "gtLj8R",
    email: "vin@scadrial.net",
    password: "steelpush-coinshot",
  },
  ci2kRX: {
    userId: "ci2kRX",
    email: "kelsier@crewofrebels.org",
    password: "survivor-of-hathsin",
  },
};

//===========================================================>functions

function generateRandomString() { //generate string of 6 aplhanumeric chars
  const length = 6;
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let shortURL = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    shortURL += charset[randomIndex];
  }

  return shortURL;
};

lookupUser = (users, inputEmail) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === inputEmail) {
      return { error: "Invalid email! Account already exists", user }; //going to have to refactor this to not contain error message maybe
    }
  }
  return { error: null, user: null };
};

//===========================================================>POST

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;


  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls")
});

//========>login/logout handler

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //look up the user by their email
  const { user } = lookupUser(users, email);
  if (!user) {
    return res.status(403).send("Invalid Email");
  }

  //compare passwords
  if (user.password !== password) {
    return res.status(403).send("Invalid Password");
  }

  //if success -> set cookie and redirect
  res.cookie("userId", user.userId);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect("/login");
});

//========>registration handler

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // 1. if email or password are empty 'required' will not submit
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty.");
  }

  // 2. If someone tries to register with an email that is already in the users object, send back a response with the 400 status code.
  const { error, user } = lookupUser(users, email);
  if (user) {
    return res.status(400).send(error); //send error from lookupUser
  }

  const userId = generateRandomString();
  users[userId] = { userId, email, password };

  console.log("User Account Created: ", users[userId]);

  res.cookie("userId", userId);
  res.redirect("/urls");

});

//===========================================================>GET

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["userId"];
  const templateVars = {
    user: users[userId],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["userId"];
  const templateVars = { user: users[userId] };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const userId = req.cookies["userId"];
  const templateVars = { user: users[userId] };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {

  const templateVars = { user: null };
  res.render("login", templateVars);
});

//===========================================================>ambiguous GET

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["userId"];
  const templateVars = {
    user: users[userId],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

//===========================================================>LISTENER

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
