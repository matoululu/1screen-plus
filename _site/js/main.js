/* App.html & Directory.html
================================================== */

if( document.body.className == 'page__share' || document.body.className == 'page__directory' || document.body.className == 'page__about' || document.body.className == 'page__app' || document.body.className == 'page__changelog' ) {
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


      if(document.body.className == 'page__changelog' || document.body.className == 'page__supporter'  || document.body.className == 'page__about') {
        setTimeout(function(){
          document.querySelector('.loading-screen').style.display = 'none';
        }, 150);
      }

      var currentdate = new Date();
      var datetime =  currentdate.getDate() + "/"
                      + (currentdate.getMonth()+1)  + "/"
                      + currentdate.getFullYear() + " @ "
                      + currentdate.getHours() + ":"
                      + currentdate.getMinutes() + ":"
                      + currentdate.getSeconds();
      var updates = {};
      updates['users/'+ userId + '/last-active'] = datetime;
      return firebase.database().ref().update(updates);

    } else {
      if(document.body.className == 'page__share' ) {
        appReady();
      } else {
        window.location.href = loginPage;
      }

    }
  });
}

function appReady() {

  //Log out eventlistener
  if(document.body.className != 'page__share') {
    document.getElementById('logout').addEventListener('click', function(){
      firebase.auth().signOut();
      window.location.href = homePage;
    });
  } else {
    document.querySelector('.sidebar').remove();
  }


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

  if(document.body.className == 'page__share' ) {
    shareHTML();
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

