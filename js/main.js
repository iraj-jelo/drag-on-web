// Author: iraj jelodari
// email: iraj.jelo@gmail.com

document.body.style.webkitUserSelect = 'auto';
var lastClientY, lastClientX, curDown;

var mouse_move = function(e){ 
    if (curDown)  {
      document.scrollingElement.scrollLeft = lastClientX - e.clientX;
      document.scrollingElement.scrollTop += lastClientY - e.clientY;
      lastClientX = e.clientX;
      lastClientY = e.clientY;
    }
}

var mouse_down = function(e){ 
    lastClientY = e.clientY; 
    lastClientX = e.clientX; 
    curDown = true; 
    e.preventDefault();
    e.stopPropagation();
    document.body.style.cursor = "grabbing";
}

var mouse_up = function(e){ 
    if (curDown) {
      curDown = false;
      document.body.style.cursor = "grab";
    } 
}

var listen_to_events = function(){
  document.addEventListener('mousemove', mouse_move);
  document.addEventListener('mousedown', mouse_down);
  document.addEventListener('mouseup', mouse_up);
}

var remove_handlers = function() {
  document.removeEventListener("mousemove", mouse_move);
  document.removeEventListener("mousedown", mouse_down);
  document.removeEventListener("mouseup", mouse_up);
}

var show_message = function(msg) {

  var p = document.createElement('p'); 
  p.id = 'dragonwebmsg';
  p.innerHTML = msg;
  p.style.zIndex = 10000;
  p.style.position = 'fixed';
  p.style.color = '#423c3c';
  p.style.fontSize = '13px';
  p.style.left = '42%';
  p.style.padding = '5px';
  p.style.fontWeight = 700;
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
        e.target.remove();
    }, false);

    p.style.top = '-10%';
    p.style.opacity = '.3';  
    p.style.MozTransition = 'top 1s, opacity .5s ease-out'
  }, 2000);

}

document.addEventListener('dblclick', function(e) { 

  if(e.shiftKey || e.metaKey || e.altKey || e.ctrlKey) {
    // e.shiftKey: Shift-Click
    // Alt+Click
    // e.metaKey: Ctrl+Click on Windows & Command+Click on Mac.
    if (document.body.style.cursor == 'grab'){
      document.body.style.cursor = "";
      remove_handlers();
      show_message('<b>Page grabbing <u style="color: red;">turned off</u></b>.');
      window.getSelection().removeAllRanges();
      document.body.style.webkitUserSelect = 'toggle';
    } else {
      document.body.style.cursor = 'grab';
      listen_to_events()
      show_message('<b>Page grabbing <u style="color: green;">turned on</u></b>.');
      window.getSelection().removeAllRanges()
      document.body.style.webkitUserSelect = 'none'
    }
  }


});
