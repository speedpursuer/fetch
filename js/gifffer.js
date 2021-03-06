(function webpackUniversalModuleDefinition(root, factory) {
  if(typeof exports === 'object' && typeof module === 'object')
    module.exports = factory();
  else if(typeof define === 'function' && define.amd)
    define("Gifffer", [], factory);
  else if(typeof exports === 'object')
    exports["Gifffer"] = factory();
  else
    root["Gifffer"] = factory();
})(this, function() {
var d = document;
var playSize = 60;
var callback;
var noOfOnload = 0;
var noOfImage = 0;

var Gifffer = function(_callback) {
  callback = _callback;
  var images, i = 0;  

  images = d.querySelectorAll('[data-gifffer]');

  noOfImage = images.length;

  if(noOfImage == 0) {
    $( "#progressbar" ).progressbar({value: Math.floor(100)});
  }

  noOfOnload = 0;

  for(; i<images.length; ++i) {
    process(images[i]);    
  }
  
};

function formatUnit(v) {
  return v + (v.toString().indexOf('%') > 0 ? '' : 'px');
};

function createContainer(w, h, el) {
  var con = d.createElement('DIV');
  var cls = el.getAttribute('class');
  var id = el.getAttribute('id');

  cls ? con.setAttribute('class', el.getAttribute('class')) : null;
  id ? con.setAttribute('id', el.getAttribute('id')) : null;
  //con.setAttribute('style', 'position:relative;cursor:pointer;');
  
  // creating play button
  var play = d.createElement('DIV');
  play.setAttribute('class','gifffer-play-button');
  play.setAttribute('style', 'width:' + playSize + 'px;height:' + playSize + 'px;border-radius:' + (playSize/2) + 'px;background:rgba(0, 0, 0, 0.3);position:absolute;');
  
  var trngl = d.createElement('DIV');
  trngl.setAttribute('style', 'width:0;height: 0;border-top:14px solid transparent;border-bottom:14px solid transparent;border-left:14px solid rgba(0, 0, 0, 0.5);position:absolute;left:26px;top:16px;')
  play.appendChild(trngl);
  
  // dom placement
  //con.appendChild(play);
  el.parentNode.replaceChild(con, el);
  return { c: con, p: play };
};

function calculatePercentageDim (el, w, h, wOrig, hOrig) {
  var parentDimW = el.parentNode.offsetWidth;
  var parentDimH = el.parentNode.offsetHeight;
  var ratio = wOrig / hOrig;

  if (w.toString().indexOf('%') > 0) {
    w = parseInt(w.toString().replace('%', ''));
    w = (w / 100) * parentDimW;
    h = w / ratio; 
  }
  
  return { w: w, h: h };
};

function process(el) {
  var url, con, c, w, h, duration,play, gif, playing = false, cc, isC, durationTimeout, dims;

  url = el.getAttribute('data-gifffer');
  w = el.getAttribute('data-gifffer-width');
  h = el.getAttribute('data-gifffer-height');
  duration = el.getAttribute('data-gifffer-duration');
  el.style.display = 'block';

  // creating the canvas
  c = document.createElement('canvas');
  isC = !!(c.getContext && c.getContext('2d'));
  if(w && h && isC) cc = createContainer(w, h, el);

  // waiting for image load
  el.onload = function() {

    if(!isC) return;

    w = w || el.width;
    h = h || el.height;

    // creating the container
    if (!cc) cc = createContainer(w, h, el);
    con = cc.c;
    play = cc.p;
    dims = calculatePercentageDim(con, w, h, el.width, el.height);

    // listening for image click
    con.addEventListener('click', function() {
      clearTimeout(durationTimeout);
      if(!playing) {
        playing = true;
        gif = document.createElement('IMG');
        //gif.setAttribute('style', 'width:' + dims.w + 'px;height:' + dims.h + 'px;');
        //gif.setAttribute('style', 'width:100%');
        gif.setAttribute('data-uri', Math.floor(Math.random()*100000) + 1);
        setTimeout(function() {
          gif.src = url;
        }, 0);                        
        //con.removeChild(play);
        con.removeChild(c);
        con.appendChild(gif);
        if(parseInt(duration) > 0) {
          durationTimeout = setTimeout(function() {
            playing = false;
            con.appendChild(play);
            con.removeChild(gif);
            con.appendChild(c);
            gif = null;
          }, duration);
        }
        $(con).removeClass("playing");
        $("#"+$(el).attr("id")).parents(".clip").find(".combo-input").focus();
      } else {
        playing = false;
        //con.appendChild(play);
        con.removeChild(gif);
        con.appendChild(c);
        gif = null;
        $(con).addClass("playing");
      }
    });
    
    // canvas
    // c.width = dims.w;
    // c.height = dims.h;
    //c.getContext('2d').drawImage(el, 0, 0, dims.w, dims.h);

    c.width = el.width;
    c.height = el.height;
    c.getContext('2d').drawImage(el, 0, 0, el.width, el.height);
    con.appendChild(c);

    // reposition the play button
    play.style.top = ((dims.h / 2) - (playSize / 2)) + 'px';
    play.style.left = ((dims.w / 2) - (playSize / 2)) + 'px';

    // setting the actual image size
    //con.setAttribute('style', 'position:relative;cursor:pointer;width:' + dims.w + 'px;height:' + dims.h + 'px;');

    callback(el);
    noOfOnload++;
    $( "#progressbar" ).progressbar({value: Math.floor(noOfOnload/noOfImage * 100)});
  }
  el.src = url;
};

return Gifffer;

});