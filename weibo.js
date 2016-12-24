function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    JSON.stringify({"images": [], "title": "新浪微博"});
                    phantom.exit();
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
};

function fetchGIF() {
    var images = page.evaluate(function() {
        var result = [];
        var list = document.getElementsByTagName("img");
        for(var i = 0; i < list.length; i++) {
            var src = list[i].getAttribute('src');
            if(src) {
                if(src.indexOf('.gif') === -1) {
                    continue;
                }

                src = src.replace(/thumb180/, "large");
                src = src.replace(/wap180/, "large");

                // if(src.indexOf('thumb180') !== -1) {
                //     src = src.replace(/thumb180/, "large")
                // }
                result.push({"src": src});
            }
        }
        return JSON.stringify({"images": result, "title": "新浪微博"});
    });

    console.log(images);
    phantom.exit();
}

var page = require('webpage').create(),
    system = require('system'),
    url;

if (system.args.length === 1) {
    console.log('Usage: weibo.js <some URL>');
    phantom.exit();
}

url = system.args[1];

phantom.addCookie({
  'name'     : 'SUHB',
  'value'    : '0la1QXwhEDzPqO',
  'domain'   : '.weibo.cn',
  'path'     : '/',
  'httponly' : false,
  'secure'   : false,
  'expires'  : '2026/12/21 00:00:01'
});

phantom.addCookie({
  'name'     : 'SSOLoginState',
  'value'    : '1482563197',
  'domain'   : '.weibo.cn',
  'path'     : '/',
  'httponly' : false,
  'secure'   : false,
  'expires'  : '2026/12/21 00:00:01'
});

phantom.addCookie({
  'name'     : 'M_WEIBOCN_PARAMS',
  'value'    : 'uicode=20000061&featurecode=20000180&fid=4055167823161138&oid=4055167823161138',
  'domain'   : '.weibo.cn',
  'path'     : '/',
  'httponly' : false,
  'secure'   : false,
  'expires'  : '2026/12/21 00:00:01'
});

phantom.addCookie({
  'name'     : 'SCF',
  'value'    : 'Aq_gDPFi7zDRNt7dPZWTPdQfBVrNLe0oyq-DojHjXPoqsNoDH-SeiIm7TEB8mNIQ5_vZ9elOMPV7bYqCZPCddaI.',
  'domain'   : '.weibo.cn',
  'path'     : '/',
  'httponly' : true,
  'secure'   : false,
  'expires'  : '2026/12/21 00:00:01'
});

phantom.addCookie({
  'name'     : 'SUB',
  'value'    : '_2A251Wm4tDeRxGeBO41UU-CfJzjWIHXVWpXJlrDV6PUJbkdBeLU_RkW2BjbGQ58sgMV0IEJPUC8xT73_B4g..',
  'domain'   : '.weibo.cn',
  'path'     : '/',
  'httponly' : true,
  'secure'   : false,
  'expires'  : '2026/12/21 00:00:01'
});

phantom.addCookie({
  'name'     : '_T_WM',
  'value'    : 'e1ac5cafaff68a9bac24d60e36729c1a',
  'domain'   : '.weibo.cn',
  'path'     : '/',
  'httponly' : true,
  'secure'   : false,
  'expires'  : '2026/12/21 00:00:01'
});

// Open Twitter on 'sencha' profile and, onPageLoad, do...
page.open(url, function (status) {
    // Check for page load success
    if (status !== "success") {
        console.log("Unable to access network");
        phantom.exit();
    } else {
        // Wait for 'signin-dropdown' to be visible
        waitFor(function() {
            // Check in the page if a specific element is now visible
            return page.evaluate(function() {
                return document.getElementsByClassName('loaded').length > 0;
                // return document.getElementsByClassName('gif').length > 0;
                // return document.getElementsByTagName("div").length > 0;
                // return document.getElementsByTagName("media-pic-list").length > 0;                
                // return $("#signin-dropdown").is(":visible");
            });
        }, function() {           
           fetchGIF();
        });
    }
});