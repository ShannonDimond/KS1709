<?php

$ds = "/";
$uploadDir = 'uploads'.$ds;
$fileName = 'folder_config';

if(!file_exists($fileName)) {
    $file = fopen($fileName, "w");
    fclose($file);
}

$method = $_SERVER['REQUEST_METHOD'];

function getDirContents($dir, &$results = array()){
    $files = scandir($dir);

    foreach($files as $key => $value) {
        $path = $dir . "/"   . $value;
        if(!is_dir($path)) {
            $results[] = $path;
        } else if($value != "." && $value != "..") {
            getDirContents($path,$results);
        }
    }

    return $results;
}

function delDir($dir) { 
    $files = array_diff(scandir($dir), array('.','..')); 
    foreach ($files as $file) { 
        (is_dir("$dir/$file")) ? delDir("$dir/$file") : unlink("$dir/$file"); 
    } 
    return rmdir($dir); 
} 

switch($method) {
    // request to update the folder_config and return
    case 'GET':
        $file = fopen($fileName , "r") or die("Unable to open file!");

        $current_dirs = getDirContents("uploads");
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

        // request to delete a folder
        if(isset($_POST['folder_name'])) {
            $folder_name = $_POST['folder_name'];
            if($folder_name)
                if(is_dir($uploadDir.$folder_name))
                    delDir($uploadDir.$folder_name);
                else 
                    unlink($uploadDir.$folder_name);
            
            $new_config = getDirContents("uploads");
        }
        // request to reorder the folders
        else if(isset($_POST['folder_order'])) {
            $folder_order = explode("\r\n", $_POST['folder_order']);

            // making a new configuration based on the requested folder_order
            foreach($folder_order as $folder_index => $folder_name) {
                foreach($config as $index => $file_name){
                    $dir = explode($ds,$file_name)[1];
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