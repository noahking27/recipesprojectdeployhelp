/* eslint-disable no-use-before-define */
$(document).ready(function() {
  // Getting references to our form and input
  var signUpForm = $('form.signup');
  var fnameInput = $('input#fname-input');
  var lnameInput = $('input#lname-input');
  var emailInput = $('input#email-input');
  var passwordInput = $('input#password-input');

  // When the signup button is clicked, we validate the email and password are not blank
  signUpForm.on('submit', function(event) {
    event.preventDefault();

    var fnameValid = validateNameInput(fnameInput.val().trim());
    var lnameValid = validateNameInput(lnameInput.val().trim());
    var emailValid = validateEmailInput(emailInput.val().trim());

    if (fnameValid === false) {
      textInputError('#fname-error-alert', '#fname-error-msg', 'Invalid first name field. Must be alphabetical.');
    } else {
      hideError('#fname-error-alert');
    }

    if (lnameValid === false) {
      textInputError('#lname-error-alert', '#lname-error-msg', 'Invalid last name field. Must be alphabetical.');
    } else {
      hideError('#lname-error-alert');
    }

    if (emailValid === false) {
      textInputError('#email-error-alert', '#email-error-msg', 'Invalid email address field.');
    } else {
      hideError('#email-error-alert');
    }

    if (fnameValid === true && lnameValid === true && emailValid === true) {
      var userData = {
        fname: fnameInput.val().trim(),
        lname: lnameInput.val().trim(),
        email: emailInput.val().trim(),
        password: passwordInput.val().trim()
      };
    } else {
      return;
    }

    if (!userData.fname || !userData.lname || !userData.email || !userData.password) {
      return;
    }

    // If we have an email and password, run the signUpUser function
    signUpUser(userData.fname, userData.lname, userData.email, userData.password);
    emailInput.val('');
    passwordInput.val('');
  });

  // Does a post to the signup route. If successful, we are redirected to the members page
  // Otherwise we log any errors
  function signUpUser(fname, lname, email, password) {
    $.post('/api/signup', {
      fname: fname,
      lname: lname,
      email: email,
      password: password
    })
      .then(function() {
        window.location.replace('/members');
        // If there's an error, handle it by throwing up a bootstrap alert
      })
      .catch(handleLoginErr);
  }

  function handleLoginErr(err) {
    $('#alert .msg').text(err.responseJSON);
    $('#alert').fadeIn(500);
  }
});

function textInputError(type, messageContainer, message) {
  $(type + ' ' + messageContainer).text(message);
  $(type).fadeIn(500);
}

function hideError(type) {
  $(type).hide();
}

function validateNameInput(input) {
  var rmSp = input.trim();
  var result = rmSp.search(/^[A-Za-z\s']+$/); //check to make sure the input is alphabetical
  return (result === 0 ? true : false); //return true if it is alphabetical, false if not
}

function validateEmailInput(input) {
  var rmSp = input.trim();
  var result = rmSp.search(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/); //check to make sure the input is in email format
  return (result === 0 ? true : false); //return true if it is in email format
}
