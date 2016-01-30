<!DOCTYPE html>
<html lang="en">
<head>
        <meta charset="utf-8">
        <title>Clip Fetcher</title>   
        <link rel="stylesheet" href="css/bootstrap/css/bootstrap.min.css">
	    <link rel="stylesheet" href="css/jquery-ui.css">
    	<link rel="stylesheet" href="css/combo.select.css">
    	<link rel="stylesheet" href="css/style.css">

    	<script src="js/jquery-2.1.3.min.js"></script>
	    <script src="js/jquery-ui.js"></script>
    	<script src="js/pouchdb.js"></script>
	    <script src="js/pouchdb.find.js"></script>        
	    <script src="js/jquery.combo.select.js"></script>
    	<script src="js/gifffer.js"></script>
        <script src="js/progressbar.js"></script>

	    <script src="js/script.js"></script>     
</head>
<body>
	<div class="container-fluid">
        <h1>Clip Fetcher</h1>
        <form action="scan.php" method="post" id="url-form">
            <input type="url" name="url" placeholder="http://" required="">
            <input type="submit" value="Get Images" id="search">            
            <!--
            <input type="button" value="test" id="save" onclick="test();return false;">            
            -->
        </form>
    </div>
    <div class="container-fluid">
        <div id="output">           
          <div class="row"></div>            
        </div>
    </div>

</body>
<div id="dialog" title="File Download">
  <div class="progress-label">Starting download...</div>
  <div id="progressbar"></div>
</div>
</html>