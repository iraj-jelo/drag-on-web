var ids = {
  notificationCheckbox: "#notification",
  reverseCheckbox: "#reverse",
  clickSelect:"#clickSelect",
  selectionKeySelect:"#selectionKeySelect",
  linksSelect:"#linksSelect",
  openGrabbingInput: '#openGrabbingInput',
  closeGrabbingInput: '#closeGrabbingInput'
}

var mouse_buttons = {'Left': 'left', 'Middle': 'middle', 'Right': 'right'};

var keys = {'<Ctrl>|<Alt>|<Shift>': 'CtrlAltShift',
  '<Ctrl>':'Ctrl', 
  '<Alt>':'Alt',
  '<Shift>':'Shift',
  'None': 'None'};

var links_status = {'Clickable': 'clickable', 'Non-clickable': 'non-clickable'};

var notification_checkbox = document.querySelector(ids.notificationCheckbox)
var reverse_checkbox = document.querySelector(ids.reverseCheckbox);
var mouse_button_select = document.querySelector(ids.clickSelect)
var key_select = document.querySelector(ids.selectionKeySelect);
var links_select = document.querySelector(ids.linksSelect);
var open_grabbing_input = document.querySelector(ids.openGrabbingInput);
var close_grabbing_input = document.querySelector(ids.closeGrabbingInput);

for (button in mouse_buttons){
  var option = document.createElement('option');
  option.innerText = button;
  option.value = mouse_buttons[button];
  document.querySelector(ids.clickSelect).append(option);
}

for (key in keys){
  var option = document.createElement('option');
  option.innerText = key;
  option.value = keys[key];
  document.querySelector(ids.selectionKeySelect).append(option);
}

for (link_status in links_status){
  var option = document.createElement('option');
  option.innerText = link_status;
  option.value = links_status[link_status];
  document.querySelector(ids.linksSelect).append(option);
}

function saveOptions(e) {
  e.preventDefault();

  var notification_checked = notification_checkbox.checked;

  var reverse_checked = reverse_checkbox.checked;

  var click_selected = [mouse_button_select.selectedOptions[0].innerHTML, mouse_button_select.selectedIndex];

  var key_selected = [key_select.selectedOptions[0].innerText, key_select.selectedIndex];

  var links_selected = [links_select.selectedOptions[0].innerText, links_select.selectedIndex];

  browser.storage.local.set({
    "notification": notification_checked,
    "reverse": reverse_checked,
    "mouse_button": click_selected,
    "key": key_selected,
    "links": links_selected
  });
  alert("Behavior options successfully saved.");
}

function restoreOptions() {

  function setCurrentChoice(result) {
    notification_checkbox.checked = result.notification;
    reverse_checkbox.checked = result.reverse;
    mouse_button_select.selectedIndex = (result.mouse_button == undefined)? "0" : result.mouse_button[1];
    key_select.selectedIndex = (result.key == undefined)? 0 : result.key[1];
    links_select.selectedIndex = (result.links == undefined)? 1 : result.links[1];
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.local.get(["notification", "reverse", "mouse_button", "key", "links"]);
  getting.then(setCurrentChoice, onError);

}


function saveDataURL(key, blob) {
  var reader = new FileReader();

  reader.onload = function(){
    var dataURL = (blob != undefined)? reader.result : '';
    var data = {};
    data[key] = dataURL;
    browser.storage.local.set(data);
  };
  
  if (blob == undefined) {
    var data = {};
    data[key] = '';
    browser.storage.local.set(data);
  } else {
    reader.readAsDataURL(blob)
  }
}

function saveCursorIcons(e) {
  e.preventDefault();

  saveDataURL("open_grabbing_cursor", open_grabbing_input.files[0]);
  saveDataURL("close_grabbing_cursor", close_grabbing_input.files[0]);

  alert("Cursor icons successfully saved.");
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.forms.behavior_options.addEventListener("submit", saveOptions);
document.forms.cursor_icon.addEventListener("submit", saveCursorIcons);
