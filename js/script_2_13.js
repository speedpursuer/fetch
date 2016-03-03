//var dbName = "cliplay", remoteURL = "http://121.40.197.226:4984/"+dbName;
var dbName = "cliplay_test", remoteURL = "http://admin:12341234@localhost:5984/"+dbName;
var db = new PouchDB(dbName);

var playerOption = "";
var moveList = [];
var existingClipList = [];
var playerList = [];


/** Default Document Ready Event **/
$(function()
{
    disableButton();
    // Make form do what we want
    $('#url-form').submit(getImagesFromUrl);

    dbSetup();

    //findAndRemoveInstall();
    //syncToRemote();
    //$("#playerForm").validate();
    //deleteDB();
    //syncFromRemote();      
    //syncToRemote();
    //deleteDoc("clip100");
});

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
}

function enableButton() {    
    setButtonDisable("search", false); 
    setButtonDisable("addPlayer", false);
    setButtonDisable("addClip", false);
}

function setButtonDisable(id, flag) {
    $('#'+id).prop('disabled', flag);   
}

function dbSetup() {

    syncFromRemote().on('complete', function () {
        console.log("sync completed");
        db.createIndex({
            index: {
                fields: ['type', 'image']
            }
        }).then(function (result) {
            console.log("index created");            
            renderList();
        }).catch(function (err) {
            console.log("index err");
        });
    }).on('error', function (err) {
        console.log(err);
    });
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

function renderPlayerList(){
    //var option = "";

    playerOption = "";

    for(i in playerList) {
        playerOption += '<option value="'+playerList[i]._id+'">'+playerList[i].name_en+'</option>';
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
        selector: {type: 'clip', image: image}
    });
}

function getPlayList() {
    return db.allDocs({
        include_docs: true,
        startkey: "player",
        endkey: "player\uffff"            
    })
}

function renderMoveList(index) {

    var radioButton = "";

    for(i in moveList) {
        if( i == 0){
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
                   currentdate.getFullYear() + 
                   (currentdate.getMonth() + 1) + 
                   currentdate.getDate() + 
                   currentdate.getHours() +
                   currentdate.getMinutes() + 
                   currentdate.getSeconds();
    return datetime;
}

function generateClip(image, player, move, name, desc) {

    var prefix = player + "_" + move + "_" + getDateID();

    return {
        "_id": "clip_" + prefix,
        "desc": desc,
        "image": image,
        "name": name,        
        //"type": "clip",
        "local": "local_" + prefix,
        "move": move,
        "player": player
    };
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

    setButtonDisable("save-clip", true);

    var move = getSeletValue("move_clip"); 
    var player = getValue("player_name");
    var image = getValue("image_url");

    var name = getValue("clip_title");
    var desc = getValue("clip_desc");

    putClip(name, desc, move, player, image, function(){
        setButtonDisable("save-clip", false);
        cleanClipForm();                 
        alert("保存成功！");
    }, function() {        
        setButtonDisable("save-clip", false);
    });
}

function saveClip(index) {

    setButtonDisable("save"+index, true);

    var move = getSeletValue("move"+index); 
    var player = getValue("player"+index);
    var image = getValue("gif"+index);

    var name = getValue("name"+index);
    var desc = getValue("desc"+index);

    putClip(name, desc, move, player, image, function(){
        saveSucess(index);
        setButtonDisable("save"+index, false);
    }, function() {        
        setButtonDisable("save"+index, false);
    });
}

function putClip(name, desc, move, player, image, sCallback, fCallback) {
    
    if(name == "" || desc == "" || move == "" || player == "" || image == "") {
        alert("请填写完整信息");
        return;
    }

    var clip = generateClip(image, player, move, name, desc);

    getClipByImage(clip.image).then(function(result) {
        //console.log(result.docs.length);
        if( result.docs.length > 0 ) {
            alert("此短片链接已存在，不能再次保存");
            fCallback();
            return;
        }
        db.put(clip).then(function(){
            console.log("clip created");
            db.get(player).then(function(doc) {
                doc.clip_total += 1;
                if(doc.clip_moves[move]) {
                    doc.clip_moves[move] += 1;
                }else{
                    doc.clip_moves[move] = 1;
                }
                db.put(doc).then(function() {
                    console.log("player updated");
                    syncToRemote().on('complete', function () {
                        console.log("sync to completed");
                        sCallback();
                    }).on('error', function (err) {
                        fCallback();
                        alert("保存失败: " + err);
                    });
                }).catch(function(e) {
                    fCallback();
                    alert("保存失败: player update err");                    
                });
            }).catch(function() {
                fCallback();
                alert("保存失败: get player err");                    
            });

        }).catch(function(err) {
            fCallback();
            alert("保存失败: clip create err");                    
        });
    }).catch(function(err) {
        fCallback();
        alert("保存失败: " + err);                    
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
        syncToRemote().on('complete', function () {
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
    $("#clip_title").val("");
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

function saveSucess_(index) {    

    syncToRemote().on('complete', function () {
        console.log("sync to completed");
        $("#clip"+index)
        .parents(".clip")
        .animate({opacity: 0})
        .toggle();
        alert("保存成功！");
    }).on('error', function (err) {
        alert("同步失败");
        console.log(err);
    });
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
}

function getImagesFromUrlDone(data)
{
    $('.row').empty();

    if(data && data.images) {

        for(var i in data.images)
        {
            if (!data.images[i].src.match(/gif$/)) continue;


            var col = '<div class="clip col-sm-12 col-md-6"><div class="thumbnail" id="clip'+i+'"></div></div>';                
            $(".row").append(col);       
            
            var img = $('<img>')
                .attr("data-gifffer", data.images[i].src)                
                .attr("id", 'img'+i)
                .appendTo("#clip"+i)
                .parents(".clip")                
                .css({opacity: 0, display: 'none'});                
                    

            var caption = '<div class="caption"><form id="form'+i+'"></form></div>';

            $("#clip"+i).append(caption);        
                       
            var player = '<div class="form-group form-group-player" data-id="'+i+'" id="form-group-player'+i+'"><label for="player'+i+'">球员</label>' +    
                            '<select class="form-control" id="player'+i+'" data-theme="bootstrap">' +                                   
                                playerOption +   
                            '</select>' +
                         '</div>';

            var form = $("#form"+i);                 
            
            var image = '<input style="display:none" value="'+data.images[i].src+'" id="gif'+i+'">';   

            form.append(player);
            form.append(image);
            $("#player"+i).comboSelect();

            var name = '<div class="form-group">' +
                            '<input type="text" class="form-control" placeholder="名称" id="name'+i+'">' +
                       '</div>';

            form.append(name);

            var desc = '<div class="form-group">' +
                            '<input type="text" class="form-control" placeholder="描述" id="desc'+i+'">' +
                       '</div>';

            form.append(desc);


            var moveRadio = renderMoveList(i);

            var move = '<div class="form-group">' +
                          '<label for="move'+i+'">动作</label>' +
                          '<div id="move'+i+'">' +
                              moveRadio +
                          '</div>' +
                       '</div>';


            form.append(move);
            $("#move"+i).buttonset();

            var select = '<div class="form-group">' +
                            '<div class="checkbox">' +
                                '<label>' +
                                    '<input type="checkbox">不选择此短片'+
                                '</label>' +
                            '</div>' +
                         '</div>';

            var save = '<button id="save'+i+'" onclick="saveClip('+i+'); return false;">保存</button>';

            form.append(save);
            
            //if(i==3) break;
        }
    }

    Gifffer(display);
}

function display(image) {

   if(image.width > 100 && image.height > 100) {
        $("#"+$(image).attr("id"))
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

/**
 * Sends request for images.
 */
 function getImagesFromUrl()
 {
    $( "#dialog" ).dialog("open");
    // Make object out of form data
    var data = $(this).serializeObject();
    
    // Create request
    $.post($(this).attr('action'), data, getImagesFromUrlDone);

    // Return false so the form doesn't actually submit
    return false;
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


// function imageLoaded_test()
//  {
//     var image = $(this);

//     // Remove tiny images
//     if(image.width() < 2 || image.height() < 2 || !image.context.currentSrc.match(/gif$/))
//     {
//             image.parents(".col-sm-6").toggle();
//             return;
//     }
    
//     // Fade in
//     // image
//     // //.parents(".col-sm-6")
//     // .css({display: 'inline-block'})
//     // .animate({opacity: 1});
//     Gifffer();
// }
// /**
//  * Creates hidden image tags for the found image urls.
//  */
//  function getImagesFromUrlDone(data)
//  {
//         $('#output')
//         .empty();

//         if(data && data.images)
//                 for(var n in data.images)
//                 {
//                         var div = $('<div id="div_'+n+'">').appendTo("#output");
//                         var image = $('<img>')
//                         .prop(data.images[n])
//                         .css({opacity: 0, display: 'none'})
//                         .appendTo('#div_'+n)
//                         .load(imageLoaded);
//                         if(n==5) return;
//                 }
//         }


// /**
//  * Set proper size and fade in after load.
//  */
//  function imageLoaded()
//  {
//         var image = $(this);

//         // Remove tiny images
//         if(image.width() < 2 || image.height() < 2)
//         {
//                 image.remove();
//                 return;
//         }

//         if (!image.context.currentSrc.match(/gif$/)) 
//         {
//                 image.remove();
//                 return;       
//         }

//         // Find scale
//         var scale = Math.min(config.maxWidth/image.width(), config.maxHeight/image.height());

//         // Set new width and height
//         image.attr({
//                 width: Math.ceil(scale*image.width()),
//                 height: Math.ceil(scale*image.height()),
//         })

//         // Fade in
//         image
//         .css({display: 'inline-block'})
//         .animate({opacity: 1});
// }


// /**
//  * Serializes a form into an object.
//  */
//  $.fn.serializeObject = function()
//  {
//         var o = {};
//         var a = this.serializeArray();
//         $.each(a, function() {
//                 if (o[this.name]) {
//                         if (!o[this.name].push) {
//                                 o[this.name] = [o[this.name]];
//                         }
//                         o[this.name].push(this.value || '');
//                 } else {
//                         o[this.name] = this.value || '';
//                 }
//         });
//         return o;
// };


// function renderPage() {
//         var l = 5;
                
//         for(var i = 1; i <= l; i++) {

//                 var col = '<div class="col-sm-6 col-md-3"><div class="thumbnail" id="clip'+i+'"></div></div>';                
//                 $(".row").append(col);        
                
//                 //var img = '<img src="http://i2.hoopchina.com.cn/blogfile/201203/10/13313809635454.gif" id="img'+i+'">';                          

//                 var img = $('<img>').prop(data.images[i])
//                         .appendTo("#clip"+i)
//                         .load(imageLoaded_test)
//                         .parents(".col-sm-6")
//                         .css({opacity: 0, display: 'none'});
                        

//                 var caption = '<div class="caption"><form id="form'+i+'"></form></div>';

//                 $("#clip"+i).append(caption);        
                
//                 var player = '<div class="form-group"><label for="player'+i+'">球员</label>' +                                       
//                                 '<select class="form-control" id="player'+i+'" data-theme="bootstrap">' +
//                                         '<option value="1">Michael Jordan</option>' +
//                                         '<option value="2">Kobe Bryant</option>' +
//                                         '<option value="3">Lebron James</option>' +
//                                         '<option value="4">Allen Iverson</option>' +
//                                         '<option value="5">Steve Curry</option>' +
//                                 '</select>' +
//                              '</div>';
//                 $("#form"+i).append(player);
//                 $("#player"+i).comboSelect();

//                 var move = '<div class="form-group">' +
//                               '<label for="move'+i+'">动作</label>' +
//                               '<div id="move'+i+'">' +
//                                   '<input type="radio" id="radio11" name="move'+i+'" checked="checked" value="0">' +
//                                   '<label for="radio11">急停跳投</label>' +
//                                   '<input type="radio" id="radio12" name="move'+i+'" value="1">' +
//                                   '<label for="radio12">转身过人</label>' +
//                                   '<input type="radio" id="radio13" name="move'+i+'" value="2">' +
//                                   '<label for="radio13">飞身扣篮</label>' +
//                               '</div>' +
//                            '</div>';
//                 $("#form"+i).append(move);
//                 $("#move"+i).buttonset();
//         }
// }