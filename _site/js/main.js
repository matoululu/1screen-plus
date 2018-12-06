/* App.html & Directory.html
================================================== */

if(document.body.className == 'page__app' || document.body.className == 'page__directory' ) {
  signInCheck();
}

/* Main
================================================== */

function signInCheck() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      isLoggedIn = true;
      userName = user.displayName;
      userEmail = user.email;
      userId = user.uid;

      if(userName == null) {
        toDisplay = userEmail;
      } else {
        toDisplay = 'Hi, '+userName;
      }

      document.querySelector('.username').innerHTML = toDisplay;
      appReady();
    } else {
      window.location.href = loginPage;
    }
  });
}

function appReady() {

  //Log out eventlistener
  document.getElementById('logout').addEventListener('click', function(){
    firebase.auth().signOut();
    window.location.href = homePage;
  });

  //Check if premium
  isPremium();
  //Directory.html specific
  if(document.body.className == 'page__directory' ) {
    directoryHTML();
  }
  //App.html specific
  if(document.body.className == 'page__app' ) {
    appHTML();
  }
}


/* Main Misc
================================================== */

//Get campaign ID
function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });
  return vars;
}

function isPremium() {}

