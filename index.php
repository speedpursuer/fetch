<!DOCTYPE html>
<html lang="en">
<head>
        <meta charset="utf-8">
        <title>Clip Fetcher</title>   
        <link rel="stylesheet" href="css/bootstrap/css/bootstrap.min.css">
	    <link rel="stylesheet" href="css/jquery-ui.css">
    	<link rel="stylesheet" href="css/combo.select.css">
    	<link rel="stylesheet" href="css/style_2_6.css">

    	<script src="js/jquery-2.1.3.min.js"></script>
	    <script src="js/jquery-ui.js"></script>
    	<script src="js/pouchdb.js"></script>
	    <script src="js/pouchdb.find.js"></script>        
	    <script src="js/jquery.combo.select.js"></script>
    	<script src="js/gifffer.js"></script>
        <script src="js/progressbar.js"></script>
        <script src="js/modal.js"></script>
	    <script src="js/script_3_3.js"></script>     
</head>
<body>
	<div class="container-fluid">
        <h1>Clip Fetcher</h1>
        <form action="scan.php" method="post" id="url-form" class="form-inline">
            <div class="form-group">
                <input type="url" name="url" placeholder="http://" required="" class="form-control">
            </div>
            <div class="form-group">
                <input type="submit" class="btn btn-primary .btn-xs form-control" value="Get Images" id="search">                                    
            </div>
            <div class="form-group">
                <button type="button" class="btn btn-primary .btn-xs form-control" data-toggle="modal" data-target="#playerModal" id="addPlayer">
                    Add Player
                </button>      
            </div>       
            <div class="form-group">     
                <button type="button" class="btn btn-primary .btn-xs form-control" data-toggle="modal" data-target="#clipModal" id="addClip">
                    Add Clip
                </button>    
            </div>               
        </form>
    </div>
    <div class="container-fluid">
        <div id="output">           
          <div class="row"></div>            
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
                      <!--
                      <div class="form-group">
                        <label for="image" class="col-sm-2 control-label">Image</label>
                        <div class="col-sm-10">
                          <input type="url" class="form-control" id="image" placeholder="http://">
                        </div>
                      </div>                     
                      <div class="form-group">
                        <div class="col-sm-offset-2 col-sm-10">
                          <div class="checkbox">
                            <label>
                              <input type="checkbox" id="star">Star
                            </label>
                          </div>
                        </div>
                      </div>                     
                      -->
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
                        <label for="player_name" class="col-sm-2 control-label">球员</label>
                        <div class="col-sm-10" id="player_list">
                            <select class="form-control" id="player_name" data-theme="bootstrap">                                
                            </select>
                        </div>
                      </div>
                      <div class="form-group">
                        <label for="clip_title" class="col-sm-2 control-label">名称</label>
                        <div class="col-sm-10">
                          <input class="form-control" id="clip_title" required>
                        </div>
                      </div>
                      <div class="form-group">
                        <label for="clip_desc" class="col-sm-2 control-label">描述</label>
                        <div class="col-sm-10">
                          <input class="form-control" id="clip_desc" required>
                        </div>
                      </div>
                      <div class="form-group">
                        <label for="clip_move" class="col-sm-2 control-label">动作</label>
                        <div class="col-sm-10" id="clip_move">                            
                        </div>
                      </div>                     
                      <!--
                      <div class="form-group">
                        <label for="image" class="col-sm-2 control-label">Image</label>
                        <div class="col-sm-10">
                          <input type="url" class="form-control" id="image" placeholder="http://">
                        </div>
                      </div>                     
                      <div class="form-group">
                        <div class="col-sm-offset-2 col-sm-10">
                          <div class="checkbox">
                            <label>
                              <input type="checkbox" id="star">Star
                            </label>
                          </div>
                        </div>
                      </div>                     
                      -->
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" id="save-clip" onclick="saveSingleClip()">Save</button>
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