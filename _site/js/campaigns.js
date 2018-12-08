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
        document.getElementById('count').innerHTML = keyData.size+'/'+maxCount;

        //BETA BENEFITS
        //BETA BENEFITS
        //BETA BENEFITS
        document.getElementById('alert').style.display = 'block';
        //BETA BENEFITS
        //BETA BENEFITS
        //BETA BENEFITS

        if(keyData.size > maxCount) {
          document.getElementById('createBlock').remove();
        }
      } else {
        document.getElementById('alert').remove();
        document.getElementById('premiumBar').innerHTML = 'As a 1Screen Premium user you have unlimited slots.';

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