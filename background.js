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

function toggle_grabbing() {
  grabbing = (grabbing == true)? false: true
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
    if (grabbing) {
      browser.tabs.insertCSS({code: css}) 
    } else {
      browser.tabs.removeCSS({code: css})
    }
    browser.tabs.sendMessage(tab.id, {grabbing: grabbing}).then(response => {}).catch(onError);
  }
}

function sendMessageToTabs() {
  browser.tabs.query({
    currentWindow: true,
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
