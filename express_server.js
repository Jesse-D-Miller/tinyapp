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

urlsForUser = (cookieID, urlDatabase) => {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    let urlEntry = urlDatabase[shortURL];
    if (urlEntry.userID === cookieID) {
      userURLs[shortURL] = {
        longURL: urlEntry.longURL,
        userID: urlEntry.userID,
      };
    }
  }
  return userURLs
};

//===========================================================>POST
//user input from /urls --> creates shortURL --> constructs object
app.post("/urls", (req, res) => {
  if (req.cookies["userId"] === undefined) {
    return res.status(400).send("You must be logged in to shorten URLs.");
  }

  console.log(req.body); // Log the POST request body to the console

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["userId"],
  };


  res.redirect(`/urls/${shortURL}`);
});

//user clicks delete and this deletes the object associated witht the short URL
app.post("/urls/:id/delete", (req, res) => {
  //user ID in object but i think this is supposed to be the short url!!!!
  if (!urlDatabase[req.params.id].userID) {
    return res.status(403).send("Cannot DELETE: That URL belongs to a different user.");
  }
  //if user not logged in
  const userId = req.cookies["userId"];
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
  const userId = req.cookies["userId"];

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

//when user clicks logout ---> clears cookie and redirects to /login
app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect("/login");
});

//========>registration handler

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // if email or password are empty 'required' will not submit
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty.");
  }

  // If someone tries to register with an email that is already in the users object, send back a response with the 400 status code.
  const { error, user } = lookupUser(users, email);
  if (user) {
    return res.status(400).send(error); //send error from lookupUser
  }

  //generate userId and user object
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
  if (!userId) {
    return res.status(401).send("You must be logged in to view your URLs. <a href='/login'>Login</a> or <a href='/register'>Register</a>");
  }
  const templateVars = {
    user: users[userId],
    urls: urlsForUser(userId, urlDatabase),
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  //check if logged in. RESTRICTED PERMISSION
  if (!req.cookies["userId"]) {
    res.redirect("/login");
    return;
  }
  const userId = req.cookies["userId"];
  const templateVars = { user: users[userId] };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  //if logged in --->redirect from /register ---> /urls
  if (req.cookies["userId"] !== undefined) {
    res.redirect("/urls");
    return;
  }
  const userId = req.cookies["userId"];
  const templateVars = { user: users[userId] };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  //if logged in --->redirect from /login ---> /urls
  console.log(req.cookies["userId"]);
  if (req.cookies["userId"] !== undefined) {
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
  const userId = req.cookies["userId"];

  //if user does not own URL
  if (userId !== urlDatabase[req.params.id]) {
    return res.status(403).send("Cannot View: That URL belongs to a different user.");
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
