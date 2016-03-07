var dbName = "cliplay_uat", remoteURL = "http://121.40.197.226:4984/"+dbName;
//var dbName = "cliplay_test", remoteURL = "http://admin:12341234@localhost:5984/"+dbName;
var db = new PouchDB(dbName);

var playerOption = "";
var moveList = [];
var existingClipList = [];
var playerList = [];
var searchResult = [];
var selectedClip = "";
var playerUI = {};
var action = "";


/** Default Document Ready Event **/
$(function()
{
    disableButton();
    // Make form do what we want
    $('#url-form').submit(getImagesFromUrl);

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
    setButtonDisable("updateClip", true);
}

function enableButton() {    
    setButtonDisable("search", false); 
    setButtonDisable("addPlayer", false);
    setButtonDisable("addClip", false);
    setButtonDisable("updateClip", false);
}

function setButtonDisable(id, flag) {
    $('#'+id).prop('disabled', flag);   
}

function dbSetup() {

    syncFromRemote().on('complete', function () {
        console.log("sync completed");
        db.createIndex({
            index: {
                //fields: ['image', 'local']
                fields: ['image']
            }
        }).then(function (result) {        
            db.createIndex({
                index: {
                    // fields: ['name', 'local']
                    fields: ['name']
                }
            }).then(function(){
                console.log("index created");
                renderList();    
            });    
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

    db.remove(clip).then(function() {
        return syncToRemote();
    }).then(function() {
        alert("删除成功");
        resetUpdateForm();
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
        // console.log("move changed");
        recreate = true;
    }

    if(player != clip.player) {
        // console.log("player changed");   
        recreate = true;
    }

    if(recreate) {
        db.remove(clip).then(function() {
            putClip(name, desc, move, player, image, function(){            
                alert("更新成功！");
                resetUpdateForm();
            }, function() {        
                alert("更新失败！");
            });
        }).catch(function(){
            alert("更新失败！");
        });            
    }else {
        clip.image = image;
        clip.name = name;
        clip.desc = desc;

        db.put(clip)
        .then(syncToRemote)
        .then(function() {
            alert("更新成功！");
            resetUpdateForm();
        }).catch(function() {
            alert("更新失败！");
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