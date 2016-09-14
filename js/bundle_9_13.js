(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
// var dbName = "cliplay_new_db_dev_6_15", remoteURL = "http://admin:12341234@localhost:5984/"+dbName;
// var dbName = "cliplay_test", remoteURL = "http://admin:12341234@localhost:5984/"+dbName;
var dbName = "cliplay_staging", remoteURL = "http://cliplay_editor:iPhone5S@121.40.197.226:4984/"+dbName;
var dbNameProd = "cliplay_prod_new", remoteURLProd = "http://cliplay_editor:iPhone5S@121.40.197.226:4984/"+dbNameProd;

var db = new PouchDB(dbName);

var playerOption = "";
var moveList = [];
var existingClipList = [];
var playerList = [];
var searchResult = [];
var selectedClip = "";
var playerUI = {};
var action = "";
var searchAll = false;
var searchWeibo = false;
var localStorage = window.localStorage;
var postContent = "";


/** Default Document Ready Event **/
$(function()
{
    disableButton();
    // Make form do what we want
    $('#url-form').submit(getImagesFromUrl);
    $('#push-form').submit(pushNotification);

    dbSetup();
    //deleteDB();

    //findAndRemoveInstall();
    //syncToRemote();
    //$("#playerForm").validate();    
    //syncFromRemote();      
    //syncToRemote();
    //deleteDoc("clip100");

    $('#name_search').keypress(function(event){
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == '13'){
            event.preventDefault();
            searchClip();
        }
    });  

    $('#clipModal').on('shown.bs.modal', function (e) {
        // console.log("show modal");
        $("#image_url").focus();
    });

    $('#playerModal').on('shown.bs.modal', function (e) {
        // console.log("show modal");
        $("#name").focus();
    });  

    $('#playsModal').on('shown.bs.modal', function (e) {
        // console.log("show modal");
        $("#play_name").focus();
    });  
	
	$('#postModal').on('shown.bs.modal', function (e) {
        $("#post-content").focus();
    });  
	
    $('input:radio[name="clip_option_x"]').click(function(){
        setClipOption('x');
    });

    $('#search').click(function(){
        searchAll = true;       
        searchWeibo = false; 
    });

    $('#searchGIF').click(function(){
        searchAll = false;
        searchWeibo = false;
    });

    $('#searchWeibo').click(function(){
        searchWeibo = true;
    });    

    $('#syncToProd').click(function(){
        syncToProd();
    });     

    $('#addNews').click(function(){
        createNews();
    });    

    $('#addNews').click(function(){
        createNews();
    }); 

    $('#showPost').click(function(){
        showPost();
    }); 

    $('#save-player').click(function(){
        savePlayer();
    }); 

    $('#save-clip').click(function(){
        saveSingleClip();
    }); 

    $('#delete-news').click(function(){
        deleteNews();
    }); 

    $('#search-images').click(function(){
        searchImages();
    });

    $('#submit-push').click(function(){
        submitPush();
    }); 

    // $("#search-images").click(function(){
    //     searchImages();
    // });
    // setHeader();
});

global.selectClip = function (index) {
    //console.log(clipID);

    selectedClip = index;
    cleanActive(searchResult.length);

    var clip = searchResult[index];

    setInputValue('image_url_update', clip.image);
    setInputValue('clip_title_update', clip.name);
    setInputValue('clip_desc_update', clip.desc);
    playerUI.update(findIndex(playerList, clip.player));
    var moveIndex = findIndex(moveList, clip.move);
    $('input:radio[id=radio'+moveIndex+'_update]').prop('checked', true);
    $("#clip_move_update").buttonset( "refresh" );
    $("#update_row_"+index).addClass("success"); 

    $("#clipUpdateForm").show();
}

global.saveNews = function() {

    var list = [];

    var name = getValue("news_title"), 
        desc = getValue("news_desc"),
        thumb = getValue("news_thumb"),
        summary = getValue("news_summary");

    // $(".imageList").each(function(index, element){
    //     //console.log($(element).attr("url"));
    //     list.push($(element).attr("url"));
    // });

    $("#sortable2").find('li').each(function(index, element){        

        var url = $(element).attr("url");
        var desc = $(element).attr("desc");
        if(url) {
            // console.log($(element).attr("url"));
            list.push({
                url: url,
                desc: desc
            });   
        }       
    });

    if (name == "" || desc == "" || thumb == "" || list.length < 2) {
        alert("请填写完整信息并选择至少两张图片");
        return;
    }   

    var _id = "news_" + getDateID(); 

    var news = {
        _id: _id,
        image: list,
        name: name,
        desc: desc,
        thumb: thumb,
        summary: summary,
    }

    setInputValue("title", name);
    setInputValue("push_id", _id);

    putNews(news, function(){        
        cleanNews();
        $('#pushModal').modal('show');
    });
}

global.cleanNews = function () {
    localStorage["clips"] = [];
    $('.row').empty();
    updateNewsButton();
}

global.cancelClip = function (index) {
    $("#clip"+index)
    .parents(".clip")
    .animate({opacity: 0})
    .toggle();   
}

global.saveClip = function (index) {

    setButtonDisable("save"+index, true);

    var move = getSeletValue("move"+index); 
    var player = getValue("player"+index);
    var image = getValue("gif"+index);
    var desc = getValue("desc"+index);

    // return;
    // var name = getValue("name"+index);
    
    setStorage(image, desc);
    updateNewsButton();

    if(!needSaveClipForPlayer(index)) {
        saveSucess(index);
        setButtonDisable("save"+index, false);        
        return;
    }

    putClip(player, move, image, desc, function(){
        saveSucess(index);
        setButtonDisable("save"+index, false);
    }, function() {        
        setButtonDisable("save"+index, false);
    });
}

global.clipOption = function(i) {
    // alert("");
    setClipOption(i);
}

var dataBase = {    
    dbStaging: new PouchDB(remoteURL),
    lastSeqID: "_local/lastSyncSeqNo",
    
    updateLBPostData: function() {
        var deferred = Q.defer();

        var that = this;

        this.getLastSeq().then(function(result){
            return that.dbStaging.changes({
                since: result.seq,
                include_docs: true,
                filter: function (doc) {
                    return (startWith(doc._id, "news") || 
                            startWith(doc._id, "galery") ||
                            startWith(doc._id, "post")
                            );
                }
            });
        }).then(function (result) {
            if(result.results.length == 0) {
                return true;
            }else{
                return that.updateViaRestAPI(result.results);
            }            
        }).then(function(){
            deferred.resolve(true);
        }).catch(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    },
    
    saveLastSeq: function(seq){
        var deferred = Q.defer();

        if(!seq) deferred.reject("seq is null");

        var that = this;

        this.dbStaging.get(this.lastSeqID).then(function(doc) {        
            doc.seq = seq;
            return that.dbStaging.put(doc);
        }).then(function(response) {
            deferred.resolve(response);
        }).catch(function (err) {
            deferred.reject(err);
        });   

        return deferred.promise;
    },

    createLastSeq: function(seq){
        return this.dbStaging.put({
            _id: this.lastSeqID,
            seq: seq
        });
    },

    getLastSeq: function(){
        return this.dbStaging.get(this.lastSeqID);
    },

    updateViaRestAPI: function(postData){
        var rest = require('rest');
        var mime = require('rest/interceptor/mime');
        var client = rest.wrap(mime);

        var reqeust = {
            method: "POST",
            path: "http://121.40.197.226:3001/api/posts/updatePostClip",
            headers: {'Content-Type': 'application/json'},        
            entity: {postData: postData},
        };

        return client(reqeust);
    },  
};

function syncToProd() {
    setButtonDisable("syncToProd", true);

    dataBase.updateLBPostData().then(function(){
        return dataBase.dbStaging.replicate.to(remoteURLProd);
    }).then(function(result){
        return dataBase.saveLastSeq(result.last_seq);
    }).then(function(){
        console.log("sync to PROD completed");
        alert("同步成功！");
        setButtonDisable("syncToProd", false);
    }).catch(function(err){
        alert("同步失败！");
        setButtonDisable("syncToProd", false);
    });

    // db.replicate.to(remoteURLProd).on('complete', function () {
    //     console.log("sync to PROD completed");
    //     alert("同步成功！");
    //     setButtonDisable("syncToProd", false);
    // }).on('error', function (err) {            
    //     alert("同步失败: " + err);
    //     setButtonDisable("syncToProd", false);
    // });
}

function startWith(string, needle){
    return string.lastIndexOf(needle, 0) === 0;
}

function jsonp(url, callback) {
    var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    window[callbackName] = function(data) {
        delete window[callbackName];
        document.body.removeChild(script);
        callback(data);
    };

    var script = document.createElement('script');
    script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
    document.body.appendChild(script);
}

function getWeiboImages() {
    // alert(getValue("fetch-url"));
    // $.get("http://photo.weibo.com/photos/get_all?uid=5866649154&album_id=3974296035825267&count=100&page=1&type=1", function(result){
    //     // $("div").html(result);
    //     var a = result;
    // });

    $.ajax({
        // crossOrigin: true,
        type: "GET",
        url: "http://photo.weibo.com/photos/get_all?uid=5866649154&album_id=3974296035825267&count=100&page=1&type=1",
        // data: data,
        success: function(result){
            var a = result;
        },
        // dataType: "json"
    });

    // var trans = new XMLHttpRequest();

    // trans.onreadystatechange = function() {
    //     if (trans.readyState==4 && trans.status==200)
    //     {
    //         aler(trans.responseText);
    //     }
    // };

    // trans.open("get", 
    //     "http://photo.weibo.com/photos/get_all?uid=5866649154&album_id=3974296035825267&count=30&page=1&type=1&__rnd=1464005699883&callback=?", 
    //     true);

    // trans.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    // trans.setRequestHeader("X-Requested-With", "XMLHttpRequest");

    // trans.send("");

    // jsonp('http://photo.weibo.com/photos/get_all?uid=5866649154&album_id=3974296035825267&count=30&page=1&type=1', function(data) {
    //     alert(data);
    // });
}

function setClipOption(i) {    
    if(needSaveClipForPlayer(i)) {
        $(".clip-player-"+i).show();
        $(".clip-move-"+i).show();
    }else {        
        $(".clip-player-"+i).hide();
        $(".clip-move-"+i).hide();
    }
}

function needSaveClipForPlayer(i) {
    // if(i) {
    //     return ($('input:radio[name="clip_option'+i+'"]:checked').val() == "yes");
    // }else{
    //     return ($('input:radio[name="clip_option"]:checked').val() == "yes");
    // }    
    var optioin = $('input:radio[name="clip_option_'+i+'"]:checked').val();
    return optioin == "yes";
}

function setHeader() {
    var request;
    var url = "http://www.baidu.com";
    if (window.XMLHttpRequest) { // Mozilla, Safari, ...
        request = new XMLHttpRequest();
    } else if (window.ActiveXObject) { // IE
        try {
            request = new ActiveXObject('http://bbs.hupu.com/15770633.html');
        } catch (e) {
            try {
                request = new ActiveXObject('http://bbs.hupu.com/15770633.html');
            } catch (e) {}
        }
    }
    request.open("GET", url, true);
    request.send();

    delete window.document.referrer;
    window.document.__defineGetter__('referrer', function () {
        return "http://bbs.hupu.com/15770633.html";
    });

    Object.defineProperty(document, "referrer", {get : function(){ return "http://bbs.hupu.com/15770633.html"; }});
}

function findAndRemoveInstall() {
    db.get("DBInstalled").then(function(doc) {
        db.remove(doc).then(function(){
            syncToRemote();
        });
    });
}

function disableButton() {
    setButtonDisable("search", true);
    setButtonDisable("addPlayer", true);
    setButtonDisable("addClip", true);
    setButtonDisable("updateClip", true);
    setButtonDisable("addPlays", true);  
    setButtonDisable("addNews", true);  
    setButtonDisable("searchGIF", true);   
    setButtonDisable("send", true); 
    setButtonDisable("searchWeibo", true);   
    setButtonDisable("showPost", true);
    setButtonDisable("syncToProd", true);   
}

function enableButton() {    
    setButtonDisable("search", false); 
    setButtonDisable("addPlayer", false);
    setButtonDisable("addClip", false);
    setButtonDisable("updateClip", false);    
    setButtonDisable("addPlays", false);
    setButtonDisable("addNews", false);
    setButtonDisable("searchGIF", false);  
    setButtonDisable("send", false);
    setButtonDisable("searchWeibo", false);      
    setButtonDisable("showPost", false);
    setButtonDisable("syncToProd", false);   
    updateNewsButton();
}

function setButtonDisable(id, flag) {
    $('#'+id).prop('disabled', flag);   
}

function dbSetup() {
    // db.get('_local/DBInstalled').then(function(result){

    // }).catch(function(e) {
    //     return 
    // }

    // db.allDocs({
    //     include_docs: true,
    //     startkey: '_local/DBInstalled',
    //     endkey: '_local/DBInstalled' 
    // }).then(function(result){
    //     if(result.rows.length == 0) {
    //         return syncFromRemote().on('complete', function () {
    //             console.log("sync completed");
    //             return db.createIndex({
    //                 index: {
    //                     //fields: ['image', 'local']
    //                     fields: ['image']
    //                 }
    //             });
    //         }).on('error', function (err) {
    //             throw new Error(err);
    //         });
    //     }else{
    //         return true;
    //     }
    // }).then(function() {
    //     return db.put({
    //         _id: '_local/DBInstalled',
    //         status: 'completed'
    //     });
    // }

    // function markInstalled() {
    //     // console.log("Install finished");
    //     return db.put({
    //         _id: '_local/DBInstalled',
    //         status: 'completed'
    //     });
    // }

    // function isDBInstalled() {
    //     return db.get('_local/DBInstalled');
    // }

    // syncFromRemote().then(function() {
    //     console.log("sync completed");
    //     return db.createIndex({
    //         index: {                
    //             fields: ['image']
    //         }
    //     });
    // }).then(function () {        
    //     return db.createIndex({
    //         index: {        
    //             fields: ['name']
    //         }
    //     });    
    // }).then(function(){
    //     console.log("index created");
    //     renderList();
    // }).catch(function (err) {
    //     console.log(err);
    // });

    syncFromRemote().then(function() {
        console.log("sync completed");
        return db.createIndex({
            index: {        
                fields: ['name']
            }
        });   
    }).then(function(){
        console.log("index created");
        renderList();
    }).catch(function (err) {
        console.log(err);
    });
}

function dbSetup_() {

    db.destroy().then(function (response) {
        db = new PouchDB(dbName);
        return syncFromRemote().on('complete', function () {
            console.log("sync completed");
            return db.createIndex({
                index: {
                    //fields: ['image', 'local']
                    fields: ['image']
                }
            });
        }).on('error', function (err) {
            throw new Error(err);
        });
    }).then(function (result) {        
        return db.createIndex({
            index: {
                // fields: ['name', 'local']
                fields: ['name']
            }
        });    
    }).then(function(){
        console.log("index created");
        renderList();    
    }).catch(function (err) {
        console.log(err);
    });

    // syncFromRemote().on('complete', function () {
    //     console.log("sync completed");
    //     db.createIndex({
    //         index: {
    //             //fields: ['image', 'local']
    //             fields: ['image']
    //         }
    //     }).then(function (result) {        
    //         db.createIndex({
    //             index: {
    //                 // fields: ['name', 'local']
    //                 fields: ['name']
    //             }
    //         }).then(function(){
    //             console.log("index created");
    //             renderList();    
    //         });    
    //     }).catch(function (err) {
    //         console.log("index err");
    //     });
    // }).on('error', function (err) {
    //     console.log(err);
    // });
}

function renderList() {
    getPlayList().then(function(result) {        
        //var list = result.docs;
        //playerList = result.docs;
        playerList = result.rows.map(function(row) {                   
            return row.doc;
        });
        renderPlayerList();
        getMoveList();        
    }); 
}

function renderPlayerList(selectedPlayer){
    //var option = "";

    playerOption = "";

    for(i in playerList) {
        if(selectedPlayer && selectedPlayer == playerList[i]._id) {
            playerOption += '<option selected value="'+playerList[i]._id+'">'+playerList[i].name_en+'</option>';
        }else {
            playerOption += '<option value="'+playerList[i]._id+'">'+playerList[i].name_en+'</option>';
        }        
    }

    //return option;
}

function getMoveList() {
    return db.allDocs({
        include_docs: true,
        startkey: "move",
        endkey: "move\uffff"
    }).then(function(result){
        //moveList = result.docs;
        moveList = result.rows.map(function(row) {                   
            return row.doc;
        });
        setupClipForm();        
        enableButton();              
    });
}

function getClipByImage(image) {
    return db.find({
        selector: {image: image}
    });
}

function getPlayList() {
    return db.allDocs({
        include_docs: true,
        startkey: "player",
        endkey: "player\uffff"            
    })
}

function renderMoveList(index, selectedMove) {

    var radioButton = "";

    if(!selectedMove) selectedMove = moveList[0]._id;

    for(i in moveList) {
        if( moveList[i]._id == selectedMove ){
            radioButton += '<input type="radio" id="radio'+i+index+'" name="move'+index+'" checked="checked" value="'+moveList[i]._id+'"><label for="radio'+i+index+'">'+moveList[i].move_name+'</label>';    
        } else {
            radioButton += '<input type="radio" id="radio'+i+index+'" name="move'+index+'" value="'+moveList[i]._id+'"><label for="radio'+i+index+'">'+moveList[i].move_name+'</label>';    
        }        
    }

    return radioButton;
}

function getExistingClipsByImage() {
     return db.find({
        selector: {type: 'player'}
    });
}

function getDateID() {
    var currentdate = new Date();
    var datetime = "" + 
                   currentdate.getFullYear() + "_" +
                   ("0" + (currentdate.getMonth() + 1)).slice(-2) + "_" +
                   ("0" + currentdate.getDate()).slice(-2) + "_" +
                   ("0" + currentdate.getHours()).slice(-2) + "_" +
                   ("0" + currentdate.getMinutes()).slice(-2) + "_" +
                   ("0" + currentdate.getSeconds()).slice(-2); 
                   // (currentdate.getMonth() + 1) + 
                   // currentdate.getDate() +                    
                   // currentdate.getHours() +
                   // currentdate.getMinutes() + 
                   // currentdate.getSeconds();    
    return datetime;
}

function getPostID(player, move) {
    return "post_" + player + "_" + move;   
}

function generatePlayer(name, name_en, desc, image, avatar, star) {
    
    var name_id = name_en.replace(/ /g,"_");
    return {
        //"_id": "player_" + name_id + "_" + date.getTime(),
        "_id": "player_" + name_id.toLowerCase(),
        "name": name,        
        "name_en": name_en,
        "desc": desc,
        "avatar": avatar,
        "image": image,        
        //"type": "player",
        //"star": star,
        "clip_total": 0,
        "clip_moves": {}
    };
}

function generateMove(id, name, desc, image, avatar, star) {

    return {
        "_id": id,
        "move_name": name,        
        "desc": desc,
        "image": image,        
        "type": "move",
        "clip_player": {}
    };
}

function updateQty(playerID, moveID) {
    db.get(playerID).then(function(doc) {
        doc.clip_total += 1;
        if(doc.clip_moves[moveID]) {
            doc.clip_moves[moveID] += 1;
        }else{
            doc.clip_moves[moveID] = 1;
        }
        db.put(doc).then(function() {

        }).catch(function() {

        });
    }).catch(function() {

    });
}

function saveSingleClip() {

    var move = getSeletValue("move_clip"); 
    var player = getValue("player_name");
    var image = getValue("image_url");
    var desc = getValue("clip_desc");
    

    // if(!endsWith(image, "gif")) {
    //     alert("图片需要gif格式");
    //     return;
    // }

    setButtonDisable("save-clip", true);

    // var name = getValue("clip_title");
    // var desc = getValue("clip_desc");

    //putClip(name, desc, move, player, image, function(){

    setStorage(image, desc);
    updateNewsButton();

    if(!needSaveClipForPlayer('x')) {
        setButtonDisable("save-clip", false);
        cleanClipForm();
        return;
    }

    putClip(player, move, image, desc, function(image){
        setButtonDisable("save-clip", false);
        cleanClipForm();                 
        alert("保存成功！");
        // addSortableItem(image);
    }, function() {        
        setButtonDisable("save-clip", false);
    });
}

function setStorage(url, desc) {   
    var list = getStorage();
    list.push(
        {
            url: url,
            desc: desc,
        }
    );
    localStorage["clips"] = JSON.stringify(list);    
}

function getStorage() {
    var item = localStorage.getItem("clips");
    if(!item) {
        list = [];
    }else {
        list = JSON.parse(item);
    }
    return list;
}

function updateNewsButton() {
    var count = getStorage().length;
    $("#addNews").html("Add News (" + count + ")");
}

function createNews() {
    var urls = getStorage();

    if(!urls.length) {
        return;        
    }    

    renderNewsForm();

    $( "#dialog" ).dialog("open");

    for(i in urls) {
        addSortableItem(urls[i]);    
    }
}

function endsWith(string, suffix) {
    return string.indexOf(suffix, string.length - suffix.length) !== -1
}

function savePlay() {

    setButtonDisable("savePlay", true);

    var cat = getSeletValue("play_cat"); 
    var level = getSeletValue("play_level"); 
    var name = getValue("play_name");
    var desc = getValue("play_desc");
    var thumb = getValue("play_thumb");
    var url1 = getValue("play_pb");
    var url2 = getValue("play_real");

    if(cat == "" || level == "" || name == "" || desc == "" || thumb == "" || url1 == "" || url2 == "") {
        alert("请填写完整信息");
        return;
    }    

    if(isChinese(name)) {
        alert("名称不能含中文");
        return;
    }

    var obj = generatePlay(name, desc, cat, level, thumb, url1, url2);

    db.put(obj).then(function(){
        return sync().on('complete', function () {
            console.log("sync to completed");            
        }).on('error', function (err) {            
            alert("同步失败: " + err);
        });
    }).then(function(){
        resetPlaysForm();
        alert("保存成功");                  
        setButtonDisable("savePlay", true);         
    }).catch(function(err) {        
        alert("保存失败: " + err);                              
        setButtonDisable("savePlay", true);
    });
}

function resetPlaysForm() {
    $("#play_name").html('');    
    $("#play_desc").html('');    
    $("#play_thumb").html('');    
    $("#play_pb").html('');    
    $("#play_real").html('');    
}

function isChinese(string) {
    return (string.length != string.replace(/[^\x00-\xff]/g,"**").length); 
}

function generatePlay(name, desc, cat, level, thumb, url1, url2) {
    var name_id = name.replace(/ /g,"_");
    return {
        "_id": "plays_" + cat + "_" + name_id.toLowerCase(),
        "name": name,                
        "desc": desc,
        "level": parseInt(level),
        "image": [url1, url2],               
        "thumb": thumb
    };   
}

function generatePost(player, move, image, desc) {

    var id = getPostID(player, move);

    return {
        "_id": id,        
        "image": [
            {
                desc: desc, 
                url: image    
            }
        ]
    };
}

function putClip(player, move, image, desc, sCallback, fCallback) {
    
    if(move == "" || player == "" || image == "") {
        alert("请填写完整信息");
        if(fCallback) fCallback();
        return;
    }

    var id = getPostID(player, move);

    db.allDocs({include_docs: true, startkey: id, endkey: id}).then(function(result){

        var doc = {};
        if(result.rows.length == 0) {
            doc = generatePost(player, move, image, desc);
        }else {
            doc = result.rows[0].doc;

            var list = doc.image;

            for(i in list) {
                if(image == list[i].url) {
                    throw new Error('Already existed');
                }
            }

            doc.image.unshift(
                {
                    url: image,
                    desc: desc,
                }
            );
        }        
        return db.put(doc);
            
    }).then(function() {
        return db.get(player);
    }).then(function(doc) {
        doc.clip_total += 1;
        if(doc.clip_moves[move]) {
            doc.clip_moves[move] += 1;
        }else{
            doc.clip_moves[move] = 1;
        }
        return db.put(doc);
    }).then(function() {
        console.log("player updated");
        // return sync().on('complete', function () {
        //     console.log("sync to completed");
        //     sCallback(image);
        // }).on('error', function (err) {
        //     fCallback();
        //     alert("同步失败: " + err);
        // });
        return sync();
        // return syncToRemote();
    }).then(function() {
        console.log("sync to completed");
        sCallback(image);
    }).catch(function(err) {
        if(err.message == "Already existed") {
            fCallback();
            alert("同球星动作下已存在，不需重复保存");                  
        }else {
            fCallback();
            alert("保存失败: " + err);                  
        }        
    });
}

function savePlayer() {    

    setButtonDisable("save-player", true);

    var name = getValue("name"); 
    var name_en = getValue("name_en");
    var desc = getValue("desc");
    var image = "";
    var avatar = getValue("avatar");
    var star = false;

    //var obj = generatePlayer("乔丹", "Michael Jordan", "最伟大的球员", "http://abc.com/1.jpg", "http://abc.com/1.jpg", true);

    if(name == "" || name_en == "" || desc == "" || avatar == "") {
        alert("请填写完整信息");
        setButtonDisable("save-player", false);
        return;
    }

    var player = generatePlayer(name, name_en, desc, image, avatar, star);

    db.put(player).then(function(){
        console.log("player created");     
        sync().on('complete', function () {
            regeneratePlayeList(player);
            cleanForm();
            console.log("sync to completed");
            alert("保存成功！");
            setButtonDisable("save-player", false);
        }).on('error', function (err) {
            console.log(err);
            alert("同步失败！");
            setButtonDisable("save-player", false);
        });       
    }).catch(function(err) {
        alert("保存失败！");
        console.log("player create err");
        setButtonDisable("save-player", false);
    });
}

function searchClip() {

    $("#clipUpdateForm").hide();

    var name = $("#name_search").val();

    db.find({
        selector: {
            name: name,           
        },        
    }).then(function (result) {          
        searchResult = result.docs;
        renderSearchResult(searchResult);
    }).catch(function (err) {
        alert(err);
    });

    // var image = name;

    // db.find({
    //     selector: {
    //         image: image            
    //     }
    // }).then(function (result) {
    //     console.log(result.docs.length);
    // }).catch(function (err) {
    //     console.log(err);
    // });
}

function renderSearchResult(list) {

    if(list.length == 0) {        
        $("#searchResult").html('');
        alert("没有查询结果");
        return;
    }

    var header = '<thead>' +
                    '<tr>' +
                        //'<th>#</th>' +
                        '<th>球员</th>' +
                        '<th>动作</th>' +
                        '<th>描述</th>' +
                        //'<th>图片</th>' +
                        '<th>选择</th>' +
                    '</tr>' +
                 '</thead>';

    var body = '<tbody>';

    for(i in list) {

        var item = list[i];

        var moveName = moveList[findIndex(moveList, item.move)].move_name;

        var playerName = playerList[findIndex(playerList, item.player)].name;    

        body +=  '<tr id="update_row_'+i+'">' +
                    '<th scope="row">'+playerName+'</th>' +
                    //'<td>'+playerName+'</td>' +
                    '<td>'+moveName+'</td>' +
                    '<td>'+item.desc+'</td>' +
                    //'<td>'+item.image+'</td>' +
                    // '<td><a href="#" onclick="updateClip(\''+item._id+'\');return false;">修改</a></td>' +
                    '<td><a href="#" onclick="selectClip('+i+');return false;">修改</a></td>' +
                  '</tr>';
    }

    body += '</tbody>';

    $("#searchResult").html('<table class="table">' + header + body + '</table>');
}

function findIndex(array, id) {  
    var low = 0, high = array.length, mid;
    while (low < high) {
        mid = (low + high) >>> 1;
        if(array[mid]._id == id) {
            return mid;
        }else{
            array[mid]._id < id ? low = mid + 1 : high = mid    
        }
    }
    return -1;
}

function cleanActive(length) {
    for(var i=0; i<length; i++) {
        $("#update_row_"+i).removeClass("success"); 
    }
}

function setInputValue(id, val) {
    $("#"+id).val(val);
}

function performUpdate() {
    if(action == 'delete') {
        deleteClip();
    }else {
        updateClip();
    }
}

function deleteClip() {

    var clip = searchResult[selectedClip];

    if(!clip) return;

    var player = clip.player;
    var move = clip.move;

    db.remove(clip).then(function() {
        return db.get(player);        
    }).then(function(player) {
        player.clip_total -= 1;
        player.clip_moves[move] -= 1;
        return db.put(player);
    }).then(function() {
        sync().on('complete', function () {
            alert("删除成功");
            resetUpdateForm();
        }).on('error', function (err) {                    
            alert("删除成功，同步失败，请检查网络后重试");
        });
    }).catch(function(){
        alert("删除失败");
    });
}

function updateClip() {

    var clip = searchResult[selectedClip];

    if(!clip) return;

    var recreate = false;

    var move = getSeletValue("move_update"); 
    var player = getValue("player_name_update");

    var image = getValue("image_url_update");
    var name = getValue("clip_title_update");
    var desc = getValue("clip_desc_update");

    console.log(clip._id);

    if(move != clip.move) {
        recreate = true;
    }

    if(player != clip.player) {        
        recreate = true;
    }

    if(recreate) {
        db.remove(clip).then(function() {
            return db.get(clip.player);        
        }).then(function(player) {
            player.clip_total -= 1;
            player.clip_moves[clip.move] -= 1;
            return db.put(player);
        }).then(function() {
            putClip(name, desc, move, player, image, function(){            
                alert("更新成功");
                resetUpdateForm();
            }, function() {        
                alert("旧数据删除成功，新数据增加失败");
            });
        }).catch(function(){
            alert("旧数据删除失败");
        });
    }else {
        clip.image = image;
        clip.name = name;
        clip.desc = desc;

        db.put(clip)
        .then(sync)
        .then(function() {
            alert("更新成功");
            resetUpdateForm();
        }).catch(function() {
            alert("更新失败");
        });
    }
}

function isChanged(index) {

    var move = getSeletValue("move_update"); 
    var player = getValue("player_name_update");
    
    var image = getValue("image_url_update");
    var name = getValue("clip_title_update");
    var desc = getValue("clip_desc_update");

    if(move != searchResult[index].move) {
        console.log("move changed");
    }

    if(player != searchResult[index].player) {
        console.log("player changed");   
    }
}

function prepareUpdate(_action) {
    action = _action;
    $(".alert-danger").removeClass("hide");
    $(".alert-danger").show();

    if(action == 'delete') {
        $("#alert-message").html("请确认是否删除?");
    }else {
        $("#alert-message").html("请确认是否修改?");
    }
}
 
function resetUpdateForm() {
    $("#searchResult").html('');    
    $(".alert-danger").hide();
    $("#clipUpdateForm").hide();
    $("#name_search").focus();
}

function dimissAlert() {
    $(".alert-danger").fadeOut();
}

function regeneratePlayeList(player) {

    playerList.push(player);

    renderPlayerList();

    var player = '<select class="form-control" id="player_name" data-theme="bootstrap">' +                                   
                    playerOption +   
                 '</select>';

    $("#player_list").html(player);

    $("#player_name").comboSelect();   

    var list = $(".form-group-player");

    if(list.length > 0) {
        var id_list = [];
    
        for(var i=0; i< list.length; i++) {
           id_list.push($(list[i]).attr("data-id"));
        }

        list = [];

        for(l in id_list) {
            var i = id_list[l];
            var player = '<label for="player'+i+'">球员</label>' +    
                     '<select class="form-control" id="player'+i+'" data-theme="bootstrap">' +                                   
                        playerOption +   
                     '</select>';

            $("#form-group-player"+i).html(player);

            $("#player"+i).comboSelect();   
        }
    }
}

function cleanForm() {
    $("#name").val("");
    $("#name_en").val("");
    $("#desc").val("");
    $("#avatar").val("");
    $('#playerModal').modal('hide');
}

function cleanClipForm() {       
    //$("#clip_move").val("");
    //$("#player_name").val("");
    $("#image_url").val("");
    // $("#clip_title").val("");
    $("#clip_desc").val("");
    $('#clipModal').modal('hide');
}

function deleteDB() {      
    db.destroy().then(function (response) {
        console.log(response);
    }).catch(function (err) {
        console.log(err);
    });
}

function saveSucess(index) {    

    $("#clip"+index)
    .parents(".clip")
    .animate({opacity: 0})
    .toggle();
    alert("保存成功！");
}

function getValue(id) {
    return $("#"+id).val();
}

function getSeletValue(id) {
    return $('input[name='+id+']:checked').val();
}

function setupClipForm() {
    $("#player_name").html(playerOption);
    $("#player_name").comboSelect();
    $("#clip_move").html(renderMoveList("_clip"));
    $("#clip_move").buttonset();

    $("#player_name_update").html(playerOption);
    playerUI = $("#player_name_update").comboSelect();
    $("#clip_move_update").html(renderMoveList("_update"));
    $("#clip_move_update").buttonset();

    $("#clipUpdateForm").hide();

    $("#play_cat").buttonset();
    $("#play_level").buttonset();    
    $("#clip_option").buttonset();
}

function renderNewsForm() {
    $('.row').empty();

    var info = '<div class="col-xs-8 col-md-4">' +
                    '<form class="form-horizontal" id="playerForm">' +
                        '<div class="form-group">' +
                            '<label for="news_thumb" class="col-sm-2 control-label">小图</label>' +
                            '<div class="col-sm-10">' +
                                '<input type="url" class="form-control" id="news_thumb" placeholder="http://" required>' +
                            '</div>' +
                        '</div>' +                      
                        '<div class="form-group">' +
                            '<label for="news_title" class="col-sm-2 control-label">名称</label>' +
                            '<div class="col-sm-10">' +
                                '<input class="form-control" id="news_title" required>' +
                            '</div>' +
                        '</div>' +
                        '<div class="form-group">' +
                            '<label for="news_desc" class="col-sm-2 control-label">描述</label>' +
                            '<div class="col-sm-10">' +
                                '<input class="form-control" id="news_desc" required>' +
                            '</div>' +
                        '</div>' +
                        '<div class="form-group">' +
                            '<label for="news_summary" class="col-sm-2 control-label">概要</label>' +
                            '<div class="col-sm-10">' +
                                '<input class="form-control" id="news_summary" placeholder="选填">' +
                            '</div>' +
                        '</div>' +
                        '<div class="form-group">' +
                             '<button type="button" class="btn btn-primary save" onclick="saveNews()">保存</button>' +
                             '<button type="button" class="btn btn-default" onclick="cleanNews()">清空图记录</button>' +
                        '</div>' +                       
                    '</form>' +
                '</div>';
    var list = '<div class="col-xs-16 col-md-8">' +              
                    '<ul id="sortable2" class="connectedSortable">' +
                        '<li class="ui-state-default ui-state-disabled">已选短片</li>' +               
                    '</ul>' +
                    '<ul id="sortable1" class="connectedSortable">' +
                        '<li class="ui-state-default ui-state-disabled">备选短片</li>' +               
                    '</ul>' +                                                                       
                '</div>';

    $(".row").append(info + list);

    $( "#sortable1, #sortable2" ).sortable({
        connectWith: ".connectedSortable"
    }).disableSelection();

    $( "#sortable1, #sortable2" ).sortable({
        cancel: ".ui-state-disabled",
        items: "li:not(.ui-state-disabled)",
        placeholder: "ui-state-highlight"
    });
}

function showPost() {
	
	var postText = "";

    $("#sortable2").find('li').each(function(index, element){        

        var url = $(element).attr("url");
        var desc = $(element).attr("desc");
        if(url) {
            // postText += '<div><img src="' + url + '"></div><br>';

            postText += getHtmlForClip(url, desc);
                    // '<div>' +
                    //     '<p class="p1" style="text-align: center;">' + desc +
                    //         '<img src="'+url+'" style="line-height: 1.6;">'+
                    //     '</p>'+
                    // '</div>';
        }        
    });
    
    if(postText == "") {
        if(postContent == "") return;
        $('#post-content').val(postContent);    
    }else {
        $('#post-content').val(postText);    
    }
    
    $('#postModal').modal('show');
}

function addSortableItem(clip) {

    // url = "http://i2.hoopchina.com.cn/blogfile/201603/11/BbsImg145768045563810_425x237.gif";

    // if(!$("#news_title").length) {
    //     renderNewsForm();
    // }

    if(!clip) {
        return;
    }    

    var id = CryptoJS.SHA1(clip.url);

    if($("#"+id).length) {
        alert("此短片已添加，不需重复");
        return;
    }

    var item = '<li class="ui-state-default imageList" url="'+clip.url+'" desc="'+clip.desc+'">' +
                    '<div class="">' +                  
                        // '<textarea cols="5">fdafdsafdsafdsafdsafdsafdsafdsafadsfdafdafa</textarea>'
                        '<input value="'+clip.desc+'">' +
                    '</div>' +
                    '<div class="thumbnail order" id="'+id+'">' +                  
                    '</div>' +
               '</li>';
    // var html = $("#sortable1").html();

    // $("#sortable1").html(html + item);

    $("#sortable2").append(item);
        
    var img = $('<img>')
        .attr("data-gifffer", clip.url)                
        .attr("id", "img_"+id)
        .appendTo("#"+id)
        .parents(".ui-state-default")                
        .css({opacity: 0, display: 'none'});    

    Gifffer(finishAdd);
}

function addSortableItem_(url) {

    // url = "http://i2.hoopchina.com.cn/blogfile/201603/11/BbsImg145768045563810_425x237.gif";

    if(!$("#news_title").length) {
        renderNewsForm();
    }

    if(!url) {
        return;
    }

    var id = CryptoJS.SHA1(url);

    if($("#"+id).length) {
        alert("此短片已添加，不需重复");
        return;
    }

    var item = '<li class="ui-state-default imageList" url="'+url+'">' +
                    '<div class="thumbnail order" id="'+id+'">' +                  
                    '</div>' +
               '</li>';
    // var html = $("#sortable1").html();

    // $("#sortable1").html(html + item);

    $("#sortable2").append(item);
        
    var img = $('<img>')
        .attr("data-gifffer", url)                
        .attr("id", "img_"+id)
        .appendTo("#"+id)
        .parents(".ui-state-default")                
        .css({opacity: 0, display: 'none'});    

    Gifffer(finishAdd);
}

function finishAdd(image) {

    $("#"+$(image).attr("id"))
        .addClass("playing")
        .parents(".ui-state-default")
        .toggle()      
        .animate({opacity: 1});
}

function putNews(news, callback) {
    db.put(news).then(function(){
        sync().on('complete', function () {
            alert("保存成功");    
            if(callback) callback();        
        }).on('error', function (err) {            
            alert("保存成功，同步失败");            
            if(callback) callback();
        });
    }).catch(function() {
        alert("保存失败");
    })
}

function getImagesFromUrlDoneWeibo(result) {  
    var img = result.data.photo_list;
    var data = {
        images: []
    };

    for(var i in img) {
        data.images.push({
            src: img[i].pic_host + "/mw690/" + img[i].pic_name
        });
    }

    getImagesFromUrlDone(data);
}

function getHtmlForClip(url, desc) {
    return '<div style="text-align: left; margin-bottom: 1em;">' +
                '<p class="p1">' +
                    '<font face="幼圆" size="2">' + desc +                           
                    '</font>' +
                '</p>' +
                '<img src="'+url+'">' +
            '</div>';
}

function getImagesFromUrlDone(data)
{
    $('.row').empty();

    postContent = "";

    if(data && data.images) {

        var selectedPlayer = getValue("player_name");
        var selectedMove = getSeletValue("move_clip");       
        var selectedOption = needSaveClipForPlayer("x"); 

        renderPlayerList(selectedPlayer);        

        for(var i in data.images)
        {
            if (!searchAll && !data.images[i].src.match(/gif$/)) continue;

            var src = data.images[i].src;

            if(src.indexOf('small') != -1) {
                data.images[i].src = $.trim(src.replace('small', ''));    
            }

            // console.log('<div><img src="' + data.images[i].src + '"></div><br>');

            // postContent += '<div><img src="' + data.images[i].src + '"></div><br>'

            postContent += getHtmlForClip(data.images[i].src, 'TextHolder');

                    // '<div>' +
                    //     '<p class="p1" style="text-align: center;">some-text'+
                    //         '<img src="'+src+'" style="line-height: 1.6;">'+
                    //     '</p>'+
                    // '</div>';

                    // '<div style="text-align: left; margin-bottom: 1em;">' +
                    //     '<p class="p1">' +
                    //         '<font face="幼圆" size="3">' +
                    //             'some text' +
                    //         '</font>' +
                    //     '</p>' +
                    //     '<img src="'+data.images[i].src+'">' +
                    // '</div>';

            var col = '<div class="clip col-sm-12 col-md-6"><div class="thumbnail" id="clip'+i+'"></div></div>';                
            $(".row").append(col);
            
            var img = $('<img>')
                .attr("data-gifffer", data.images[i].src)                
                .attr("id", 'img'+i)
                .attr("index", i)
                .appendTo("#clip"+i)
                .parents(".clip")                
                .css({opacity: 0, display: 'none'});                
                    

            var caption = '<div class="caption"><form id="form'+i+'"></form></div>';

            $("#clip"+i).append(caption);    
                       
            var player = '<div class="form-group form-group-player clip-player-'+i+'" data-id="'+i+'" id="form-group-player'+i+'"><label for="player'+i+'">球员</label>' +    
                            '<select class="form-control" id="player'+i+'" data-theme="bootstrap">' +                                   
                                playerOption +   
                            '</select>' +
                         '</div>';

            var form = $("#form"+i);          

            var buttons = '<div class="form-group">' +
                            '<button id="cancel'+i+'" class="btn btn-default form-control" onclick="cancelClip('+i+'); return false;">舍弃</button>' +
                          '</div>' +
                          '<div class="form-group">' +
                            '<button id="save'+i+'" class="btn btn-primary form-control" onclick="saveClip('+i+'); return false;">保存</button>' +                            
                          '</div>';
                          
            form.append(buttons);

            var option = "";

            if(selectedOption) {
                option = '<div class="form-group">' +
                            '<label for="clip_option_'+i+'">选项</label>' +
                            '<div id="clip_option_'+i+'">' +
                                '<input type="radio" id="clip_player_add_'+i+'" name="clip_option_'+i+'" checked="checked" value="yes" onclick="clipOption('+i+')">' +
                                '<label for="clip_player_add_'+i+'">加入球员库</label>' +
                                '<input type="radio" id="clip_player_not_add_'+i+'" name="clip_option_'+i+'" value="no" onclick="clipOption('+i+')">' +
                                '<label for="clip_player_not_add_'+i+'">不加入</label>' +
                            '</div>' +
                         '</div>';    
            }else {
                option = '<div class="form-group">' +
                            '<label for="clip_option_'+i+'">选项</label>' +
                            '<div id="clip_option_'+i+'">' +
                                '<input type="radio" id="clip_player_add_'+i+'" name="clip_option_'+i+'" value="yes" onclick="clipOption('+i+')">' +
                                '<label for="clip_player_add_'+i+'">加入球员库</label>' +
                                '<input type="radio" id="clip_player_not_add_'+i+'" name="clip_option_'+i+'" checked="checked" value="no" onclick="clipOption('+i+')">' +
                                '<label for="clip_player_not_add_'+i+'">不加入</label>' +
                            '</div>' +
                         '</div>';    
            }

            form.append(option);
            $("#clip_option_"+i).buttonset();
            
            var image = '<input style="display:none" value="'+data.images[i].src+'" id="gif'+i+'">';   

            form.append(player);
            form.append(image);
            $("#player"+i).comboSelect();

            // var name = '<div class="form-group">' +
            //                 '<input type="text" class="form-control" placeholder="名称" id="name'+i+'">' +
            //            '</div>';

            // form.append(name);

            var moveRadio = renderMoveList(i, selectedMove);

            var move = '<div class="form-group clip-move-'+i+'">' +
                          '<label for="move'+i+'">动作</label>' +
                          '<div id="move'+i+'">' +
                              moveRadio +
                          '</div>' +
                       '</div>';


            form.append(move);
            $("#move"+i).buttonset();

            var desc = '<div class="form-group">' +
                            '<label for="clip_desc_'+i+'">描述</label>' +
                            '<div id="clip_desc_'+i+'">' +
                                '<input type="text" class="form-control" placeholder="选填" id="desc'+i+'">' +
                            '</div>'
                       '</div>';

            form.append(desc);

            var hiddenImg = '<img style="display:none;" src="' + data.images[i].src + '">'

            form.append(hiddenImg);

            // var select = '<div class="form-group">' +
            //                 '<div class="checkbox">' +
            //                     '<label>' +
            //                         '<input type="checkbox">不选择此短片'+
            //                     '</label>' +
            //                 '</div>' +
            //              '</div>';

            // var save = '<button id="save'+i+'" class="btn btn-primary form-control" onclick="saveClip('+i+'); return false;">保存</button>';
            // var cancel = '<button id="cancel'+i+'" class="btn btn-default btn-xs" onclick="cancelClip('+i+'); return false;">去掉</button>';

            // form.append(save);
            // form.append(cancel);
            

            // var buttons = '<div class="form-group">' +
            //                 '<button id="save'+i+'" class="btn btn-primary form-control" onclick="saveClip('+i+'); return false;">保存</button>' +                            
            //               '</div>';

            // form.append(buttons);
            
            // if(i==1) break;
        }
    }

    Gifffer(display);
}

function display(image) {

   if(image.width > 100 && image.height > 100) {

        var id = $(image).attr("id");

        var index = $(image).attr("index");

        setClipOption(index);

        $("#"+id)
        .addClass("playing")
        .parents(".clip")
        .toggle()        
        .animate({opacity: 1});
   }
}

function deleteDoc(id) {
    db.get(id).then(function (doc) {
        return db.remove(doc);
    });
}

function syncFromRemote() {
    return db.replicate.from(remoteURL);
}

function syncToRemote() {
    return db.replicate.to(remoteURL);
}

function sync() {
    // return db.sync(remoteURL, {
    //     filter: function (doc) {     
    //         return doc._id.indexOf('_design') != 0;
    //     }
    // });
    return db.sync(remoteURL);
}

// function syncToProd() {
//     setButtonDisable("syncToProd", true);
//     db.sync(remoteURLProd).on('complete', function () {
//         console.log("sync to PROD completed");
//         alert("同步成功！");
//         setButtonDisable("syncToProd", false);
//     }).on('error', function (err) {            
//         alert("同步失败: " + err);
//         setButtonDisable("syncToProd", false);
//     });
// }

/**
 * Sends request for images.
 */
function getImagesFromUrl() {
    $( "#dialog" ).dialog("open");
    // Make object out of form data
    var data = $(this).serializeObject();
    
    if(searchWeibo) {
        data.weibo = "true";
        $.post($(this).attr('action'), data, getImagesFromUrlDoneWeibo);
    }else {
        data.weibo = "false";
        $.post($(this).attr('action'), data, getImagesFromUrlDone);
    }

    // Return false so the form doesn't actually submit
    return false;
}

function submitPush() {
    // document.getElementById("push-form").submit(pushNotification);

    // $('#push-form').submit(pushNotification);
    $('#push-form').submit();
    // document.getElementById("push-form").submit(pushNotification);
}

function checkPushData(data, callback, failCallback) {

    if(!callback) return;

    if(data.title == "" || data.message == "" || data.push_id == "") {
        alert("请填写完整信息"); 
        return;       
    }

    db.get(data.push_id).then(function() {
        callback();
    }).catch(function() {
        alert("ID不存在，请重新输入");   
        if(failCallback) failCallback();     
    });
}

function pushNotification() {    

    setButtonDisable("submit-push", true);

    // Make object out of form data
    var data = $(this).serializeObject();
    var action = $(this).attr('action');

    checkPushData(data, function() {        
        $.post(action, data, pushNotificationDone); 
    },function(){
        setButtonDisable("submit-push", false);
    });    

    // Return false so the form doesn't actually submit
    return false;
}

function pushNotificationDone(data) {
    if(data.success) {        
        $('#pushModal').modal('hide');
        setInputValue("title", "");
        setInputValue("push_id", "");
        setInputValue("message", "");
        alert("发送成功");
    }else {
        alert("发送失败");
    }
    setButtonDisable("submit-push", false);
}

function searchImages() {
    var id = getValue("push_id");

    db.get(id).then(function(result) {
        var data = {
            images: result.image
        };        
        $('#pushModal').modal('hide');        
        showImagesFromDB(data);
    }).catch(function() {
        alert("ID不存在，请重新输入");           
    });
}

function deleteNews() {
    var id = getValue("push_id");

    if(!id || id.lastIndexOf("news_", 0) !== 0) {
        alert("请输入有效新闻ID");   
    }else {
        db.get(id).then(function(doc) {
            doc._deleted = true;
            return db.put(doc);
        }).then(function() {
            return sync();            
        }).then(function() {
            alert("新闻已删除");
        }).catch(function() {
            alert("请输入有效新闻ID");           
        });
    }
}

function showImagesFromDB(data)
{
    $( "#dialog" ).dialog("open");

    $('.row').empty();

    postContent = "";

    if(data && data.images) {        

        for(var i in data.images)
        {
            // if (!searchAll && !data.images[i].src.match(/gif$/)) continue;

            var src = data.images[i].url;
            var desc = data.images[i].desc;

            postContent += '<div><img src="' + src + '"></div><br>'

            if(src.indexOf('smal') != -1) {
                src = $.trim(src.replace('small', ''));    
            }

            var col = '<div class="clip col-sm-12 col-md-6"><div class="thumbnail" id="clip'+i+'"></div></div>';                
            $(".row").append(col);       
            
            var img = $('<img>')
                .attr("data-gifffer", src)                
                .attr("id", 'img'+i)
                .appendTo("#clip"+i)
                .parents(".clip")                
                .css({opacity: 0, display: 'none'});                
                    

            var caption = '<div class="caption"><form id="form'+i+'"></form></div>';

            $("#clip"+i).append(caption);                

            var form = $("#form"+i);          

            var buttons = '<div class="form-group">' +
                            '<button id="cancel'+i+'" class="btn btn-default form-control" onclick="cancelClip('+i+'); return false;">去掉</button>' +
                          '</div>';

            buttons +=    '<div class="form-group">' +
                            '<button id="save'+i+'" class="btn btn-primary form-control" onclick="saveClip('+i+'); return false;">保存到新闻</button>' +                            
                          '</div>';
                          
            form.append(buttons);  

            var urlInput = '<input type="url" class="form-control" id="gif'+i+'" value="'+src+'">';

            form.append(urlInput);  

            var desc = '<div class="form-group">' +
                            '<label for="clip_desc_'+i+'">描述</label>' +
                            '<div id="clip_desc_'+i+'">' +
                                '<input type="text" class="form-control" placeholder="选填" id="desc'+i+'" value="'+desc+'">' +
                            '</div>'
                       '</div>';

            form.append(desc);

            var hiddenImg = '<img style="display:none;" src="' + src + '">'

            form.append(hiddenImg);

            // if(i==1) break;
        }
    }

    Gifffer(display);
}

function saveImageAs(i) {
    // window.location.assign("http://i3.hoopchina.com.cn/blogfile/201402/25/BbsImg139331400775657_400*226.gif");
}

/**
 * Serializes a form into an object.
 */
$.fn.serializeObject = function()
{
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
                if (o[this.name]) {
                        if (!o[this.name].push) {
                                o[this.name] = [o[this.name]];
                        }
                        o[this.name].push(this.value || '');
                } else {
                        o[this.name] = this.value || '';
                }
        });
        return o;
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"rest":3,"rest/interceptor/mime":8}],2:[function(require,module,exports){
/*
 * Copyright 2012-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

var mixin, xWWWFormURLEncoder, origin, urlRE, absoluteUrlRE, fullyQualifiedUrlRE;

mixin = require('./util/mixin');
xWWWFormURLEncoder = require('./mime/type/application/x-www-form-urlencoded');

urlRE = /([a-z][a-z0-9\+\-\.]*:)\/\/([^@]+@)?(([^:\/]+)(:([0-9]+))?)?(\/[^?#]*)?(\?[^#]*)?(#\S*)?/i;
absoluteUrlRE = /^([a-z][a-z0-9\-\+\.]*:\/\/|\/)/i;
fullyQualifiedUrlRE = /([a-z][a-z0-9\+\-\.]*:)\/\/([^@]+@)?(([^:\/]+)(:([0-9]+))?)?\//i;

/**
 * Apply params to the template to create a URL.
 *
 * Parameters that are not applied directly to the template, are appended
 * to the URL as query string parameters.
 *
 * @param {string} template the URI template
 * @param {Object} params parameters to apply to the template
 * @return {string} the resulting URL
 */
function buildUrl(template, params) {
	// internal builder to convert template with params.
	var url, name, queryStringParams, queryString, re;

	url = template;
	queryStringParams = {};

	if (params) {
		for (name in params) {
			/*jshint forin:false */
			re = new RegExp('\\{' + name + '\\}');
			if (re.test(url)) {
				url = url.replace(re, encodeURIComponent(params[name]), 'g');
			}
			else {
				queryStringParams[name] = params[name];
			}
		}

		queryString = xWWWFormURLEncoder.write(queryStringParams);
		if (queryString) {
			url += url.indexOf('?') === -1 ? '?' : '&';
			url += queryString;
		}
	}
	return url;
}

function startsWith(str, test) {
	return str.indexOf(test) === 0;
}

/**
 * Create a new URL Builder
 *
 * @param {string|UrlBuilder} template the base template to build from, may be another UrlBuilder
 * @param {Object} [params] base parameters
 * @constructor
 */
function UrlBuilder(template, params) {
	if (!(this instanceof UrlBuilder)) {
		// invoke as a constructor
		return new UrlBuilder(template, params);
	}

	if (template instanceof UrlBuilder) {
		this._template = template.template;
		this._params = mixin({}, this._params, params);
	}
	else {
		this._template = (template || '').toString();
		this._params = params || {};
	}
}

UrlBuilder.prototype = {

	/**
	 * Create a new UrlBuilder instance that extends the current builder.
	 * The current builder is unmodified.
	 *
	 * @param {string} [template] URL template to append to the current template
	 * @param {Object} [params] params to combine with current params.  New params override existing params
	 * @return {UrlBuilder} the new builder
	 */
	append: function (template,  params) {
		// TODO consider query strings and fragments
		return new UrlBuilder(this._template + template, mixin({}, this._params, params));
	},

	/**
	 * Create a new UrlBuilder with a fully qualified URL based on the
	 * window's location or base href and the current templates relative URL.
	 *
	 * Path variables are preserved.
	 *
	 * *Browser only*
	 *
	 * @return {UrlBuilder} the fully qualified URL template
	 */
	fullyQualify: function () {
		if (typeof location === 'undefined') { return this; }
		if (this.isFullyQualified()) { return this; }

		var template = this._template;

		if (startsWith(template, '//')) {
			template = origin.protocol + template;
		}
		else if (startsWith(template, '/')) {
			template = origin.origin + template;
		}
		else if (!this.isAbsolute()) {
			template = origin.origin + origin.pathname.substring(0, origin.pathname.lastIndexOf('/') + 1);
		}

		if (template.indexOf('/', 8) === -1) {
			// default the pathname to '/'
			template = template + '/';
		}

		return new UrlBuilder(template, this._params);
	},

	/**
	 * True if the URL is absolute
	 *
	 * @return {boolean}
	 */
	isAbsolute: function () {
		return absoluteUrlRE.test(this.build());
	},

	/**
	 * True if the URL is fully qualified
	 *
	 * @return {boolean}
	 */
	isFullyQualified: function () {
		return fullyQualifiedUrlRE.test(this.build());
	},

	/**
	 * True if the URL is cross origin. The protocol, host and port must not be
	 * the same in order to be cross origin,
	 *
	 * @return {boolean}
	 */
	isCrossOrigin: function () {
		if (!origin) {
			return true;
		}
		var url = this.parts();
		return url.protocol !== origin.protocol ||
		       url.hostname !== origin.hostname ||
		       url.port !== origin.port;
	},

	/**
	 * Split a URL into its consituent parts following the naming convention of
	 * 'window.location'. One difference is that the port will contain the
	 * protocol default if not specified.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/DOM/window.location
	 *
	 * @returns {Object} a 'window.location'-like object
	 */
	parts: function () {
		/*jshint maxcomplexity:20 */
		var url, parts;
		url = this.fullyQualify().build().match(urlRE);
		parts = {
			href: url[0],
			protocol: url[1],
			host: url[3] || '',
			hostname: url[4] || '',
			port: url[6],
			pathname: url[7] || '',
			search: url[8] || '',
			hash: url[9] || ''
		};
		parts.origin = parts.protocol + '//' + parts.host;
		parts.port = parts.port || (parts.protocol === 'https:' ? '443' : parts.protocol === 'http:' ? '80' : '');
		return parts;
	},

	/**
	 * Expand the template replacing path variables with parameters
	 *
	 * @param {Object} [params] params to combine with current params.  New params override existing params
	 * @return {string} the expanded URL
	 */
	build: function (params) {
		return buildUrl(this._template, mixin({}, this._params, params));
	},

	/**
	 * @see build
	 */
	toString: function () {
		return this.build();
	}

};

origin = typeof location !== 'undefined' ? new UrlBuilder(location.href).parts() : void 0;

module.exports = UrlBuilder;

},{"./mime/type/application/x-www-form-urlencoded":15,"./util/mixin":21}],3:[function(require,module,exports){
/*
 * Copyright 2014-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

var rest = require('./client/default'),
    browser = require('./client/xhr');

rest.setPlatformDefaultClient(browser);

module.exports = rest;

},{"./client/default":5,"./client/xhr":6}],4:[function(require,module,exports){
/*
 * Copyright 2014-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

/**
 * Add common helper methods to a client impl
 *
 * @param {function} impl the client implementation
 * @param {Client} [target] target of this client, used when wrapping other clients
 * @returns {Client} the client impl with additional methods
 */
module.exports = function client(impl, target) {

	if (target) {

		/**
		 * @returns {Client} the target client
		 */
		impl.skip = function skip() {
			return target;
		};

	}

	/**
	 * Allow a client to easily be wrapped by an interceptor
	 *
	 * @param {Interceptor} interceptor the interceptor to wrap this client with
	 * @param [config] configuration for the interceptor
	 * @returns {Client} the newly wrapped client
	 */
	impl.wrap = function wrap(interceptor, config) {
		return interceptor(impl, config);
	};

	/**
	 * @deprecated
	 */
	impl.chain = function chain() {
		if (typeof console !== 'undefined') {
			console.log('rest.js: client.chain() is deprecated, use client.wrap() instead');
		}

		return impl.wrap.apply(this, arguments);
	};

	return impl;

};

},{}],5:[function(require,module,exports){
/*
 * Copyright 2014-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

/**
 * Plain JS Object containing properties that represent an HTTP request.
 *
 * Depending on the capabilities of the underlying client, a request
 * may be cancelable. If a request may be canceled, the client will add
 * a canceled flag and cancel function to the request object. Canceling
 * the request will put the response into an error state.
 *
 * @field {string} [method='GET'] HTTP method, commonly GET, POST, PUT, DELETE or HEAD
 * @field {string|UrlBuilder} [path=''] path template with optional path variables
 * @field {Object} [params] parameters for the path template and query string
 * @field {Object} [headers] custom HTTP headers to send, in addition to the clients default headers
 * @field [entity] the HTTP entity, common for POST or PUT requests
 * @field {boolean} [canceled] true if the request has been canceled, set by the client
 * @field {Function} [cancel] cancels the request if invoked, provided by the client
 * @field {Client} [originator] the client that first handled this request, provided by the interceptor
 *
 * @class Request
 */

/**
 * Plain JS Object containing properties that represent an HTTP response
 *
 * @field {Object} [request] the request object as received by the root client
 * @field {Object} [raw] the underlying request object, like XmlHttpRequest in a browser
 * @field {number} [status.code] status code of the response (i.e. 200, 404)
 * @field {string} [status.text] status phrase of the response
 * @field {Object] [headers] response headers hash of normalized name, value pairs
 * @field [entity] the response body
 *
 * @class Response
 */

/**
 * HTTP client particularly suited for RESTful operations.
 *
 * @field {function} wrap wraps this client with a new interceptor returning the wrapped client
 *
 * @param {Request} the HTTP request
 * @returns {ResponsePromise<Response>} a promise the resolves to the HTTP response
 *
 * @class Client
 */

 /**
  * Extended when.js Promises/A+ promise with HTTP specific helpers
  *q
  * @method entity promise for the HTTP entity
  * @method status promise for the HTTP status code
  * @method headers promise for the HTTP response headers
  * @method header promise for a specific HTTP response header
  *
  * @class ResponsePromise
  * @extends Promise
  */

var client, target, platformDefault;

client = require('../client');

if (typeof Promise !== 'function' && console && console.log) {
	console.log('An ES6 Promise implementation is required to use rest.js. See https://github.com/cujojs/when/blob/master/docs/es6-promise-shim.md for using when.js as a Promise polyfill.');
}

/**
 * Make a request with the default client
 * @param {Request} the HTTP request
 * @returns {Promise<Response>} a promise the resolves to the HTTP response
 */
function defaultClient() {
	return target.apply(void 0, arguments);
}

/**
 * Change the default client
 * @param {Client} client the new default client
 */
defaultClient.setDefaultClient = function setDefaultClient(client) {
	target = client;
};

/**
 * Obtain a direct reference to the current default client
 * @returns {Client} the default client
 */
defaultClient.getDefaultClient = function getDefaultClient() {
	return target;
};

/**
 * Reset the default client to the platform default
 */
defaultClient.resetDefaultClient = function resetDefaultClient() {
	target = platformDefault;
};

/**
 * @private
 */
defaultClient.setPlatformDefaultClient = function setPlatformDefaultClient(client) {
	if (platformDefault) {
		throw new Error('Unable to redefine platformDefaultClient');
	}
	target = platformDefault = client;
};

module.exports = client(defaultClient);

},{"../client":4}],6:[function(require,module,exports){
/*
 * Copyright 2012-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

var normalizeHeaderName, responsePromise, client, headerSplitRE;

normalizeHeaderName = require('../util/normalizeHeaderName');
responsePromise = require('../util/responsePromise');
client = require('../client');

// according to the spec, the line break is '\r\n', but doesn't hold true in practice
headerSplitRE = /[\r|\n]+/;

function parseHeaders(raw) {
	// Note: Set-Cookie will be removed by the browser
	var headers = {};

	if (!raw) { return headers; }

	raw.trim().split(headerSplitRE).forEach(function (header) {
		var boundary, name, value;
		boundary = header.indexOf(':');
		name = normalizeHeaderName(header.substring(0, boundary).trim());
		value = header.substring(boundary + 1).trim();
		if (headers[name]) {
			if (Array.isArray(headers[name])) {
				// add to an existing array
				headers[name].push(value);
			}
			else {
				// convert single value to array
				headers[name] = [headers[name], value];
			}
		}
		else {
			// new, single value
			headers[name] = value;
		}
	});

	return headers;
}

function safeMixin(target, source) {
	Object.keys(source || {}).forEach(function (prop) {
		// make sure the property already exists as
		// IE 6 will blow up if we add a new prop
		if (source.hasOwnProperty(prop) && prop in target) {
			try {
				target[prop] = source[prop];
			}
			catch (e) {
				// ignore, expected for some properties at some points in the request lifecycle
			}
		}
	});

	return target;
}

module.exports = client(function xhr(request) {
	return responsePromise.promise(function (resolve, reject) {
		/*jshint maxcomplexity:20 */

		var client, method, url, headers, entity, headerName, response, XHR;

		request = typeof request === 'string' ? { path: request } : request || {};
		response = { request: request };

		if (request.canceled) {
			response.error = 'precanceled';
			reject(response);
			return;
		}

		XHR = request.engine || XMLHttpRequest;
		if (!XHR) {
			reject({ request: request, error: 'xhr-not-available' });
			return;
		}

		entity = request.entity;
		request.method = request.method || (entity ? 'POST' : 'GET');
		method = request.method;
		url = response.url = request.path || '';

		try {
			client = response.raw = new XHR();

			// mixin extra request properties before and after opening the request as some properties require being set at different phases of the request
			safeMixin(client, request.mixin);
			client.open(method, url, true);
			safeMixin(client, request.mixin);

			headers = request.headers;
			for (headerName in headers) {
				/*jshint forin:false */
				if (headerName === 'Content-Type' && headers[headerName] === 'multipart/form-data') {
					// XMLHttpRequest generates its own Content-Type header with the
					// appropriate multipart boundary when sending multipart/form-data.
					continue;
				}

				client.setRequestHeader(headerName, headers[headerName]);
			}

			request.canceled = false;
			request.cancel = function cancel() {
				request.canceled = true;
				client.abort();
				reject(response);
			};

			client.onreadystatechange = function (/* e */) {
				if (request.canceled) { return; }
				if (client.readyState === (XHR.DONE || 4)) {
					response.status = {
						code: client.status,
						text: client.statusText
					};
					response.headers = parseHeaders(client.getAllResponseHeaders());
					response.entity = client.responseText;

					// #125 -- Sometimes IE8-9 uses 1223 instead of 204
					// http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
					if (response.status.code === 1223) {
						response.status.code = 204;
					}

					if (response.status.code > 0) {
						// check status code as readystatechange fires before error event
						resolve(response);
					}
					else {
						// give the error callback a chance to fire before resolving
						// requests for file:// URLs do not have a status code
						setTimeout(function () {
							resolve(response);
						}, 0);
					}
				}
			};

			try {
				client.onerror = function (/* e */) {
					response.error = 'loaderror';
					reject(response);
				};
			}
			catch (e) {
				// IE 6 will not support error handling
			}

			client.send(entity);
		}
		catch (e) {
			response.error = 'loaderror';
			reject(response);
		}

	});
});

},{"../client":4,"../util/normalizeHeaderName":22,"../util/responsePromise":23}],7:[function(require,module,exports){
/*
 * Copyright 2012-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

var defaultClient, mixin, responsePromise, client;

defaultClient = require('./client/default');
mixin = require('./util/mixin');
responsePromise = require('./util/responsePromise');
client = require('./client');

/**
 * Interceptors have the ability to intercept the request and/org response
 * objects.  They may augment, prune, transform or replace the
 * request/response as needed.  Clients may be composed by wrapping
 * together multiple interceptors.
 *
 * Configured interceptors are functional in nature.  Wrapping a client in
 * an interceptor will not affect the client, merely the data that flows in
 * and out of that client.  A common configuration can be created once and
 * shared; specialization can be created by further wrapping that client
 * with custom interceptors.
 *
 * @param {Client} [target] client to wrap
 * @param {Object} [config] configuration for the interceptor, properties will be specific to the interceptor implementation
 * @returns {Client} A client wrapped with the interceptor
 *
 * @class Interceptor
 */

function defaultInitHandler(config) {
	return config;
}

function defaultRequestHandler(request /*, config, meta */) {
	return request;
}

function defaultResponseHandler(response /*, config, meta */) {
	return response;
}

/**
 * Alternate return type for the request handler that allows for more complex interactions.
 *
 * @param properties.request the traditional request return object
 * @param {Promise} [properties.abort] promise that resolves if/when the request is aborted
 * @param {Client} [properties.client] override the defined client with an alternate client
 * @param [properties.response] response for the request, short circuit the request
 */
function ComplexRequest(properties) {
	if (!(this instanceof ComplexRequest)) {
		// in case users forget the 'new' don't mix into the interceptor
		return new ComplexRequest(properties);
	}
	mixin(this, properties);
}

/**
 * Create a new interceptor for the provided handlers.
 *
 * @param {Function} [handlers.init] one time intialization, must return the config object
 * @param {Function} [handlers.request] request handler
 * @param {Function} [handlers.response] response handler regardless of error state
 * @param {Function} [handlers.success] response handler when the request is not in error
 * @param {Function} [handlers.error] response handler when the request is in error, may be used to 'unreject' an error state
 * @param {Function} [handlers.client] the client to use if otherwise not specified, defaults to platform default client
 *
 * @returns {Interceptor}
 */
function interceptor(handlers) {

	var initHandler, requestHandler, successResponseHandler, errorResponseHandler;

	handlers = handlers || {};

	initHandler            = handlers.init    || defaultInitHandler;
	requestHandler         = handlers.request || defaultRequestHandler;
	successResponseHandler = handlers.success || handlers.response || defaultResponseHandler;
	errorResponseHandler   = handlers.error   || function () {
		// Propagate the rejection, with the result of the handler
		return Promise.resolve((handlers.response || defaultResponseHandler).apply(this, arguments))
			.then(Promise.reject.bind(Promise));
	};

	return function (target, config) {

		if (typeof target === 'object') {
			config = target;
		}
		if (typeof target !== 'function') {
			target = handlers.client || defaultClient;
		}

		config = initHandler(config || {});

		function interceptedClient(request) {
			var context, meta;
			context = {};
			meta = { 'arguments': Array.prototype.slice.call(arguments), client: interceptedClient };
			request = typeof request === 'string' ? { path: request } : request || {};
			request.originator = request.originator || interceptedClient;
			return responsePromise(
				requestHandler.call(context, request, config, meta),
				function (request) {
					var response, abort, next;
					next = target;
					if (request instanceof ComplexRequest) {
						// unpack request
						abort = request.abort;
						next = request.client || next;
						response = request.response;
						// normalize request, must be last
						request = request.request;
					}
					response = response || Promise.resolve(request).then(function (request) {
						return Promise.resolve(next(request)).then(
							function (response) {
								return successResponseHandler.call(context, response, config, meta);
							},
							function (response) {
								return errorResponseHandler.call(context, response, config, meta);
							}
						);
					});
					return abort ? Promise.race([response, abort]) : response;
				},
				function (error) {
					return Promise.reject({ request: request, error: error });
				}
			);
		}

		return client(interceptedClient, target);
	};
}

interceptor.ComplexRequest = ComplexRequest;

module.exports = interceptor;

},{"./client":4,"./client/default":5,"./util/mixin":21,"./util/responsePromise":23}],8:[function(require,module,exports){
/*
 * Copyright 2012-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

var interceptor, mime, registry, noopConverter, missingConverter, attempt;

interceptor = require('../interceptor');
mime = require('../mime');
registry = require('../mime/registry');
attempt = require('../util/attempt');

noopConverter = {
	read: function (obj) { return obj; },
	write: function (obj) { return obj; }
};

missingConverter = {
	read: function () { throw 'No read method found on converter'; },
	write: function () { throw 'No write method found on converter'; }
};

/**
 * MIME type support for request and response entities.  Entities are
 * (de)serialized using the converter for the MIME type.
 *
 * Request entities are converted using the desired converter and the
 * 'Accept' request header prefers this MIME.
 *
 * Response entities are converted based on the Content-Type response header.
 *
 * @param {Client} [client] client to wrap
 * @param {string} [config.mime='text/plain'] MIME type to encode the request
 *   entity
 * @param {string} [config.accept] Accept header for the request
 * @param {Client} [config.client=<request.originator>] client passed to the
 *   converter, defaults to the client originating the request
 * @param {Registry} [config.registry] MIME registry, defaults to the root
 *   registry
 * @param {boolean} [config.permissive] Allow an unkown request MIME type
 *
 * @returns {Client}
 */
module.exports = interceptor({
	init: function (config) {
		config.registry = config.registry || registry;
		return config;
	},
	request: function (request, config) {
		var type, headers;

		headers = request.headers || (request.headers = {});
		type = mime.parse(headers['Content-Type'] || config.mime || 'text/plain');
		headers.Accept = headers.Accept || config.accept || type.raw + ', application/json;q=0.8, text/plain;q=0.5, */*;q=0.2';

		if (!('entity' in request)) {
			return request;
		}

		headers['Content-Type'] = type.raw;

		return config.registry.lookup(type)['catch'](function () {
			// failed to resolve converter
			if (config.permissive) {
				return noopConverter;
			}
			throw 'mime-unknown';
		}).then(function (converter) {
			var client = config.client || request.originator,
				write = converter.write || missingConverter.write;

			return attempt(write.bind(void 0, request.entity, { client: client, request: request, mime: type, registry: config.registry }))
				['catch'](function() {
					throw 'mime-serialization';
				})
				.then(function(entity) {
					request.entity = entity;
					return request;
				});
		});
	},
	response: function (response, config) {
		if (!(response.headers && response.headers['Content-Type'] && response.entity)) {
			return response;
		}

		var type = mime.parse(response.headers['Content-Type']);

		return config.registry.lookup(type)['catch'](function () { return noopConverter; }).then(function (converter) {
			var client = config.client || response.request && response.request.originator,
				read = converter.read || missingConverter.read;

			return attempt(read.bind(void 0, response.entity, { client: client, response: response, mime: type, registry: config.registry }))
				['catch'](function (e) {
					response.error = 'mime-deserialization';
					response.cause = e;
					throw response;
				})
				.then(function (entity) {
					response.entity = entity;
					return response;
				});
		});
	}
});

},{"../interceptor":7,"../mime":11,"../mime/registry":12,"../util/attempt":18}],9:[function(require,module,exports){
/*
 * Copyright 2012-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

var interceptor, UrlBuilder;

interceptor = require('../interceptor');
UrlBuilder = require('../UrlBuilder');

function startsWith(str, prefix) {
	return str.indexOf(prefix) === 0;
}

function endsWith(str, suffix) {
	return str.lastIndexOf(suffix) + suffix.length === str.length;
}

/**
 * Prefixes the request path with a common value.
 *
 * @param {Client} [client] client to wrap
 * @param {number} [config.prefix] path prefix
 *
 * @returns {Client}
 */
module.exports = interceptor({
	request: function (request, config) {
		var path;

		if (config.prefix && !(new UrlBuilder(request.path).isFullyQualified())) {
			path = config.prefix;
			if (request.path) {
				if (!endsWith(path, '/') && !startsWith(request.path, '/')) {
					// add missing '/' between path sections
					path += '/';
				}
				path += request.path;
			}
			request.path = path;
		}

		return request;
	}
});

},{"../UrlBuilder":2,"../interceptor":7}],10:[function(require,module,exports){
/*
 * Copyright 2015-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

var interceptor, uriTemplate, mixin;

interceptor = require('../interceptor');
uriTemplate = require('../util/uriTemplate');
mixin = require('../util/mixin');

/**
 * Applies request params to the path as a URI Template
 *
 * Params are removed from the request object, as they have been consumed.
 *
 * @see https://tools.ietf.org/html/rfc6570
 *
 * @param {Client} [client] client to wrap
 * @param {Object} [config.params] default param values
 * @param {string} [config.template] default template
 *
 * @returns {Client}
 */
module.exports = interceptor({
	init: function (config) {
		config.params = config.params || {};
		config.template = config.template || '';
		return config;
	},
	request: function (request, config) {
		var template, params;

		template = request.path || config.template;
		params = mixin({}, request.params, config.params);

		request.path = uriTemplate.expand(template, params);
		delete request.params;

		return request;
	}
});

},{"../interceptor":7,"../util/mixin":21,"../util/uriTemplate":25}],11:[function(require,module,exports){
/*
* Copyright 2014-2016 the original author or authors
* @license MIT, see LICENSE.txt for details
*
* @author Scott Andrews
*/

'use strict';

/**
 * Parse a MIME type into it's constituent parts
 *
 * @param {string} mime MIME type to parse
 * @return {{
 *   {string} raw the original MIME type
 *   {string} type the type and subtype
 *   {string} [suffix] mime suffix, including the plus, if any
 *   {Object} params key/value pair of attributes
 * }}
 */
function parse(mime) {
	var params, type;

	params = mime.split(';');
	type = params[0].trim().split('+');

	return {
		raw: mime,
		type: type[0],
		suffix: type[1] ? '+' + type[1] : '',
		params: params.slice(1).reduce(function (params, pair) {
			pair = pair.split('=');
			params[pair[0].trim()] = pair[1] ? pair[1].trim() : void 0;
			return params;
		}, {})
	};
}

module.exports = {
	parse: parse
};

},{}],12:[function(require,module,exports){
/*
 * Copyright 2012-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

var mime, registry;

mime = require('../mime');

function Registry(mimes) {

	/**
	 * Lookup the converter for a MIME type
	 *
	 * @param {string} type the MIME type
	 * @return a promise for the converter
	 */
	this.lookup = function lookup(type) {
		var parsed;

		parsed = typeof type === 'string' ? mime.parse(type) : type;

		if (mimes[parsed.raw]) {
			return mimes[parsed.raw];
		}
		if (mimes[parsed.type + parsed.suffix]) {
			return mimes[parsed.type + parsed.suffix];
		}
		if (mimes[parsed.type]) {
			return mimes[parsed.type];
		}
		if (mimes[parsed.suffix]) {
			return mimes[parsed.suffix];
		}

		return Promise.reject(new Error('Unable to locate converter for mime "' + parsed.raw + '"'));
	};

	/**
	 * Create a late dispatched proxy to the target converter.
	 *
	 * Common when a converter is registered under multiple names and
	 * should be kept in sync if updated.
	 *
	 * @param {string} type mime converter to dispatch to
	 * @returns converter whose read/write methods target the desired mime converter
	 */
	this.delegate = function delegate(type) {
		return {
			read: function () {
				var args = arguments;
				return this.lookup(type).then(function (converter) {
					return converter.read.apply(this, args);
				}.bind(this));
			}.bind(this),
			write: function () {
				var args = arguments;
				return this.lookup(type).then(function (converter) {
					return converter.write.apply(this, args);
				}.bind(this));
			}.bind(this)
		};
	};

	/**
	 * Register a custom converter for a MIME type
	 *
	 * @param {string} type the MIME type
	 * @param converter the converter for the MIME type
	 * @return a promise for the converter
	 */
	this.register = function register(type, converter) {
		mimes[type] = Promise.resolve(converter);
		return mimes[type];
	};

	/**
	 * Create a child registry whoes registered converters remain local, while
	 * able to lookup converters from its parent.
	 *
	 * @returns child MIME registry
	 */
	this.child = function child() {
		return new Registry(Object.create(mimes));
	};

}

registry = new Registry({});

// include provided serializers
registry.register('application/hal', require('./type/application/hal'));
registry.register('application/json', require('./type/application/json'));
registry.register('application/x-www-form-urlencoded', require('./type/application/x-www-form-urlencoded'));
registry.register('multipart/form-data', require('./type/multipart/form-data'));
registry.register('text/plain', require('./type/text/plain'));

registry.register('+json', registry.delegate('application/json'));

module.exports = registry;

},{"../mime":11,"./type/application/hal":13,"./type/application/json":14,"./type/application/x-www-form-urlencoded":15,"./type/multipart/form-data":16,"./type/text/plain":17}],13:[function(require,module,exports){
/*
 * Copyright 2013-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

var pathPrefix, template, find, lazyPromise, responsePromise;

pathPrefix = require('../../../interceptor/pathPrefix');
template = require('../../../interceptor/template');
find = require('../../../util/find');
lazyPromise = require('../../../util/lazyPromise');
responsePromise = require('../../../util/responsePromise');

function defineProperty(obj, name, value) {
	Object.defineProperty(obj, name, {
		value: value,
		configurable: true,
		enumerable: false,
		writeable: true
	});
}

/**
 * Hypertext Application Language serializer
 *
 * Implemented to https://tools.ietf.org/html/draft-kelly-json-hal-06
 *
 * As the spec is still a draft, this implementation will be updated as the
 * spec evolves
 *
 * Objects are read as HAL indexing links and embedded objects on to the
 * resource. Objects are written as plain JSON.
 *
 * Embedded relationships are indexed onto the resource by the relationship
 * as a promise for the related resource.
 *
 * Links are indexed onto the resource as a lazy promise that will GET the
 * resource when a handler is first registered on the promise.
 *
 * A `requestFor` method is added to the entity to make a request for the
 * relationship.
 *
 * A `clientFor` method is added to the entity to get a full Client for a
 * relationship.
 *
 * The `_links` and `_embedded` properties on the resource are made
 * non-enumerable.
 */
module.exports = {

	read: function (str, opts) {
		var client, console;

		opts = opts || {};
		client = opts.client;
		console = opts.console || console;

		function deprecationWarning(relationship, deprecation) {
			if (deprecation && console && console.warn || console.log) {
				(console.warn || console.log).call(console, 'Relationship \'' + relationship + '\' is deprecated, see ' + deprecation);
			}
		}

		return opts.registry.lookup(opts.mime.suffix).then(function (converter) {
			return converter.read(str, opts);
		}).then(function (root) {
			find.findProperties(root, '_embedded', function (embedded, resource, name) {
				Object.keys(embedded).forEach(function (relationship) {
					if (relationship in resource) { return; }
					var related = responsePromise({
						entity: embedded[relationship]
					});
					defineProperty(resource, relationship, related);
				});
				defineProperty(resource, name, embedded);
			});
			find.findProperties(root, '_links', function (links, resource, name) {
				Object.keys(links).forEach(function (relationship) {
					var link = links[relationship];
					if (relationship in resource) { return; }
					defineProperty(resource, relationship, responsePromise.make(lazyPromise(function () {
						if (link.deprecation) { deprecationWarning(relationship, link.deprecation); }
						if (link.templated === true) {
							return template(client)({ path: link.href });
						}
						return client({ path: link.href });
					})));
				});
				defineProperty(resource, name, links);
				defineProperty(resource, 'clientFor', function (relationship, clientOverride) {
					var link = links[relationship];
					if (!link) {
						throw new Error('Unknown relationship: ' + relationship);
					}
					if (link.deprecation) { deprecationWarning(relationship, link.deprecation); }
					if (link.templated === true) {
						return template(
							clientOverride || client,
							{ template: link.href }
						);
					}
					return pathPrefix(
						clientOverride || client,
						{ prefix: link.href }
					);
				});
				defineProperty(resource, 'requestFor', function (relationship, request, clientOverride) {
					var client = this.clientFor(relationship, clientOverride);
					return client(request);
				});
			});

			return root;
		});

	},

	write: function (obj, opts) {
		return opts.registry.lookup(opts.mime.suffix).then(function (converter) {
			return converter.write(obj, opts);
		});
	}

};

},{"../../../interceptor/pathPrefix":9,"../../../interceptor/template":10,"../../../util/find":19,"../../../util/lazyPromise":20,"../../../util/responsePromise":23}],14:[function(require,module,exports){
/*
 * Copyright 2012-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

/**
 * Create a new JSON converter with custom reviver/replacer.
 *
 * The extended converter must be published to a MIME registry in order
 * to be used. The existing converter will not be modified.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
 *
 * @param {function} [reviver=undefined] custom JSON.parse reviver
 * @param {function|Array} [replacer=undefined] custom JSON.stringify replacer
 */
function createConverter(reviver, replacer) {
	return {

		read: function (str) {
			return JSON.parse(str, reviver);
		},

		write: function (obj) {
			return JSON.stringify(obj, replacer);
		},

		extend: createConverter

	};
}

module.exports = createConverter();

},{}],15:[function(require,module,exports){
/*
 * Copyright 2012-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

var encodedSpaceRE, urlEncodedSpaceRE;

encodedSpaceRE = /%20/g;
urlEncodedSpaceRE = /\+/g;

function urlEncode(str) {
	str = encodeURIComponent(str);
	// spec says space should be encoded as '+'
	return str.replace(encodedSpaceRE, '+');
}

function urlDecode(str) {
	// spec says space should be encoded as '+'
	str = str.replace(urlEncodedSpaceRE, ' ');
	return decodeURIComponent(str);
}

function append(str, name, value) {
	if (Array.isArray(value)) {
		value.forEach(function (value) {
			str = append(str, name, value);
		});
	}
	else {
		if (str.length > 0) {
			str += '&';
		}
		str += urlEncode(name);
		if (value !== undefined && value !== null) {
			str += '=' + urlEncode(value);
		}
	}
	return str;
}

module.exports = {

	read: function (str) {
		var obj = {};
		str.split('&').forEach(function (entry) {
			var pair, name, value;
			pair = entry.split('=');
			name = urlDecode(pair[0]);
			if (pair.length === 2) {
				value = urlDecode(pair[1]);
			}
			else {
				value = null;
			}
			if (name in obj) {
				if (!Array.isArray(obj[name])) {
					// convert to an array, perserving currnent value
					obj[name] = [obj[name]];
				}
				obj[name].push(value);
			}
			else {
				obj[name] = value;
			}
		});
		return obj;
	},

	write: function (obj) {
		var str = '';
		Object.keys(obj).forEach(function (name) {
			str = append(str, name, obj[name]);
		});
		return str;
	}

};

},{}],16:[function(require,module,exports){
/*
 * Copyright 2014-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Michael Jackson
 */

/* global FormData, File, Blob */

'use strict';

function isFormElement(object) {
	return object &&
		object.nodeType === 1 && // Node.ELEMENT_NODE
		object.tagName === 'FORM';
}

function createFormDataFromObject(object) {
	var formData = new FormData();

	var value;
	for (var property in object) {
		if (object.hasOwnProperty(property)) {
			value = object[property];

			if (value instanceof File) {
				formData.append(property, value, value.name);
			} else if (value instanceof Blob) {
				formData.append(property, value);
			} else {
				formData.append(property, String(value));
			}
		}
	}

	return formData;
}

module.exports = {

	write: function (object) {
		if (typeof FormData === 'undefined') {
			throw new Error('The multipart/form-data mime serializer requires FormData support');
		}

		// Support FormData directly.
		if (object instanceof FormData) {
			return object;
		}

		// Support <form> elements.
		if (isFormElement(object)) {
			return new FormData(object);
		}

		// Support plain objects, may contain File/Blob as value.
		if (typeof object === 'object' && object !== null) {
			return createFormDataFromObject(object);
		}

		throw new Error('Unable to create FormData from object ' + object);
	}

};

},{}],17:[function(require,module,exports){
/*
 * Copyright 2012-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

module.exports = {

	read: function (str) {
		return str;
	},

	write: function (obj) {
		return obj.toString();
	}

};

},{}],18:[function(require,module,exports){
/*
 * Copyright 2015-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

/**
 * Attempt to invoke a function capturing the resulting value as a Promise
 *
 * If the method throws, the caught value used to reject the Promise.
 *
 * @param {function} work function to invoke
 * @returns {Promise} Promise for the output of the work function
 */
function attempt(work) {
	try {
		return Promise.resolve(work());
	}
	catch (e) {
		return Promise.reject(e);
	}
}

module.exports = attempt;

},{}],19:[function(require,module,exports){
/*
 * Copyright 2013-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

module.exports = {

	/**
	 * Find objects within a graph the contain a property of a certain name.
	 *
	 * NOTE: this method will not discover object graph cycles.
	 *
	 * @param {*} obj object to search on
	 * @param {string} prop name of the property to search for
	 * @param {Function} callback function to receive the found properties and their parent
	 */
	findProperties: function findProperties(obj, prop, callback) {
		if (typeof obj !== 'object' || obj === null) { return; }
		if (prop in obj) {
			callback(obj[prop], obj, prop);
		}
		Object.keys(obj).forEach(function (key) {
			findProperties(obj[key], prop, callback);
		});
	}

};

},{}],20:[function(require,module,exports){
/*
 * Copyright 2013-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

var attempt = require('./attempt');

/**
 * Create a promise whose work is started only when a handler is registered.
 *
 * The work function will be invoked at most once. Thrown values will result
 * in promise rejection.
 *
 * @param {Function} work function whose ouput is used to resolve the
 *   returned promise.
 * @returns {Promise} a lazy promise
 */
function lazyPromise(work) {
	var started, resolver, promise, then;

	started = false;

	promise = new Promise(function (resolve, reject) {
		resolver = {
			resolve: resolve,
			reject: reject
		};
	});
	then = promise.then;

	promise.then = function () {
		if (!started) {
			started = true;
			attempt(work).then(resolver.resolve, resolver.reject);
		}
		return then.apply(promise, arguments);
	};

	return promise;
}

module.exports = lazyPromise;

},{"./attempt":18}],21:[function(require,module,exports){
/*
 * Copyright 2012-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

var empty = {};

/**
 * Mix the properties from the source object into the destination object.
 * When the same property occurs in more then one object, the right most
 * value wins.
 *
 * @param {Object} dest the object to copy properties to
 * @param {Object} sources the objects to copy properties from.  May be 1 to N arguments, but not an Array.
 * @return {Object} the destination object
 */
function mixin(dest /*, sources... */) {
	var i, l, source, name;

	if (!dest) { dest = {}; }
	for (i = 1, l = arguments.length; i < l; i += 1) {
		source = arguments[i];
		for (name in source) {
			if (!(name in dest) || (dest[name] !== source[name] && (!(name in empty) || empty[name] !== source[name]))) {
				dest[name] = source[name];
			}
		}
	}

	return dest; // Object
}

module.exports = mixin;

},{}],22:[function(require,module,exports){
/*
 * Copyright 2012-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

/**
 * Normalize HTTP header names using the pseudo camel case.
 *
 * For example:
 *   content-type         -> Content-Type
 *   accepts              -> Accepts
 *   x-custom-header-name -> X-Custom-Header-Name
 *
 * @param {string} name the raw header name
 * @return {string} the normalized header name
 */
function normalizeHeaderName(name) {
	return name.toLowerCase()
		.split('-')
		.map(function (chunk) { return chunk.charAt(0).toUpperCase() + chunk.slice(1); })
		.join('-');
}

module.exports = normalizeHeaderName;

},{}],23:[function(require,module,exports){
/*
 * Copyright 2014-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

/*jshint latedef: nofunc */

var normalizeHeaderName = require('./normalizeHeaderName');

function property(promise, name) {
	return promise.then(
		function (value) {
			return value && value[name];
		},
		function (value) {
			return Promise.reject(value && value[name]);
		}
	);
}

/**
 * Obtain the response entity
 *
 * @returns {Promise} for the response entity
 */
function entity() {
	/*jshint validthis:true */
	return property(this, 'entity');
}

/**
 * Obtain the response status
 *
 * @returns {Promise} for the response status
 */
function status() {
	/*jshint validthis:true */
	return property(property(this, 'status'), 'code');
}

/**
 * Obtain the response headers map
 *
 * @returns {Promise} for the response headers map
 */
function headers() {
	/*jshint validthis:true */
	return property(this, 'headers');
}

/**
 * Obtain a specific response header
 *
 * @param {String} headerName the header to retrieve
 * @returns {Promise} for the response header's value
 */
function header(headerName) {
	/*jshint validthis:true */
	headerName = normalizeHeaderName(headerName);
	return property(this.headers(), headerName);
}

/**
 * Follow a related resource
 *
 * The relationship to follow may be define as a plain string, an object
 * with the rel and params, or an array containing one or more entries
 * with the previous forms.
 *
 * Examples:
 *   response.follow('next')
 *
 *   response.follow({ rel: 'next', params: { pageSize: 100 } })
 *
 *   response.follow([
 *       { rel: 'items', params: { projection: 'noImages' } },
 *       'search',
 *       { rel: 'findByGalleryIsNull', params: { projection: 'noImages' } },
 *       'items'
 *   ])
 *
 * @param {String|Object|Array} rels one, or more, relationships to follow
 * @returns ResponsePromise<Response> related resource
 */
function follow(rels) {
	/*jshint validthis:true */
	rels = [].concat(rels);

	return make(rels.reduce(function (response, rel) {
		return response.then(function (response) {
			if (typeof rel === 'string') {
				rel = { rel: rel };
			}
			if (typeof response.entity.clientFor !== 'function') {
				throw new Error('Hypermedia response expected');
			}
			var client = response.entity.clientFor(rel.rel);
			return client({ params: rel.params });
		});
	}, this));
}

/**
 * Wrap a Promise as an ResponsePromise
 *
 * @param {Promise<Response>} promise the promise for an HTTP Response
 * @returns {ResponsePromise<Response>} wrapped promise for Response with additional helper methods
 */
function make(promise) {
	promise.status = status;
	promise.headers = headers;
	promise.header = header;
	promise.entity = entity;
	promise.follow = follow;
	return promise;
}

function responsePromise(obj, callback, errback) {
	return make(Promise.resolve(obj).then(callback, errback));
}

responsePromise.make = make;
responsePromise.reject = function (val) {
	return make(Promise.reject(val));
};
responsePromise.promise = function (func) {
	return make(new Promise(func));
};

module.exports = responsePromise;

},{"./normalizeHeaderName":22}],24:[function(require,module,exports){
/*
 * Copyright 2015-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

var charMap;

charMap = (function () {
	var strings = {
		alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
		digit: '0123456789'
	};

	strings.genDelims = ':/?#[]@';
	strings.subDelims = '!$&\'()*+,;=';
	strings.reserved = strings.genDelims + strings.subDelims;
	strings.unreserved = strings.alpha + strings.digit + '-._~';
	strings.url = strings.reserved + strings.unreserved;
	strings.scheme = strings.alpha + strings.digit + '+-.';
	strings.userinfo = strings.unreserved + strings.subDelims + ':';
	strings.host = strings.unreserved + strings.subDelims;
	strings.port = strings.digit;
	strings.pchar = strings.unreserved + strings.subDelims + ':@';
	strings.segment = strings.pchar;
	strings.path = strings.segment + '/';
	strings.query = strings.pchar + '/?';
	strings.fragment = strings.pchar + '/?';

	return Object.keys(strings).reduce(function (charMap, set) {
		charMap[set] = strings[set].split('').reduce(function (chars, myChar) {
			chars[myChar] = true;
			return chars;
		}, {});
		return charMap;
	}, {});
}());

function encode(str, allowed) {
	if (typeof str !== 'string') {
		throw new Error('String required for URL encoding');
	}
	return str.split('').map(function (myChar) {
		if (allowed.hasOwnProperty(myChar)) {
			return myChar;
		}
		var code = myChar.charCodeAt(0);
		if (code <= 127) {
			var encoded = code.toString(16).toUpperCase();
 			return '%' + (encoded.length % 2 === 1 ? '0' : '') + encoded;
		}
		else {
			return encodeURIComponent(myChar).toUpperCase();
		}
	}).join('');
}

function makeEncoder(allowed) {
	allowed = allowed || charMap.unreserved;
	return function (str) {
		return encode(str, allowed);
	};
}

function decode(str) {
	return decodeURIComponent(str);
}

module.exports = {

	/*
	 * Decode URL encoded strings
	 *
	 * @param {string} URL encoded string
	 * @returns {string} URL decoded string
	 */
	decode: decode,

	/*
	 * URL encode a string
	 *
	 * All but alpha-numerics and a very limited set of punctuation - . _ ~ are
	 * encoded.
	 *
	 * @param {string} string to encode
	 * @returns {string} URL encoded string
	 */
	encode: makeEncoder(),

	/*
	* URL encode a URL
	*
	* All character permitted anywhere in a URL are left unencoded even
	* if that character is not permitted in that portion of a URL.
	*
	* Note: This method is typically not what you want.
	*
	* @param {string} string to encode
	* @returns {string} URL encoded string
	*/
	encodeURL: makeEncoder(charMap.url),

	/*
	 * URL encode the scheme portion of a URL
	 *
	 * @param {string} string to encode
	 * @returns {string} URL encoded string
	 */
	encodeScheme: makeEncoder(charMap.scheme),

	/*
	 * URL encode the user info portion of a URL
	 *
	 * @param {string} string to encode
	 * @returns {string} URL encoded string
	 */
	encodeUserInfo: makeEncoder(charMap.userinfo),

	/*
	 * URL encode the host portion of a URL
	 *
	 * @param {string} string to encode
	 * @returns {string} URL encoded string
	 */
	encodeHost: makeEncoder(charMap.host),

	/*
	 * URL encode the port portion of a URL
	 *
	 * @param {string} string to encode
	 * @returns {string} URL encoded string
	 */
	encodePort: makeEncoder(charMap.port),

	/*
	 * URL encode a path segment portion of a URL
	 *
	 * @param {string} string to encode
	 * @returns {string} URL encoded string
	 */
	encodePathSegment: makeEncoder(charMap.segment),

	/*
	 * URL encode the path portion of a URL
	 *
	 * @param {string} string to encode
	 * @returns {string} URL encoded string
	 */
	encodePath: makeEncoder(charMap.path),

	/*
	 * URL encode the query portion of a URL
	 *
	 * @param {string} string to encode
	 * @returns {string} URL encoded string
	 */
	encodeQuery: makeEncoder(charMap.query),

	/*
	 * URL encode the fragment portion of a URL
	 *
	 * @param {string} string to encode
	 * @returns {string} URL encoded string
	 */
	encodeFragment: makeEncoder(charMap.fragment)

};

},{}],25:[function(require,module,exports){
/*
 * Copyright 2015-2016 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

'use strict';

var uriEncoder, operations, prefixRE;

uriEncoder = require('./uriEncoder');

prefixRE = /^([^:]*):([0-9]+)$/;
operations = {
	'':  { first: '',  separator: ',', named: false, empty: '',  encoder: uriEncoder.encode },
	'+': { first: '',  separator: ',', named: false, empty: '',  encoder: uriEncoder.encodeURL },
	'#': { first: '#', separator: ',', named: false, empty: '',  encoder: uriEncoder.encodeURL },
	'.': { first: '.', separator: '.', named: false, empty: '',  encoder: uriEncoder.encode },
	'/': { first: '/', separator: '/', named: false, empty: '',  encoder: uriEncoder.encode },
	';': { first: ';', separator: ';', named: true,  empty: '',  encoder: uriEncoder.encode },
	'?': { first: '?', separator: '&', named: true,  empty: '=', encoder: uriEncoder.encode },
	'&': { first: '&', separator: '&', named: true,  empty: '=', encoder: uriEncoder.encode },
	'=': { reserved: true },
	',': { reserved: true },
	'!': { reserved: true },
	'@': { reserved: true },
	'|': { reserved: true }
};

function apply(operation, expression, params) {
	/*jshint maxcomplexity:11 */
	return expression.split(',').reduce(function (result, variable) {
		var opts, value;

		opts = {};
		if (variable.slice(-1) === '*') {
			variable = variable.slice(0, -1);
			opts.explode = true;
		}
		if (prefixRE.test(variable)) {
			var prefix = prefixRE.exec(variable);
			variable = prefix[1];
			opts.maxLength = parseInt(prefix[2]);
		}

		variable = uriEncoder.decode(variable);
		value = params[variable];

		if (value === void 0 || value === null) {
			return result;
		}
		if (Array.isArray(value)) {
			result = value.reduce(function (result, value) {
				if (result.length) {
					result += opts.explode ? operation.separator : ',';
					if (operation.named && opts.explode) {
						result += operation.encoder(variable);
						result += value.length ? '=' : operation.empty;
					}
				}
				else {
					result += operation.first;
					if (operation.named) {
						result += operation.encoder(variable);
						result += value.length ? '=' : operation.empty;
					}
				}
				result += operation.encoder(value);
				return result;
			}, result);
		}
		else if (typeof value === 'object') {
			result = Object.keys(value).reduce(function (result, name) {
				if (result.length) {
					result += opts.explode ? operation.separator : ',';
				}
				else {
					result += operation.first;
					if (operation.named && !opts.explode) {
						result += operation.encoder(variable);
						result += value[name].length ? '=' : operation.empty;
					}
				}
				result += operation.encoder(name);
				result += opts.explode ? '=' : ',';
				result += operation.encoder(value[name]);
				return result;
			}, result);
		}
		else {
			value = String(value);
			if (opts.maxLength) {
				value = value.slice(0, opts.maxLength);
			}
			result += result.length ? operation.separator : operation.first;
			if (operation.named) {
				result += operation.encoder(variable);
				result += value.length ? '=' : operation.empty;
			}
			result += operation.encoder(value);
		}

		return result;
	}, '');
}

function expandExpression(expression, params) {
	var operation;

	operation = operations[expression.slice(0,1)];
	if (operation) {
		expression = expression.slice(1);
	}
	else {
		operation = operations[''];
	}

	if (operation.reserved) {
		throw new Error('Reserved expression operations are not supported');
	}

	return apply(operation, expression, params);
}

function expandTemplate(template, params) {
	var start, end, uri;

	uri = '';
	end = 0;
	while (true) {
		start = template.indexOf('{', end);
		if (start === -1) {
			// no more expressions
			uri += template.slice(end);
			break;
		}
		uri += template.slice(end, start);
		end = template.indexOf('}', start) + 1;
		uri += expandExpression(template.slice(start + 1, end - 1), params);
	}

	return uri;
}

module.exports = {

	/**
	 * Expand a URI Template with parameters to form a URI.
	 *
	 * Full implementation (level 4) of rfc6570.
	 * @see https://tools.ietf.org/html/rfc6570
	 *
	 * @param {string} template URI template
	 * @param {Object} [params] params to apply to the template durring expantion
	 * @returns {string} expanded URI
	 */
	expand: expandTemplate

};

},{"./uriEncoder":24}]},{},[1]);
