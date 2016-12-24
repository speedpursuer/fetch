<?php

// Set content-type
header('content-type: application/json; charset=utf-8');


// Get the url
$url = array_key_exists('url', $_POST) 
        ? $_POST['url'] 
        : null;

$forWeibo = $_POST['weibo'];

if($forWeibo=="false") {
	// Create image finder
	include('image_finder.class.php');
	$finder = new ImageFinder($url);
	$finder->fetchGIF();	
}else{
	// Create image finder
	include('weibo_image_finder.class.php');
	$finder = new ImageFinderWeibo($url);	
	
	// Get images
	$result = $finder->get_images();
	
	// ob_start('ob_gzhandler');
	echo $result;
}