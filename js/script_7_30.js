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

    // $("#search-images").click(function(){
    //     searchImages();
    // });
    // setHeader();
});

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

function cleanNews() {
    localStorage["clips"] = [];
    $('.row').empty();
    updateNewsButton();
}

function endsWith(string, suffix) {
    return string.indexOf(suffix, string.length - suffix.length) !== -1
}

function cancelClip(index) {
    $("#clip"+index)
    .parents(".clip")
    .animate({opacity: 0})
    .toggle();   
}

function saveClip(index) {

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

function generatePost(player, move, list) {

    var id = getPostID(player, move);

    return {
        "_id": id,        
        "image": list,        
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
            doc = generatePost(player, move, [image]);
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
            sCallback(image);
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

function selectClip(index) {
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

function xlshowPost() {
	
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

function saveNews() {

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
            
            //if(i==3) break;
        }
    }

    Gifffer(display);
}

function clipOption(i) {
    // alert("");
    setClipOption(i);
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

function xlSyncToProd() {
    setButtonDisable("syncToProd", true);
    db.replicate.to(remoteURLProd).on('complete', function () {
        console.log("sync to PROD completed");
        alert("同步成功！");
        setButtonDisable("syncToProd", false);
    }).on('error', function (err) {            
        alert("同步失败: " + err);
        setButtonDisable("syncToProd", false);
    });
}

/**
 * Sends request for images.
 */
function getImagesFromUrl()
 {
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