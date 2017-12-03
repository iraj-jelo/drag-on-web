/* Author: iraj jelodari <iraj.jelo@gmail.com> */

document.body.style.webkitUserSelect = 'auto';
var lastClientY, lastClientX, curDown, options;
var grabbing = false;
var excluded_tags = ['TEXTAREA', 'INPUT'];

var cursor = document.body.style.cursor;

if (cursor == "grab") {
  document.body.style.cursor = "";
  cursor = "";
}

function log(msg){
  console.log(msg);
}

function detect_button(e){  
  e = e || window.event;

  if (e.which == null){
    return (e.button < 2) ? 'left' : ((e.button == 4) ? 'middle' : 'right');
  }
  else{
    return (e.which < 2) ? 'left' : ((e.which == 2) ? 'middle' : 'right');
  }
}

function stopEvent(event){
  if(event.preventDefault != undefined)
    event.preventDefault();
  if(event.stopPropagation != undefined)
    event.stopPropagation();
}

var is_button_down = function(e) {
  return detect_button(e).toUpperCase() == options.mouse_button.toUpperCase()
}

var mouse_move = function(e){ 
  e = e || window.event;
  if (curDown) {
    if (options.reverse) {
      document.scrollingElement.scrollLeft -= lastClientX - e.clientX;
      document.scrollingElement.scrollTop -= lastClientY - e.clientY;
    } else {
      document.scrollingElement.scrollLeft += lastClientX - e.clientX;
      document.scrollingElement.scrollTop += lastClientY - e.clientY;
    }
    lastClientX = e.clientX;
    lastClientY = e.clientY;
  }
}

var mouse_down = function(e){ 
  if (is_button_down(e)){
    lastClientY = e.clientY; 
    lastClientX = e.clientX; 
    curDown = true; 
    e.preventDefault(); // To disable things like cursor change during click and drag on input and textarea elements
    e.stopPropagation();
    document.body.style.cursor = "grabbing";
  }
}

var mouse_up = function(e){ 
  if (curDown && is_button_down(e)) {
    curDown = false;
    document.body.style.cursor = "grab";
    e.preventDefault(); // To disable things like cursor change during click and drag on input and textarea elements
    e.stopPropagation();
  } 
}

var disable_context_menu = function(e){
  if (is_button_down(e)) stopEvent(e);
}

// Just signal to toggle between text selection or grab mode on the web pages in background script.
var dblclick = function(e) {
  if ((options.key == '<Ctrl>|<Alt>|<Shift>') && (e.ctrlKey || e.altKey || e.shiftKey)) {
    browser.runtime.sendMessage({grabbing: grabbing});
  }
  if ((options.key == '<Ctrl>') && (e.ctrlKey)) {
    browser.runtime.sendMessage({grabbing: grabbing});
  }
  if ((options.key == '<Alt>') && (e.altKey)) {
    browser.runtime.sendMessage({grabbing: grabbing});
  } 
  if ((options.key == '<Shift>') && (e.shiftKey)) {
    browser.runtime.sendMessage({grabbing: grabbing});
  }
  if ((options.key == 'None') && (!e.ctrlKey && !e.altKey && !e.shiftKey)) {
    browser.runtime.sendMessage({grabbing: grabbing});
  }
}

document.addEventListener("dblclick", dblclick);

var listen_to_events = function(){
  document.addEventListener('mousemove', mouse_move);
  document.addEventListener('mousedown', mouse_down);
  document.addEventListener('mouseup', mouse_up);
  document.addEventListener('contextmenu', disable_context_menu);
}

var remove_handlers = function() {
  document.removeEventListener("mousemove", mouse_move);
  document.removeEventListener("mousedown", mouse_down);
  document.removeEventListener("mouseup", mouse_up);
  document.removeEventListener('contextmenu', disable_context_menu);
}

var show_message = function(element) {
  var p = document.createElement('p'); 
  p.id = 'dragonwebmsg';
  p.appendChild(element);
  p.style.zIndex = 10000;
  p.style.position = 'fixed';
  p.style.color = '#423c3c';
  p.style.fontSize = '13px';
  p.style.left = '42%';
  p.style.padding = '5px';
  p.style.fontWeight = '700';
  p.style.background = '#fbffac';
  p.style.border = '1px solid';
  p.style.borderColor = '#eaa926';
  p.style.boxShadow = '1px 4px 5px black';
  p.style.direction = 'ltr';

  document.body.appendChild(p);

  // Animating as bigan as appedning element to the dom:
  p.style.MozTransition = 'opacity .5s ease-in-out, top .5s ease-in-out'
  p.style.opacity = '0';
  p.style.top = '15%';
  
  // reflow: to solve immediate CSS transitions on newly-appended elements `document.body.appendChild(p);` are 
  //somehow ignored - the end state of the transition is rendered immediately.
  // reference: https://stackoverflow.com/questions/24148403/trigger-css-transition-on-appended-element
  p.getBoundingClientRect();  
  
  p.style.opacity = '1'; 
  p.style.top = '10%';    

  setTimeout(function(){ 
    p.addEventListener('transitionend', function(e){
        p.remove();
    }, false);

    p.style.top = '-10%';
    p.style.opacity = '.3';  
    p.style.MozTransition = 'top 1s, opacity .5s ease-out'
  }, 2000);

}

function createMessage(text1, text2, color){
  var messageSpan = document.createElement('span');
  var textNode = document.createTextNode(text1);
  var textSpan = document.createElement('span');
  textSpan.innerText = text2;
  textSpan.style.color = color;
  messageSpan.appendChild(textNode);
  messageSpan.appendChild(textSpan);
  return messageSpan
}

var enable = function() {
  cursor = document.body.style.cursor; // last cursor before grabbing mode
  document.body.style.cursor = 'grab';
  listen_to_events();
  if (options.notification) {
    show_message(createMessage('Page grabbing ', 'turned on.', 'green'));
  }
  window.getSelection().removeAllRanges();
  document.body.style.webkitUserSelect = 'none';
  grabbing = true;
}

var disable = function() {
  document.body.style.cursor = cursor;
  remove_handlers();
  if (options.notification) {
    show_message(createMessage('Page grabbing ', 'turned off.', 'red'));
  }
  window.getSelection().removeAllRanges();
  document.body.style.webkitUserSelect = 'toggle';
  grabbing = false;
}

browser.runtime.onMessage.addListener(request => {
  options = request.options;

  // if request.grabbing was true and grbbing was false, do grab
  if (request.grabbing && !grabbing) enable();
  // if request.grabbing was false and grbbing was true, dont grab 
  if (!request.grabbing && grabbing) disable();

  return Promise.resolve({response: "Hi from content script"});
});
