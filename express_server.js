const { name } = require("ejs");
const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { getUserURLsByCookieID, getUserByEmail, generateRandomString } = require("./helpers.js");
const app = express();
app.use(cookieSession({
  name: 'session',
  keys: ['your-secret-key', 'another-secret-key'],
  maxAge: 24 * 60 * 60 * 1000
}));
const PORT = 8080; //default port
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

//===========================================================>Data Storage

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "NZRbQO",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "NZRbQO",
  },
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "QuxY1J",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "QuxY1J",
  },
};

const users = {
  QuxY1J: {
    userId: "QuxY1J",
    email: "kaladin@windrunners.com",
    hashedPassword: bcrypt.hashSync("protect-heal-lead", 10),
  },
  NZRbQO: {
    userId: "NZRbQO",
    email: "shallan@lightweavers.org",
    hashedPassword: bcrypt.hashSync("truths-and-illusions", 10),
  },
  n7xlMf: {
    userId: "n7xlMf",
    email: "dalinar@bondsmiths.gov",
    hashedPassword: bcrypt.hashSync("unite-them", 10),
  },
  gtLj8R: {
    userId: "gtLj8R",
    email: "vin@scadrial.net",
    hashedPassword: bcrypt.hashSync("steelpush-coinshot", 10),
  },
  ci2kRX: {
    userId: "ci2kRX",
    email: "kelsier@crewofrebels.org",
    hashedPassword: bcrypt.hashSync("survivor-of-hathsin", 10),
  },
};

//===========================================================>POST
//user input from /urls --> creates shortURL --> constructs object
app.post("/urls", (req, res) => {
  if (req.session["userId"] === undefined) {
    return res.status(400).send("You must be logged in to shorten URLs.");
  }

  console.log(req.body); // Log the POST request body to the console

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session["userId"],
  };


  res.redirect(`/urls/${shortURL}`);
});

//========>login/logout handler

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //look up the user by their email
  const user = getUserByEmail(users, email);
  if (!user) {
    return res.status(403).send("Invalid Email");
  }

  //compare passwords
  if (!bcrypt.compareSync(password, user.hashedPassword)) {
    return res.status(403).send("Invalid Password");
  }



  // If success -> set session and redirect
  req.session.userId = user.userId;  // Assuming you've stored the userId correctly
  res.redirect("/urls");
});


//when user clicks logout ---> clears cookie and redirects to /login
app.post("/logout", (req, res) => {
  req.session = null;  // Destroy the session
  res.redirect("/login");
});

//========>registration handler

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  // if email or password are empty 'required' will not submit
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty.");
  }

  // If someone tries to register with an email that is already in the users object, send back a response with the 400 status code.
  const user = getUserByEmail(users, email);
  if (user) {
    return res.status(400).send("Invalid email! Account already exists");
  }

  //generate userId and user object
  const userId = generateRandomString();
  users[userId] = { userId, email, hashedPassword };

  console.log("User Account Created: ", users[userId]);

  req.session.userId = userId;
  res.redirect("/urls");

});

//user clicks delete and this deletes the object associated witht the short URL
app.post("/urls/:id/delete", (req, res) => {
  //user ID in object but i think this is supposed to be the short url!!!!
  if (!urlDatabase[req.params.id].userID) {
    return res.status(403).send("Cannot DELETE: That URL belongs to a different user.");
  }
  //if user not logged in
  const userId = req.session["userId"];
  if (!userId) {
    return res.status(403).send("Cannot DELETE: You must be logged in to delete your URLs.");
  }
  //if user does not own URL
  if (userId !== urlDatabase[req.params.id].userID) {
    return res.status(403).send("Cannot DELETE: That URL belongs to a different user.");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//deals with editing, takes short URL and assigns new long URL
app.post("/urls/:id", (req, res) => {
  const userId = req.session["userId"];

  //URL not found
  if (!urlDatabase[req.params.id]) {
    return res.status(403).send("Cannot EDIT: URL not found.");
  }
  //if user not logged in
  if (!userId) {
    return res.status(403).send("Cannot EDIT: You must be logged in to edit your URLs. <a href='/login'>Login</a>");
  }
  //if user does not own URL
  if (userId !== urlDatabase[req.params.id].userID) {
    return res.status(403).send("Cannot EDIT: That URL belongs to a different user.");
  }

  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls")
});

//===========================================================>GET

app.get("/", (req, res) => {
  // res.send("Hello!");
  const userId = req.session["userId"];
  if (!userId){
    res.redirect("/login");
    return;
  }
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.session["userId"];
  if (!userId) {
    return res.status(401).send("You must be logged in to view your URLs. <a href='/login'>Login</a> or <a href='/register'>Register</a>");
  }
  const templateVars = {
    user: users[userId],
    urls: getUserURLsByCookieID(userId, urlDatabase),
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  //check if logged in. RESTRICTED PERMISSION
  if (!req.session["userId"]) {
    res.redirect("/login");
    return;
  }
  const userId = req.session["userId"];
  const templateVars = { user: users[userId] };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  //if logged in --->redirect from /register ---> /urls
  if (req.session["userId"] !== undefined) {
    res.redirect("/urls");
    return;
  }
  const userId = req.session["userId"];
  const templateVars = { user: users[userId] };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  //if logged in --->redirect from /login ---> /urls
  if (req.session["userId"] !== undefined) {
    res.redirect("/urls");
    return;
  }
  const templateVars = { user: null };
  res.render("login", templateVars);
});

//===========================================================>ambiguous GET

// /u/(short url) redirects user to long url
app.get("/u/:id", (req, res) => {
  const shortURLObject = urlDatabase[req.params.id];
  if (!shortURLObject) {
    return res.status(404).send("The shortened URL you are trying to visit does not exist")
  }
  res.redirect(shortURLObject.longURL);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session["userId"];

  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("URL not found.");
  }
  if (!userId) {
    return res.status(403).send("You must be logged in to view this URL.");
  }
  if (urlDatabase[req.params.id].userID !== userId) {
    return res.status(403).send("This URL does not belong to you.");
  }

  const templateVars = {
    user: users[userId],
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
  };
  res.render("urls_show", templateVars);
});

//===========================================================>LISTENER

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
