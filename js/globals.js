const appPage = "/campaigns";
const termsPage = "/terms#tos";
const privacyPage = '/terms#privacy'
const homePage = "/";
const loginPage = "/login";
const editorPage = "/editor";
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
  '<h3>Like 1Screen?</h3><p>If so, please consider <a href="https://www.buymeacoffee.com/matouio" target="_blank">showing your support</a></p>'
]