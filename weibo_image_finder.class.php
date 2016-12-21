<?php

/**
 * Finds images from a give URL.
 *
 * @author   Torleif Berger
 * @link     http://www.geekality.net/?p=1585
 * @license  http://creativecommons.org/licenses/by/3.0/
 */
class ImageFinderWeibo
{
        private $document;
        private $url;
        private $base;


        /**
         * Creates a new image finder object.
         */
        public function __construct($url)
        {
                // Store url
                $this->url = $url;
        }


        /**
         * Loads the HTML from the url if not already done.
         */
        public function load()
        {
                // Return if already loaded
                if($this->document)
                        return;
                
                // Get the HTML document
                $this->document = self::get_document($this->url);
                
                //$this->document = self::login();                
        }


        /**
         * Returns an array with all the images found.
         */
        public function get_images()
        {
                // Makes sure we're loaded
                $this->load();                

                // Return values
                return $this->document;
        }


        /**
         * Gets the html of a url and loads it up in a DOMDocument.
         */
        private static function get_document($url)
        {
//         		$cookie_jar = dirname(__FILE__)."/cookie.txt";
        	$cookie_jar = dirname(__FILE__)."/cookies1.txt";
        	                	
                // Set up and execute a request for the HTML
                $request = curl_init();
                curl_setopt_array($request, array
                (
                        CURLOPT_URL => $url,
                        
                        CURLOPT_RETURNTRANSFER => TRUE,
                        CURLOPT_HEADER => FALSE,
                        
                        CURLOPT_SSL_VERIFYPEER => TRUE,
                        CURLOPT_CAINFO => dirname(__FILE__).'/cacert.pem',

                        CURLOPT_FOLLOWLOCATION => TRUE,
                        CURLOPT_MAXREDIRS => 10,
                ));
                
                curl_setopt($request, CURLOPT_COOKIEFILE, $cookie_jar);
                //curl_setopt($request, CURLOPT_COOKIEJAR, "cookies.txt");
                
                $response = curl_exec($request);
                //$err = curl_error($request);
                //print_r($err);
                //print_r($response);
                curl_close($request);
				                           
                return $response;
        }
                       
        private static function login() {
        	
        	$cookie_jar = dirname(__FILE__)."/cookie.txt";
        	        	 
        	$ch = curl_init('http://passport.hupu.com/pc/login/member.action');
        	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        	curl_setopt($ch, CURLOPT_POSTFIELDS, "username=18621603725&password=5c008ee4275971386d4aa5ac38d92bbe");
        	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);        	         	
        	 
        	$headers = array(
        			"Content-type: application/x-www-form-urlencoded; charset=UTF-8",
        			"Accept: application/json, text/javascript, */*; q=0.01",
        			"Origin: http://passport.hupu.com",
        			"X-Requested-With: XMLHttpRequest",
        			"Accept-Encoding: gzip, deflate",
        			"Accept-Language: zh-CN,zh;q=0.8,en;q=0.6",
        			"Cache-Control: no-cache",
        			"Connection: keep-alive",
        			"Pragma: no-cache",
        			"Referer: http://passport.hupu.com/pc/login?project=bbs&from=pc",
        			"User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36"
        	);        	 
        	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        	         	
        	//curl_setopt($ch, CURLOPT_COOKIEFILE, "cookies.txt");
        	curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie_jar);                	
        	         	 
        	$result = curl_exec($ch);     	  
        	        	 
        	curl_close($ch);        	         	        	         
        }


        /**
         * Tries to get the base tag href from the given document.
         */
        private static function get_base(DOMDocument $document)
        {
                $tags = $document->getElementsByTagName('base');

                foreach($tags as $tag)
                        return $tag->getAttribute('href');

                return NULL;
        }


        /**
         * Makes sure a url is absolute.
         */
        private static function make_absolute($url, $base) 
        {
                // Return base if no url
                if( ! $url) return $base;

                // Already absolute URL
                if(parse_url($url, PHP_URL_SCHEME) != '') return $url;
                
                // Only containing query or anchor
                if($url[0] == '#' || $url[0] == '?') return $base.$url;
                
                // Parse base URL and convert to local variables: $scheme, $host, $path
                extract(parse_url($base));

                // If no path, use /
                if( ! isset($path)) $path = '/';
         
                // Remove non-directory element from path
                $path = preg_replace('#/[^/]*$#', '', $path);
         
                // Destroy path if relative url points to root
                if($url[0] == '/') $path = '';
                
                // Dirty absolute URL
                $abs = "$host$path/$url";
         
                // Replace '//' or '/./' or '/foo/../' with '/'
                $re = array('#(/\.?/)#', '#/(?!\.\.)[^/]+/\.\./#');
                for($n = 1; $n > 0; $abs = preg_replace($re, '/', $abs, -1, $n)) {}
                
                // Absolute URL is ready!
                return $scheme.'://'.$abs;
        }
}