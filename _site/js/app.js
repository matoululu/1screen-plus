/* App.html
================================================== */

function appHTML() {
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

  quillNotes.on('text-change', function(){
    changesMade();
  });

  document.getElementById('command').addEventListener('submit', function(){
    var commandInput = document.getElementById('commandInput').value;
    commandHandler(commandInput);
  });

  document.getElementById('notes').addEventListener('click', function(){
    if(this.classList.contains('is-open')) {
      this.innerHTML = '<i class="icon-edit"></i> Notes';
      this.classList.remove('is-open');

      document.getElementById('notes-editor').classList.remove('is-active');
      document.getElementById('terminal').classList.add('is-active');

    } else {
      this.classList.add('is-open');
      this.innerHTML = '<i class="icon-code"></i> Commands';

      document.getElementById('terminal').classList.remove('is-active');
      document.getElementById('notes-editor').classList.add('is-active');

    }
  });

  document.getElementById('share').addEventListener('click', function(){
    displayShared()

    var saveData = {
      text: JSON.stringify(quill.getContents()),
      notes: JSON.stringify(quillNotes.getContents()),
      title: document.getElementById('document-title').innerHTML
    }

    shareCampaign(saveData, campaignInfo.id);
  });

  document.getElementById('save').addEventListener('click', function(){
    displaySavedChanges();

    var saveData = {
      text: JSON.stringify(quill.getContents()),
      notes: JSON.stringify(quillNotes.getContents()),
      title: document.getElementById('document-title').innerHTML
    }
    saveCampaign(saveData, campaignInfo.id);
  });

  setInterval(function() {
    displaySavedChanges('auto');
    var saveData = {
      text: JSON.stringify(quill.getContents()),
      title: document.getElementById('document-title').innerHTML,
      notes: JSON.stringify(quillNotes.getContents())
    }
    saveCampaign(saveData, campaignInfo.id);
  }, 300000)
}

/* App.html Misc
================================================== */

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

function displayShared(){
  document.getElementById('share-message').innerHTML = 'Shared';
  document.getElementById('share').classList.remove('changes');
  setTimeout(function(){
    document.getElementById('share-message').innerHTML = 'Share';
  }, 1500);

}

function changesMade(){
  if(quillLoaded === true) {
    document.getElementById('save').classList.add('changes');
  }
}

function commandHandler(value) {
  var li = document.createElement('li');
  if(value == '/help') {
    li.innerHTML = '<i class="icon-chevron-right"></i> Available commands:<br>/roll [amount] [type]<br>(Ex. /roll 1 20)<br><br>/generate [race] [gender]<br>(Ex. /generate halforc female)<br><br>/clear (Clear commands)<br><br>/help (View list of commands)'
    commandList.appendChild(li);
  } else if(value.includes('/roll', 0)) {
    var choppedValue = value.split(/\s+/).slice(1,3);
    var amountRolled = choppedValue[0];
    var dieType = choppedValue[1];
    commandList.appendChild(li);

    if(amountRolled == undefined && dieType == undefined) {
      li.innerHTML = '<i class="icon-chevron-right"></i> No dice type or amount included.';

    } else if(dieType == undefined) {
      if(isNaN(rollDice(amountRolled))) {
        li.innerHTML = '<i class="icon-chevron-right"></i> Unknown command. Try /help to view commands.'
      } else {
        li.innerHTML = '<i class="icon-chevron-right"></i> D'+amountRolled+' rolled:';
        var rollLi = document.createElement('li');
        rollLi.innerHTML = '<i class="icon-chevron-right"></i> '+ rollDice(amountRolled);
        commandList.appendChild(rollLi);
      }


    } else {
      if(isNaN(rollDice(dieType))) {
        li.innerHTML = '<i class="icon-chevron-right"></i> Unknown command. Try /help to view commands.'
      } else {
        li.innerHTML = '<i class="icon-chevron-right"></i> D'+dieType+' rolled '+amountRolled+' times:';
        for(i=0;amountRolled>i;i++) {
          var rollLi = document.createElement('li');
          rollLi.innerHTML = '<i class="icon-chevron-right"></i> '+ rollDice(dieType);
          commandList.appendChild(rollLi);
        }
      }
    }

  } else if(value.includes('/clear', 0)) {
    commandList.innerHTML = '';
  } else if(value.includes('/generate', 0)) {
    var choppedValue = value.split(/\s+/).slice(1,3);
    var race = choppedValue[0];
    var gender = choppedValue[1];

    li.innerHTML = '<i class="icon-chevron-right"></i> '+generateName(race, gender);

    commandList.appendChild(li);
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

function generateName(list, gender) {
  var param;
  var first;

  try {
    var last = window[list+'Last'][Math.floor(Math.random()*window[list+'Last'].length)];

    if(list != undefined) {
      if(gender == 'female') {
        param = list+'Female';
        first = window[param][Math.floor(Math.random()*window[param].length)];
      } else {
        param = list+'Male';
        first = window[param][Math.floor(Math.random()*window[param].length)];
      }
    }
    return(first +' '+ last);

  } catch(error) {
    return('Unknown command. Try /help to view commands.');
  }

}
