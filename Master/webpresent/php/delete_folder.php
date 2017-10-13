<?php

require 'variables.php';

if(!file_exists($fileName)) {
    $file = fopen($fileName, "w");
    chmod($file, 0777);
    fclose($file);
}

$file = fopen($fileName , "r") or die("Unable to open file!");
$config = (array) json_decode(fread($file, filesize($fileName)));
fclose($file);
$new_config = array();


function delDir($dir) { 
    $files = array_diff(scandir($dir), array('.','..')); 
    foreach ($files as $file) { 
        (is_dir("$dir/$file")) ? delDir("$dir/$file") : unlink("$dir/$file"); 
    } 
    return rmdir($dir); 
} 


if(isset($_POST['folder_name'])) {
    $folder_name = $_POST['folder_name'];
    if($folder_name){
        if($folder_name == 'ALL_FOLDERS'){
            delDir($GLOBALS['uploadDir']);
            mkdir($GLOBALS['uploadDir'], 0777, true);
            chmod($GLOBALS['uploadDir'], 0777);
        }
        else if(is_dir($GLOBALS['uploadDir'].$GLOBALS['ds'].$folder_name))
            delDir($GLOBALS['uploadDir'].$GLOBALS['ds'].$folder_name);
        else 
            unlink($GLOBALS['uploadDir'].$GLOBALS['ds'].$folder_name);
    }
    
    $new_config = array_filter($config,function($var){
        return strpos($var, $folder_name) == false;
    });
}

?>
