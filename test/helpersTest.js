const { assert } = require('chai');

const { getUserURLsByCookieID, getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {

  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user@example.com")
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID)
  });

  it('should return null if input email is not in database', function() {
    const user = getUserByEmail(testUsers, "superCoolUser@example.com")
    const expectedUserID = null;
    assert.strictEqual(user, expectedUserID)
  });

});

describe('getUserURLsByCookieID', () => {
  const urlDatabase = {
    "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user123" },
    "9sm5xK": { longURL: "http://www.google.com", userID: "user456" },
    "3sd4fD": { longURL: "http://www.example.com", userID: "user123" }
  };

  it('should return an object containing only the URLs that belong to the specified user', () => {
    const userUrls = getUserURLsByCookieID("user123", urlDatabase);
    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user123" },
      "3sd4fD": { longURL: "http://www.example.com", userID: "user123" }
    };
    assert.deepEqual(userUrls, expectedOutput);
  });

  it('should return an empty object if the user has no URLs', () => {
    const userUrls = getUserURLsByCookieID("user789", urlDatabase);
    const expectedOutput = {};
    assert.deepEqual(userUrls, expectedOutput);
  });

  it('should return an empty object if the urlDatabase is empty', () => {
    const emptyDatabase = {};
    const userUrls = getUserURLsByCookieID("user123", emptyDatabase);
    const expectedOutput = {};
    assert.deepEqual(userUrls, expectedOutput);
  });

  it('should not return URLs that belong to a different user', () => {
    const userUrls = getUserURLsByCookieID("user456", urlDatabase);
    const expectedOutput = {
      "9sm5xK": { longURL: "http://www.google.com", userID: "user456" }
    };
    assert.deepEqual(userUrls, expectedOutput);
    assert.isUndefined(userUrls["b2xVn2"]);
    assert.isUndefined(userUrls["3sd4fD"]);
  });
});