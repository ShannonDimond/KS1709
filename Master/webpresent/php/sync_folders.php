<?php

require 'variables.php';

if(!file_exists($fileName)) {
    $file = fopen($fileName, "w");
    chmod($file, 0777);
    fclose($file);
}

$method = $_SERVER['REQUEST_METHOD'];

function getDirContents($dir, &$results = array()) {

    $len = strlen($_SERVER['DOCUMENT_ROOT'].'/webpresent/Presentation');
    $files = scandir($dir, SCANDIR_SORT_NONE);
    foreach($files as $key => $value) {
        $path = $dir . "/"   . $value;
        if(!is_dir($path)) {
            $results[] = substr($path, $len+1);
        } else if($value != "." && $value != "..") {
            getDirContents($path,$results);
        }
    }

    natsort($results);
    return $results;
}


switch($method) {
    // request to update the folder_config and return
    case 'GET':
        $file = fopen($fileName , "r") or die("Unable to open file!");

        $current_dirs = getDirContents($uploadDir);
        $dirs = (array) json_decode(fread($file, filesize($fileName)));
        fclose($file);
        $dirs = array_unique(array_merge($dirs,$current_dirs));
        $dirs = array_intersect($dirs, $current_dirs);
        $new_dirs = array();
        foreach($dirs as $file) {
            $new_dirs[] = $file;
        }
        $config = json_encode($new_dirs, JSON_PRETTY_PRINT);
        $config = str_replace("\/", "/", $config);
        $file = fopen($fileName , "w") or die("Unable to open file!");        
        fwrite($file, $config);
        fclose($file);
        echo $config;
        break;
        
    case 'POST':
        $file = fopen($fileName , "r") or die("Unable to open file!");
        $config = (array) json_decode(fread($file, filesize($fileName)));
        fclose($file);
        $new_config = array();

        // request to reorder the folders
        // the desired order is passed via $_POST['folder_order']
        // new array is being made according to this new order
        if(isset($_POST['folder_order'])) {
            $folder_order = explode("\r\n", $_POST['folder_order']);

            // making a new configuration based on the requested folder_order
            foreach($folder_order as $folder_index => $folder_name) {
                foreach($config as $index => $file_name){
                    $dir = explode($ds,$file_name)[0];
                    if($dir == $folder_name){
                        $new_config[] = $file_name;
                    }
                }
            }
        }

        $config = json_encode($new_config, JSON_PRETTY_PRINT);
        $config = str_replace("\/", "/", $config);
        $file = fopen($fileName , "w") or die("Unable to open file!");        
        fwrite($file, $config);
        fclose($file);
        break;
}

?>
