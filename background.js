var key, links_status;
var grabbing = true
var css = 'a {pointer-events: none;};'
var browser_action_on_icons = {16: "icons/grabbing-16.png", 32: "icons/grabbing-32.png"};
var browser_action_off_icons = {16: "icons/grabbing-off-16.png", 32: "icons/grabbing-off-32.png"};

function log(msg){
  console.log(msg);
}

function onError(error) {
  console.error(`Error: ${error}`);
}

function restoreOptions() {

  function setCurrentChoice(result) {
    //mouse_button = (result.mouse_button == undefined)? "0" : result.mouse_button[1];
    key = (result.key == undefined)? "<Ctrl>|<Alt>|<Shift>" : result.key[0];
    links_status = (result.links == undefined)? "non-clikable" : result.links[0];
  }

  var getting = browser.storage.local.get(["key", "links"]);
  getting.then(setCurrentChoice, onError);

}

restoreOptions();

function toggle_grabbing() {
  if (grabbing == true) {
    grabbing = false;
  } else {
    grabbing = true;
    restoreOptions();
  }
  if (grabbing) {
    browser.browserAction.setIcon({path: browser_action_on_icons});
    browser.runtime.sendMessage({'status': 'enable'});
    sendMessageToTabs();
  } else {
    browser.browserAction.setIcon({path: browser_action_off_icons}); 
    browser.runtime.sendMessage({'status': 'disable'}); 
    sendMessageToTabs();
  }
}

function sendMessageToTabsCallbak(tabs) {
  for (let tab of tabs) {
    if (grabbing && (links_status == 'non-clickable')) {
      browser.tabs.insertCSS({code: css}) 
    } else {
      browser.tabs.removeCSS({code: css})
    }
    browser.tabs.sendMessage(tab.id, {grabbing: grabbing, options: {key: key, links_status: links_status}}).then(response => {}).catch(onError);
  }
}

function sendMessageToTabs() {
  browser.tabs.query({
    active: true
  }).then(sendMessageToTabsCallbak).catch(onError);
}

function handleActivated(activeInfo) {
  if (grabbing) browser.tabs.insertCSS({code: css});
  sendMessageToTabs();
}

function handleUpdated(tabId, changeInfo, tabInfo) {
  if (changeInfo.status == "complete"){ sendMessageToTabs() };
}

browser.tabs.onUpdated.addListener(handleUpdated);
browser.tabs.onActivated.addListener(handleActivated);
browser.browserAction.onClicked.addListener(toggle_grabbing);

function handleMessage(request, sender, sendResponse) {
  if (request.grabbing == true|| request.grabbing == false) toggle_grabbing()
}

browser.runtime.onMessage.addListener(handleMessage);

