/* Directory.html
================================================== */

function directoryHTML() {
  readCampaignList();
  var newPostKey = setUniq();
  var createID = document.getElementById('create');
  createID.href = editorPage+'?create=true&id='+newPostKey;
}

/* Directory.html Misc
================================================== */

function tipGenerator() {
  var randomString = tipsArray[Math.floor(Math.random()*tipsArray.length)];
  document.getElementById('tip').innerHTML = randomString;
}

function setUniq() {
  var uniq = (new Date()).getTime();
  return uniq;
}