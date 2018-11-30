/* Globals
================================================== */

const appPage = "/campaigns";
const termsPage = "/terms";
const homePage = "/";
const loginPage = "/login";
const editorPage = "/editor";

var userName, userEmail, userId;
var userPremium = false;
var campaignInfo = new Object();
var campaignList = document.getElementById('campaignList');
var quill;
var quillLoaded = false;

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

/* App.html & Directory.html
================================================== */

if(document.body.className == 'page__app' || document.body.className == 'page__directory' ) {
  signInCheck();
}

/* Index.html
================================================== */

if(document.body.className == 'page__index') {
  console.log('navigated to index.html');

}

/* User
================================================== */

//Firebase auth
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

function signInCheck() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      isLoggedIn = true;
      userName = user.displayName;
      userEmail = user.email;
      userId = user.uid;
      userImage = user.photoURL;


      if(userEmail == null) {
        toDisplay = userName;
      } else {
        toDisplay = userEmail;
      }

      if(userImage == null) {
        textOrImage = 'Logged in as ';
      } else {
        textOrImage = '<img class="shadow" src="'+userImage+'"/>';
      }

      document.querySelector('.username').innerHTML = textOrImage;
      document.querySelector('.username').className += ' username--visible';
      appReady();

    } else {
      window.location.href = loginPage;
    }
  });
}

/* Main
================================================== */

//Contains elements that get updated
function updateElements() {
  closeBtn = document.querySelectorAll('.close');
  inputText = document.querySelectorAll('.block textarea');
  console.log(inputText);
  updateEvents();
}

//Contains events that get updated
function updateEvents() {

  closeBtn.forEach(function(e){
    e.addEventListener('click', function(){
      this.parentNode.remove();
    })
  });

  inputText.forEach(function(e){
    e.addEventListener('input', function(e) {
      changesMade();
      e.srcElement.setAttribute('value', e.srcElement.value);
      e.srcElement.innerHTML = e.srcElement.value;
    });
  });
}

function createBlock(type) {
  let blockColumn = document.getElementById('document-blocks');
  let block = document.createElement('div');
  block.className = 'block shadow block__'+setUniq();

  if(type == 'text') {
    block.innerHTML = '<textarea></textarea><i class="close icon-x"></i>'
  } else if(type == 'link') {

  }

  blockColumn.append(block);
  updateElements();
}

//When app is ready
function appReady() {
  //Log out
  document.getElementById('logout').addEventListener('click', function(){
    firebase.auth().signOut();
    window.location.href = homePage;
  });

  if(document.body.className == 'page__directory' ) {
    readCampaignList();
    var newPostKey = firebase.database().ref().child('campaigns').push().key;
    var createID = document.getElementById('create');
    createID.href = editorPage+'?create=true&id='+newPostKey;
  }

  if(document.body.className == 'page__app' ) {
    console.log('navigated to app.html');

    campaignInfo.id = getUrlVars()['id'];
    campaignInfo.title = document.getElementById('document-title').innerHTML;
    campaignInfo.text = '';
    campaignInfo.blocks = '';

    if(getUrlVars()['create']) {
      createCampaign(campaignInfo);
    } else {
      readCampaignInfo(campaignInfo.id);
    }

    quill = new Quill('#document-content', {
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          [{ 'font': [] }],
          ['bold', 'italic', 'underline', 'strike', { 'align': [] }],
          ['link'],
          [{ 'color': [] }],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }]
        ]
      },
      theme: 'snow'
    });

    //Event listeners

    quill.on('text-change', function(){
      changesMade();
    });

    document.getElementById('save').addEventListener('click', function(){
      displaySavedChanges();

      var saveData = {
        text: JSON.stringify(quill.getContents()),
        title: document.getElementById('document-title').innerHTML,
        blocks: encodeHTML(document.getElementById('document-blocks').innerHTML)
      }
      saveCampaign(saveData, campaignInfo.id);
    });

    setInterval(function() {
      displaySavedChanges('auto');
      var saveData = {
        text: JSON.stringify(quill.getContents()),
        title: document.getElementById('document-title').innerHTML,
        blocks: encodeHTML(document.getElementById('document-blocks').innerHTML)
      }
      saveCampaign(saveData, campaignInfo.id);
    }, 300000)

    document.getElementById('add-text').addEventListener('click', function(){
      changesMade();
      createBlock('text');
    });
  }

  setTimeout(function(){
    document.querySelector('.loading-screen').style.display = 'none';
  }, 300)

}

/* Directory Read/Write
================================================== */

function createCampaign(saveInfo) {
  var data = {
    title: campaignInfo.title,
    text: campaignInfo.text,
    blocks: campaignInfo.blocks
  }

  var updates = {};
  updates['users/'+ userId +'/campaigns/'+getUrlVars()['id']] = data;
  return firebase.database().ref().update(updates);
}

function readCampaignList() {
  return firebase.database().ref('/users/' + userId + '/campaigns').once('value').then(function(snapshot) {
  var keyData = {
    size: 0,
    title: 'Undefined'
  };
  keyData.size = 0;
  var maxCount = 4;

    for(var key in snapshot.val()) {
      keyData.size += 1;
      var div = document.createElement('div');

      for(var key2 in snapshot.val()[key]) {
        keyData.title = snapshot.val()[key]['title']
      }
      div.className = 'campaign shadow camp_'+key;
      div.innerHTML = '<a href="/editor?id='+key+'"><span><i class="icon-folder"></i> '+keyData.title+'</span></a><i class="icon-x delete" data-key="'+key+'" alt="delete campaign" title="delete campaign"></i>'
      campaignList.append(div);
    }

    var deleteBtn = document.querySelectorAll('.delete');

    deleteBtn.forEach(function(e){
      e.addEventListener('click', function(){
        keyToDelete = e.dataset.key;

        if(confirm("Are you sure you want to delete this campaign?") == true ){
          deleteCampaign(keyToDelete);
          location.reload();
        }

      })
    });

    document.getElementById('count').innerHTML = keyData.size+'/'+maxCount;
    if(keyData.size > maxCount) {
      document.getElementById('createBlock').remove();
    }
  });
}

function deleteCampaign(key){
  return firebase.database().ref('/users/' + userId + '/campaigns/'+key).remove();
}

/* Campaign editing/loading
================================================== */

function saveCampaign(saveData, campaignUrl) {
  var data = {
    title: saveData.title,
    text: saveData.text,
    blocks: saveData.blocks
  }

  var updates = {};
  updates['users/'+ userId +'/campaigns/'+campaignUrl] = data;
  return firebase.database().ref().update(updates);
}

function readCampaignInfo(campaignUrl) {
  return firebase.database().ref('/users/' + userId + '/campaigns/'+campaignUrl).once('value').then(function(snapshot) {
    var keyData = {
      title: 'Undefined',
      text: '',
      blocks: ''
    };

    for(var key in snapshot.val()) {
      keyData.title = snapshot.val()['title'];
      keyData.text = snapshot.val()['text'];
      keyData.blocks = snapshot.val()['blocks'];
    }

    document.getElementById('document-title').innerHTML = keyData.title;
    quill.setContents(JSON.parse(keyData.text));
    quillLoaded = true;
    document.getElementById('document-blocks').innerHTML = decodeURI(keyData.blocks);

    updateElements(campaignInfo);

  });
}

/* Misc
================================================== */

//Get campaign ID
function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });
  return vars;
}

function setUniq() {
  let uniq = (new Date()).getTime();
  return uniq;
}

function displaySavedChanges(auto){
  if (auto == 'auto') {
    document.getElementById('save-message').innerHTML = 'Auto-saved';
    document.getElementById('save').classList.remove('changes');
    setTimeout(function(){
      document.getElementById('save-message').innerHTML = 'Save';
    }, 1500);
  } else {
    document.getElementById('save-message').innerHTML = 'Saved';
    document.getElementById('save').classList.remove('changes');
    setTimeout(function(){
      document.getElementById('save-message').innerHTML = 'Save';
    }, 1500);
  }

}

function changesMade(){
  if(quillLoaded === true) {
    document.getElementById('save').classList.add('changes');
  }
}

function encodeHTML(s) {
  return encodeURI(s);
}

