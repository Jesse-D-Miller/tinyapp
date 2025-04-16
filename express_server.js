const { name } = require("ejs");
const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser());
const PORT = 8080; //default port
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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

app.post("/login", (req, res) => {
  //set username ----> login (req)
  res.cookie("username", req.body.username);
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls")
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
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

//===========================================================>LISTENER

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
