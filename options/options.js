var ids = {mouseButtonSelect:"#mouseButtonSelect",
  selectionKeySelect:"#selectionKeySelect",
  linksSelect:"#linksSelect"}
/*
var mouse_buttons = {'Left': 'left',
'Middle': 'middle', 
'Right': 'right'};
*/
var keys = {'<Ctrl>|<Alt>|<Shift>': 'CtrlAltShift',
  '<Ctrl>':'Ctrl', 
  '<Alt>':'Alt',
  '<Shift>':'Shift',
   'None': 'None'};

var links_status = {'clickable': 'clickable', 'non-clickable': 'non-clickable'};

/*var mouse_button_select = document.querySelector("#mouseButtonSelect");*/
var key_select = document.querySelector("#selectionKeySelect");
var links_select = document.querySelector("#linksSelect");

/*
for (button in mouse_buttons){
  var option = document.createElement('option');
  option.innerText = button;
  option.value = mouse_buttons[button];
  document.querySelector(ids.mouseButtonSelect).append(option);
}
*/
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

  /*var mouse_button_selected = [mouse_button_select.selectedOptions[0].innerHTML, mouse_button_select.selectedIndex];*/

  var key_selected = [key_select.selectedOptions[0].innerText, key_select.selectedIndex];

  var links_selected = [links_select.selectedOptions[0].innerText, links_select.selectedIndex];

  browser.storage.local.set({
    //mouse_button: mouse_button_selected,
    key: key_selected,
    links: links_selected
  });
  alert("successfully saved.");
}

function restoreOptions() {

  function setCurrentChoice(result) {
    //mouse_button_select.selectedIndex = (result.mouse_button == undefined)? "0" : result.mouse_button[1];
    key_select.selectedIndex = (result.key == undefined)? 0 : result.key[1];
    links_select.selectedIndex = (result.links == undefined)? 1 : result.links[1];
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.local.get(["key", "links"]);
  getting.then(setCurrentChoice, onError);

}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);

