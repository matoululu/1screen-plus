/* Globals
================================================== */

var appPage = "/campaigns";
var termsPage = "/terms";
var homePage = "/";
var loginPage = "/login";
var editorPage = "/editor";

var userName, userEmail, userId;
var userPremium = false;
var campaignInfo = new Object();
var campaignList = document.getElementById('campaignList');
var quill;
var quillLoaded = false;
var commandList = document.getElementById('commands');

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


      if(userName == null) {
        toDisplay = userEmail;
      } else {
        toDisplay = 'Hi, '+userName;
      }

      document.querySelector('.username').innerHTML = toDisplay;
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
  updateEvents();
}

//Contains events that get updated
function updateEvents() {

  closeBtn.forEach(function(e){
    e.addEventListener('click', function(){
      this.parentNode.remove();
    })
  });
}

//When app is ready
function appReady() {
  //Log out
  document.getElementById('logout').addEventListener('click', function(){
    firebase.auth().signOut();
    window.location.href = homePage;
  });

  isPremium();

  if(document.body.className == 'page__directory' ) {
    readCampaignList();
    var newPostKey = setUniq(); //firebase.database().ref().child('campaigns').push().key;
    var createID = document.getElementById('create');
    createID.href = editorPage+'?create=true&id='+newPostKey;
  }

  if(document.body.className == 'page__app' ) {
    console.log('navigated to app.html');

    campaignInfo.id = getUrlVars()['id'];
    campaignInfo.title = document.getElementById('document-title').innerHTML;
    campaignInfo.text = '';

    if(getUrlVars()['create']) {
      createCampaign(campaignInfo);
      setTimeout(function(){
        document.querySelector('.loading-screen').style.display = 'none';
      }, 300);
    } else {
      readCampaignInfo(campaignInfo.id);
    }

    quillNotes = new Quill('#document-notes', {
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          ['link'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }]
        ]
      },
      theme: 'snow'
    });

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

    document.getElementById('command').addEventListener('submit', function(){
      var commandInput = document.getElementById('commandInput').value;
      commandHandler(commandInput);
    });

    document.getElementById('notes').addEventListener('click', function(){
      if(this.classList.contains('is-open')) {
        this.innerHTML = '<i class="icon-edit-2"></i> Notes';
        this.classList.remove('is-open');

        document.getElementById('notes-editor').classList.remove('is-active');
        document.getElementById('terminal').classList.add('is-active');

      } else {
        this.classList.add('is-open');
        this.innerHTML = '<i class="icon-terminal"></i> Commands';

        document.getElementById('terminal').classList.remove('is-active');
        document.getElementById('notes-editor').classList.add('is-active');

      }
    });

    document.getElementById('save').addEventListener('click', function(){
      displaySavedChanges();

      var saveData = {
        text: JSON.stringify(quill.getContents()),
        notes: JSON.stringify(quillNotes.getContents()),
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
  }
}

/* Directory Read/Write
================================================== */

function createCampaign(saveInfo) {
  var data = {
    title: campaignInfo.title,
    text: campaignInfo.text
  }

  var updates = {};
  updates['users/'+ userId +'/campaigns/'+getUrlVars()['id']] = data;
  setTimeout(function(){
    return firebase.database().ref().update(updates);
  }, 750);

}

function readCampaignList() {
  setTimeout(function(){
    document.querySelector('.loading-screen').style.display = 'none';
  }, 300);

  tipGenerator();

  return firebase.database().ref('/users/' + userId + '/campaigns').once('value').then(function(snapshot) {
    var keyData = {
      size: 0,
      title: 'Undefined'
    };
    keyData.size = 0;
    var maxCount = 6;

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

    firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
      if(snapshot.val().premium != 'yes') {
        document.getElementById('premiumBar').style.display = 'block';
        document.getElementById('count').innerHTML = keyData.size+'/'+maxCount;
        if(keyData.size > maxCount) {
          document.getElementById('createBlock').remove();
        }
      }
    });

    var deleteBtn = document.querySelectorAll('.delete');
    deleteBtn.forEach(function(e){
      e.addEventListener('click', function(){
        keyTodelete = e.dataset.key;

        if(confirm("Are you sure you want to delete this campaign?") == true ){
          deleteCampaign(keyTodelete);
          location.reload();
        }

      })
    });

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
    notes: saveData.notes
  }

  var updates = {};
  updates['users/'+ userId +'/campaigns/'+campaignUrl] = data;
  return firebase.database().ref().update(updates);
}

function readCampaignInfo(campaignUrl) {
  return firebase.database().ref('/users/' + userId + '/campaigns/'+campaignUrl).once('value').then(function(snapshot) {
    var keyData = {
      title: 'Your first campaign',
      text: '',
      notes: ''
    };

    for(var key in snapshot.val()) {
      keyData.title = snapshot.val()['title'];
      keyData.text = snapshot.val()['text'];
      keyData.notes = snapshot.val()['notes'];
    }

    document.getElementById('document-title').innerHTML = keyData.title;
    if(keyData.text != '') {

      quill.setContents(JSON.parse(keyData.text));
      if(keyData.notes != undefined) {
        quillNotes.setContents(JSON.parse(keyData.notes));
      }

      quillLoaded = true;
    }

    updateElements(campaignInfo);

    setTimeout(function(){
      document.querySelector('.loading-screen').style.display = 'none';
    }, 300);

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
  var uniq = (new Date()).getTime();
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

function commandHandler(value) {
  var li = document.createElement('li');
  if(value == '/help') {
    li.innerHTML = '<i class="icon-chevron-right"></i> Available commands:<br>/roll (Ex. /roll 1 20)<br>/clear (Clear commands)<br>/help (View list of commands)'
    commandList.appendChild(li);
  } else if(value.includes('/roll', 0)) {
    var choppedValue = value.split(/\s+/).slice(1,3);
    var amountRolled = choppedValue[0];
    var dieType = choppedValue[1];
    commandList.appendChild(li);

    if(amountRolled == undefined && dieType == undefined) {
      li.innerHTML = '<i class="icon-chevron-right"></i> No dice type or amount included.';

    } else if(dieType == undefined) {
      li.innerHTML = '<i class="icon-chevron-right"></i> D'+amountRolled+' rolled:';
      var rollLi = document.createElement('li');
      rollLi.innerHTML = '<i class="icon-chevron-right"></i> '+ rollDice(amountRolled);
      commandList.appendChild(rollLi);

    } else {
      li.innerHTML = '<i class="icon-chevron-right"></i> D'+dieType+' rolled '+amountRolled+' times:';
      for(i=0;amountRolled>i;i++) {
        var rollLi = document.createElement('li');
        rollLi.innerHTML = '<i class="icon-chevron-right"></i> '+ rollDice(dieType);
        commandList.appendChild(rollLi);
      }
    }

  } else if(value.includes('/clear', 0)) {
    commandList.innerHTML = '';
  } else {
    li.innerHTML = '<i class="icon-chevron-right"></i> Unknown command. Try /help to view commands.'
    commandList.appendChild(li);
  }

  document.getElementById('command').reset();
}

function rollDice(num) {
  var randomNumber = Math.floor(Math.random() * num) + 1;
  return randomNumber;
}

function isPremium() {
  // firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {

  // });
}

//
//

var tipsArray = [
  '<h3>Did you know?</h3><p>Your changes save automatically every 5 minutes.</p>',
  '<h3>Did you know?</h3><p>You can store useful snippets by clicking the "notes" button.</p>',
  '<h3>Did you know?</h3><p>1Screen Supporters have unlimited campaign slots!</p>'
]

function tipGenerator() {
  var randomString = tipsArray[Math.floor(Math.random()*tipsArray.length)];
  document.getElementById('tip').innerHTML = randomString;
}