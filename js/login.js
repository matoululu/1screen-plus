/* Login.html
================================================== */

if(document.body.className == 'page__login') {
  console.log('navigated to login.html');
  document.querySelector('.loading-screen').style.display = 'flex';
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
    privacyPolicyUrl: privacyPage
  };

  function generateSignin() {
    document.querySelector('.login-form').innerHTML = '<div id="firebaseui-auth-container"></div>';
    ui.start('#firebaseui-auth-container', uiConfig);
  }

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      window.location.href = appPage;
    } else {
      document.querySelector('.login').classList.add('main');
      generateSignin();
      document.querySelector('.loading-screen').style.display = 'none';
    }
  });

}

/* Write user data
================================================== */

function setPremium(isPremium) {
  var updates = {};
  updates['users/'+ userId + '/premium'] = isPremium;
  return firebase.database().ref().update(updates);
}
