const generateRandomString = () => { //generate string of 6 aplhanumeric chars
  const length = 6;
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let shortURL = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    shortURL += charset[randomIndex];
  }

  return shortURL;
};

const getUserByEmail = (users, inputEmail) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === inputEmail) {
      return user;
    }
  }
  
  return null;
};

const getUserURLsByCookieID = (cookieID, urlDatabase) => {
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

module.exports = { getUserURLsByCookieID, getUserByEmail, generateRandomString};