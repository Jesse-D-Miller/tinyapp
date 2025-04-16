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
    id: "QuxY1J",
    email: "kaladin@windrunners.com",
    password: "protect-heal-lead",
  },
  NZRbQO: {
    id: "NZRbQO",
    email: "shallan@lightweavers.org",
    password: "truths-and-illusions",
  },
  n7xlMf: {
    id: "n7xlMf",
    email: "dalinar@bondsmiths.gov",
    password: "unite-them",
  },
  gtLj8R: {
    id: "gtLj8R",
    email: "vin@scadrial.net",
    password: "steelpush-coinshot",
  },
  ci2kRX: {
    id: "ci2kRX",
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
}

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

//make edit form actually edit the object
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls")
});

//========>login/logout handler

app.post("/login", (req, res) => {
  //set username ----> login (req)
  res.cookie("userId", req.body.userId);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect("/urls")
});

//========>registration handler

app.post("/register", (req, res) => {
  console.log("New User Resgistration: ", req.body);

  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  users[userId] = { userId, email, password };
  console.log(" User Account Created: ", users[userId]);

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
  userId = req.cookies["userId"];
  console.log(users[userId]);
  const templateVars = {
    user: users[userId],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  userId = req.cookies["userId"];
  const templateVars = { user: users[userId] };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  userId = req.cookies["userId"];
  const templateVars = { user: users[userId] };
  res.render("register", templateVars);
});

//===========================================================>ambiguous GET

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  userId = req.cookies["userId"];
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
