var dbName = "ballroad_test", remoteURL = "http://121.40.197.226:4984/"+dbName;
var db = new PouchDB(dbName);

var date = new Date();
var prefix = "" + date.getTime();

var playerOption = "";
var moveList = [];
var existingClipList = [];


/** Default Document Ready Event **/
$(function()
{
    disableButton();
    // Make form do what we want
    $('#url-form').submit(getImagesFromUrl);

    dbSetup();
    //deleteDB();
    //syncFromRemote();      
    //syncToRemote();
    //deleteDoc("clip100");
});

function disableButton() {
    setButtonDisable("search", true);
}

function enableButton() {    
    setButtonDisable("search", false); 
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
        var list = result.docs
        for(i in list) {
            playerOption += '<option value="'+list[i]._id+'">'+list[i].name_en+'</option>';
        }
        getMoveList();        
    }); 
}

function getMoveList() {
    return db.find({
        selector: {type: 'move'}
    }).then(function(result){
        moveList = result.docs;        
        enableButton();                
    });
}

function getPlayList() {
    return db.find({
        selector: {type: 'player'},
        sort: ['_id']
    });
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

function generateClip(index, image, player, move, name, desc) {
    return {
        "_id": "clip_" + prefix + "_" + index,
        "desc": desc,
        "image": image,
        "name": name,        
        "type": "clip",
        "local": "local_" + prefix + "_" + index
    };
}

function saveDoc(index) {    

    var move = getSeletValue("move"+index); 
    var player = getValue("player"+index);
    var image = getValue("gif"+index);

    var name = getValue("name"+index);
    var desc = getValue("desc"+index);

    if(name == "" || desc == "" || move == "" || player == "" || image == "") {
        alert("请填写完整信息");
        return;
    }

    var clip = generateClip(index, image, player, move, name, desc);

    db.put(clip).then(function(){
        console.log("clip created");
        db.get(move).then(function(result){
            var cp = result.clip_player;
            cp[clip._id] = player;
            db.put(result).then(function(){
                console.log("move updated");

                saveSucess(index);

            }).catch(function() {
                console.log("move update err");
            });
        }).catch(function() {
            console.log("get move err");
        });

    }).catch(function(err) {
        console.log("clip create err");
    });
}

function deleteDB() {      
    db.destroy().then(function (response) {
        console.log(response);
    }).catch(function (err) {
        console.log(err);
    });
}

function saveSucess(index) {    

    syncToRemote().on('complete', function () {
        console.log("sync to completed");
        $("#clip"+index)
        .parents(".clip")
        .animate({opacity: 0})
        .toggle();
        alert("保存成功！");
    }).on('error', function (err) {
        console.log(err);
    });
}

function getValue(id) {
    return $("#"+id).val();
}

function getSeletValue(id) {
    return $('input[name='+id+']:checked').val();
}

function getImagesFromUrlDone(data)
 {
    $('.row').empty();

    if(data && data.images) {

        for(var i in data.images)
        {
            if (!data.images[i].src.match(/gif$/)) continue;


            var col = '<div class="clip col-sm-6 col-md-3"><div class="thumbnail" id="clip'+i+'"></div></div>';                
            $(".row").append(col);       
            
            var img = $('<img>')
                .attr("data-gifffer", data.images[i].src)                
                .attr("id", 'img'+i)
                .appendTo("#clip"+i)
                .parents(".clip")                
                .css({opacity: 0, display: 'none'});                
                    

            var caption = '<div class="caption"><form id="form'+i+'"></form></div>';

            $("#clip"+i).append(caption);        
                       
            var player = '<div class="form-group"><label for="player'+i+'">球员</label>' +    
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

            var save = '<button id="save'+i+'" onclick="saveDoc('+i+'); return false;">保存</button>';

            form.append(save);
            
            //if(i==10) break;
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