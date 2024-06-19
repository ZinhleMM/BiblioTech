// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidEmailConfirmation(email, emailConfirmation){
      return email === emailConfirmation;
}

/* user name must be
1. At leaset 3 character long
2. Must not be longer than 20 characters
3. Must only contain letters, numbers, hyphens, or underscores
*/

function isValidUsername(username){
    return /^[a-zA-Z0-9-_]{3,20}$/.test(username);
}

function isValidPassword(password){
    return password.length >= 8;
}

function isValidPasswordConfirmation(password, passwordConfirmation){
    return password === passwordConfirmation;
}

module.exports = {
    isValidEmail,
    isValidPassword,
    isValidEmailConfirmation,
    isValidPasswordConfirmation,
    isValidUsername
}