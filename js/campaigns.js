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
    var maxCount = 10;

    for(var key in snapshot.val()) {
      keyData.size += 1;
      var div = document.createElement('div');

      for(var key2 in snapshot.val()[key]) {
        keyData.title = snapshot.val()[key]['title']
      }
      div.className = 'campaign shadow camp_'+key;
      div.innerHTML = '<a href="/1screen-plus/editor?id='+key+'"><span><i class="icon-news"></i> '+keyData.title+'</span></a><i class="icon-cross delete" data-key="'+key+'" alt="delete campaign" title="delete campaign"></i>'
      campaignList.append(div);
    }

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

function shareCampaign(saveData, campaignUrl) {
  var data = {
    title: saveData.title,
    text: saveData.text,
    notes: saveData.notes
  }

  var updates = {};
  updates['share/'+ '/' + campaignUrl] = data;

  var li = document.createElement('li');
  li.innerHTML = '<i class="icon-chevron-right"></i> Campaign shared at <a href="https://1screen.xyz/share?id='+ campaignUrl +'" target="_blank">https://1screen.xyz/share?id='+ campaignUrl +'</a>';

  commandList.appendChild(li)

  return firebase.database().ref().update(updates);
}

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

    updateElements();

    setTimeout(function(){
      document.querySelector('.loading-screen').style.display = 'none';
    }, 300);

  });
}

function readSharedCampaignInfo(campaignUrl) {
  console.log(campaignUrl)
  return firebase.database().ref('/share/' + campaignUrl).once('value').then(function(snapshot) {
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

    updateElements();

    setTimeout(function(){
      document.querySelector('.loading-screen').style.display = 'none';
    }, 300);

  });
}

function updateElements() {
  closeBtn = document.querySelectorAll('.close');
  closeBtn.forEach(function(e){
    e.addEventListener('click', function(){
      this.parentNode.remove();
    })
  });
}
