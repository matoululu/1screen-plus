/* Login.html
================================================== */

if(document.body.className == 'page__login') {
  console.log('navigated to login.html');
  var uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        // User successfully signed in.
        // Return type determines whether we continue the redirect automatically
        // or whether we leave that to developer to handle.
        return true;
      }
    },
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: appPage,
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    ],
    // Terms of service url.
    tosUrl: termsPage,
    // Privacy policy url.
    privacyPolicyUrl: termsPage
  };

  function generateSignin() {
    document.querySelector('.login-form').innerHTML = '<div id="firebaseui-auth-container"></div>';
    ui.start('#firebaseui-auth-container', uiConfig);
  }

  if(document.getElementsByClassName('page-login') != null) {
    document.querySelector('.loading-screen').style.display = 'flex';
    window.onload = function load() {
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          window.location.href = appPage;
        } else {
          document.querySelector('.loading-screen').style.display = 'none';
          document.querySelector('.login').classList.add('main');
          generateSignin()
        }
      });
    }
  }
}

/* Write user data
================================================== */

function writeUserData(userId, userName, userEmail) {
  var data = {
    id: userId,
    username: userName,
    email: userEmail,
    premium: 'no'
  }

  var updates = {};
  updates['users/'+ userId] = data;
  return firebase.database().ref().update(updates);
}