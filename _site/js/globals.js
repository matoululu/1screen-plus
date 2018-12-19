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

var tipsArray = [
  '<h3>Did you know?</h3><p>Your changes save automatically every 5 minutes.</p>',
  '<h3>Did you know?</h3><p>You can store useful snippets by clicking the "notes" button.</p>',
]