<!DOCTYPE html>
<html lang="en">
<head>
        <meta charset="utf-8">
        <title>Clip Fetcher</title>   
        <link rel="stylesheet" href="css/bootstrap/css/bootstrap.min.css">
	    <link rel="stylesheet" href="css/jquery-ui.css">
    	<link rel="stylesheet" href="css/combo.select.css">
    	<link rel="stylesheet" href="css/style_7_22.css">

    	<script src="js/jquery-2.1.3.min.js"></script>
      <!-- <script type="text/javascript" src="js/jquery.ajax-cross-origin.min.js"></script> -->
	    <script src="js/jquery-ui.js"></script>
    	<script src="js/pouchdb.js"></script>
	    <script src="js/pouchdb.find.js"></script>        
      <!-- <script src="js/pouchdb.quick-search.min.js"></script>   -->            
	    <script src="js/jquery.combo.select_3_5.js"></script>
    	<script src="js/gifffer.js"></script>
      <script src="js/progressbar.js"></script>
      <script src="js/modal.js"></script>
      <script src="js/sha1.js"></script>
	    <script src="js/script_7_30.js"></script>     
</head>
<body>
	<div class="container-fluid">
        <h1>Clip Fetcher</h1>
        <form action="scan.php" method="post" id="url-form" class="form-inline">
            <div class="form-group">
                <input type="url" name="url" id="fetch-url" placeholder="http://" required="" class="form-control">
            </div>            
            <div class="form-group">
                <input type="submit" class="btn btn-primary .btn-xs form-control" value="Get GIF Images" id="searchGIF">                                    
            </div>
            <div class="form-group">
                <input type="submit" class="btn btn-primary .btn-xs form-control" value="Get All Images" id="search">                                    
            </div>
            <div class="form-group">     
                <input type="submit" class="btn btn-primary .btn-xs form-control" value="Get Weibo" id="searchWeibo">
            </div>  
            <div class="form-group">     
                <button type="button" class="btn btn-primary .btn-xs form-control" data-toggle="modal" data-target="#clipModal" id="addClip">
                    Add Clip
                </button>    
            </div>  
             <div class="form-group">
                <button type="button" class="btn btn-primary .btn-xs form-control" data-toggle="modal" data-target="#pushModal" id="send">
                    Send Push
                </button>      
            </div>     
            <div class="form-group">
                <button type="button" class="btn btn-primary .btn-xs form-control" data-toggle="modal" data-target="#playerModal" id="addPlayer">
                    Add Player
                </button>      
            </div>                   
            <!-- <div class="form-group">     
                <button type="button" class="btn btn-primary .btn-xs form-control" data-toggle="modal" data-target="#playsModal" id="addPlays">
                    Add Play
                </button>    
            </div>    -->
            <div class="form-group">     
                <button type="button" class="btn btn-primary .btn-xs form-control" id="addNews" onclick="createNews()">
                    Add News
                </button>    
            </div>   
            <div class="form-group">     
                <button type="button" class="btn btn-primary .btn-xs form-control" id="showPost" onclick="xlshowPost()">
                    Generate Post
                </button>    
            </div>   
            <div class="form-group">     
                <button type="button" class="btn btn-primary .btn-xs form-control" id="syncToProd" onclick='xlSyncToProd()'>
                     Sync To PRO
               </button>    
            </div> 
            <!-- <div class="form-group">
                <button type="button" class="btn btn-primary .btn-xs form-control" data-toggle="modal" data-target="#clipUpdateModal" id="updateClip">
                    Update Clip
                </button>    
            </div> 
            <div class="form-group">     
                <button type="button" class="btn btn-primary .btn-xs form-control"onclick="addSortableItem()">
                   Test
                </button>    
            </div>        -->      
        </form>
    </div>
    <div class="container-fluid">
        <div id="output">           
          <div class="row">            
          </div>       
        </div>
    </div>
    <div class="modal fade" id="playerModal">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>

                    <h4 class="modal-title">Add Player</h4>
                </div>
                <div class="modal-body">
                    <form class="form-horizontal" id="playerForm">
                      <div class="form-group">
                        <label for="name" class="col-sm-2 control-label">Name zh</label>
                        <div class="col-sm-10">
                          <input class="form-control" id="name" required>
                        </div>
                      </div>
                      <div class="form-group">
                        <label for="name_en" class="col-sm-2 control-label">Name en</label>
                        <div class="col-sm-10">
                          <input class="form-control" id="name_en" required>
                        </div>
                      </div>
                      <div class="form-group">
                        <label for="desc" class="col-sm-2 control-label">Desc</label>
                        <div class="col-sm-10">
                          <input class="form-control" id="desc" required>
                        </div>
                      </div>
                      <div class="form-group">
                        <label for="avatar" class="col-sm-2 control-label">Avatar</label>
                        <div class="col-sm-10">
                          <input type="url" class="form-control" id="avatar" placeholder="http://" required>
                        </div>
                      </div>                     
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" id="save-player" onclick="savePlayer()">Save</button>
                </div>
            </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->

    <div class="modal fade" id="clipModal">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>

                    <h4 class="modal-title">Add Clip</h4>
                </div>
                <div class="modal-body">
                    <form class="form-horizontal" id="playerForm">
                       <div class="form-group">
                        <label for="image_url" class="col-sm-2 control-label">图片</label>
                        <div class="col-sm-10">
                          <input type="url" class="form-control" id="image_url" placeholder="http://" required>
                        </div>
                      </div>
                      <div class="form-group">
                        <label for="clip_option" class="col-sm-2 control-label">选项</label>
                        <div id="clip_option" class="col-sm-10">
                          <input type="radio" id="clip_player_add" name="clip_option_x" checked="checked" value="yes">
                          <label for="clip_player_add">加入球员库</label>
                          <input type="radio" id="clip_player_not_add" name="clip_option_x" value="no">
                          <label for="clip_player_not_add">不加入</label>
                        </div>
                      </div>
                      <div class="form-group clip-player-x">
                        <label for="player_name" class="col-sm-2 control-label">球员</label>
                        <div class="col-sm-10" id="player_list">
                            <select class="form-control" id="player_name" data-theme="bootstrap">                                
                            </select>
                        </div>
                      </div>
                      <div class="form-group clip-move-x">
                        <label for="clip_move" class="col-sm-2 control-label">动作</label>
                        <div class="col-sm-10" id="clip_move">                            
                        </div>
                      </div>          
                      <div class="form-group">
                      <label for="clip_move" class="col-sm-2 control-label">描述</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" placeholder="选填" id="clip_desc">
                        </div>
                      </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" id="save-clip" onclick="saveSingleClip()">Save</button>
                </div>
            </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->

    <div class="modal fade" id="clipUpdateModal">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>

                    <h4 class="modal-title">Update Clip</h4>
                </div>
                <div class="modal-body">
                    <form class="form-horizontal" id="searchForm">
                      <div class="form-group">
                        <label for="name_search" class="col-sm-2 control-label">名称查询</label>
                        <div class="col-sm-10">
                          <input class="form-control" id="name_search" required>
                        </div>
                      </div>
                      <div id="searchResult">
                        <!-- <table class="table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>球员</th>
                              <th>动作</th>
                              <th>描述</th>
                              <th>图片</th>
                              <th>选择</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <th scope="row">1</th>
                              <td>MJ</td>
                              <td>投篮</td>
                              <td>最好的投篮</td>
                              <td>http://bac.com/1.gif</td>
                              <td><a href="#" onclick="updateClip();return false;">修改</a></td>
                            </tr>
                            <tr>
                              <th scope="row">2</th>
                              <td>Kobe</td>
                              <td>运球</td>
                              <td>胯下运球</td>
                              <td>http://bac.com/1.gif</td>
                              <td><a href="#" onclick="updateClip();return false;">修改</a></td>
                            </tr>                         
                          </tbody>
                        </table> -->
                      </div>
                    </form>

                    <form class="form-horizontal" id="clipUpdateForm">
                       <div class="form-group">
                        <label for="image_url_update" class="col-sm-2 control-label">图片</label>
                        <div class="col-sm-10">
                          <input type="url" class="form-control" id="image_url_update" placeholder="http://" required>
                        </div>
                      </div>
                      <div class="form-group">
                        <label for="player_name_update" class="col-sm-2 control-label">球员</label>
                        <div class="col-sm-10" id="player_list">
                            <select class="form-control" id="player_name_update" data-theme="bootstrap">                                
                            </select>
                        </div>
                      </div>
                      <div class="form-group">
                        <label for="clip_title_update" class="col-sm-2 control-label">名称</label>
                        <div class="col-sm-10">
                          <input class="form-control" id="clip_title_update" required>
                        </div>
                      </div>
                      <div class="form-group">
                        <label for="clip_desc_update" class="col-sm-2 control-label">描述</label>
                        <div class="col-sm-10">
                          <input class="form-control" id="clip_desc_update" required>
                        </div>
                      </div>
                      <div class="form-group">
                        <label for="clip_move_update" class="col-sm-2 control-label">动作</label>
                        <div class="col-sm-10" id="clip_move_update">                            
                        </div>
                      </div>      
                      <div class="form-group">
                        <button type="button" class="btn btn-default btn-xs" style="float: right; margin-right: 15px;" onclick="prepareUpdate('update')">更新</button>
                        <button type="button" class="btn btn-default btn-xs" style="float: right; margin-right: 5px;" onclick="prepareUpdate('delete')">删除</button>                                    
                      </div>
                      <div class="alert alert-danger alert-dismissible fade in hide" role="alert">
                        <!-- <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button> -->
                         <span id="alert-message" style="margin-right: 1em;"></span>
                         <button type="button" class="btn btn-danger btn-xs" onclick="performUpdate()">确认</button>
                          <button type="button" class="btn btn-default btn-xs" onclick="dimissAlert()">取消</button>
                        <p style="text-align: right;" class="clearfix">
                         
                        </p>
                      </div>                                      
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" id="save-clip-update" onclick="searchClip()">Search</button>
                </div>
            </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->

    <div class="modal fade" id="playsModal">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>

                    <h4 class="modal-title">Add Play</h4>
                </div>
                <div class="modal-body">
                    <form class="form-horizontal" id="playerForm">     
                      <div class="form-group">
                        <label for="play_name" class="col-sm-2 control-label">名称</label>
                        <div class="col-sm-10">
                          <input class="form-control" id="play_name" required>
                        </div>
                      </div>
                      <div class="form-group">
                        <label for="play_desc" class="col-sm-2 control-label">描述</label>
                        <div class="col-sm-10">
                          <input class="form-control" id="play_desc" required>
                        </div>
                      </div>               
                      <div class="form-group">
                        <label for="play_cat" class="col-sm-2 control-label">分类</label>
                        <div id="play_cat" class="col-sm-10">
                          <input type="radio" id="play_cat_outside" name="play_cat" checked="checked" value="point_guard">
                          <label for="play_cat_outside">外线</label>
                          <input type="radio" id="play_cat_inside" name="play_cat" value="center">
                          <label for="play_cat_inside">内线</label>
                        </div>
                      </div>
                      <div class="form-group">
                        <label for="play_level" class="col-sm-2 control-label">难度</label>
                        <div id="play_level" class="col-sm-10">
                          <input type="radio" id="play_level_1" name="play_level" checked="checked" value=1>
                          <label for="play_level_1">1星</label>
                          <input type="radio" id="play_level_2" name="play_level" value=2>
                          <label for="play_level_2">2星</label>
                          <input type="radio" id="play_level_3" name="play_level" value=3>
                          <label for="play_level_3">3星</label>
                        </div>
                      </div>
                      <div class="form-group">
                        <label for="play_thumb" class="col-sm-2 control-label">微缩图</label>
                        <div class="col-sm-10">
                          <input type="url" class="form-control" id="play_thumb" placeholder="http://" required>
                        </div>
                      </div>    
                      <div class="form-group">
                        <label for="play_pb" class="col-sm-2 control-label">平面图</label>
                        <div class="col-sm-10">
                          <input type="url" class="form-control" id="play_pb" placeholder="http://" required>
                        </div>
                      </div>  
                      <div class="form-group">
                        <label for="play_real" class="col-sm-2 control-label">实景图</label>
                        <div class="col-sm-10">
                          <input type="url" class="form-control" id="play_real" placeholder="http://" required>
                        </div>
                      </div>                                                        
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" id="save-clip" onclick="savePlay()">Save</button>
                </div>
            </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->

     <div class="modal fade" id="pushModal">
        <div class="modal-dialog">
            <div class="modal-content">            
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>

                    <h4 class="modal-title">发送推送</h4>
                </div>
                <div class="modal-body">
                    <!-- <form class="form-horizontal" id="searchForm"> -->
                    <form action="push.php" method="post" id="push-form" class="form-horizontal">                  
                      <div class="form-group">
                        <label for="title" class="col-sm-2 control-label">标题</label>
                        <div class="col-sm-10">
                          <input class="form-control" name="title" id="title" required="">
                        </div>
                      </div>       
                      <div class="form-group">
                        <label for="message" class="col-sm-2 control-label">内容</label>
                        <div class="col-sm-10">
                          <input class="form-control" name="message" id="message" required="">
                        </div>
                      </div>                   
                      <div class="form-group">
                        <label for="push_id" class="col-sm-2 control-label">ID</label>
                        <div class="col-sm-10">
                          <input class="form-control" name="push_id" id="push_id" required="">
                        </div>
                      </div>                   
                    </form>             
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="search-images" onclick="searchImages()">查看图片</button>
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>                    
                    <button type="button" class="btn btn-primary" id="submit-push" onclick="submitPush()">发送</button>
                </div>
            </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->
    <div class="modal fade" id="postModal">
        <div class="modal-dialog">
            <div class="modal-content">            
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">生成帖子内容</h4>
                </div>
                <div class="modal-body">
                    <form class="form-horizontal">                  
                      <div class="form-group">
                        <label for="post-content" class="col-sm-2 control-label">帖子内容</label>
                        <div class="col-sm-10">
                          <textarea class="form-control" id="post-content" rows="5"></textarea>
                        </div>
                      </div>                                        
                    </form>             
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close
                    </button>                  
                </div>
            </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->
</body>
<div id="dialog" title="File Download">
  <div class="progress-label">Starting download...</div>
  <div id="progressbar"></div>
</div>
</html>