<?php
$ds = "/";
$uploadDir = 'Presentation'.$ds;
$method = $_SERVER['REQUEST_METHOD'];

/*
 This function will "recursively" delete a directory path given as $dir
*/
function delDir($dir) { 
    $files = array_diff(scandir($dir), array('.','..')); 
    foreach ($files as $file) { 
        (is_dir("$dir/$file")) ? delDir("$dir/$file") : unlink("$dir/$file"); 
    } 
    return rmdir($dir); 
} 

switch($method){
    case 'GET':
        $file = $_GET['url'];
        // check if the file requested exists or not
        if(!file_exists($uploadDir.$file)){
            http_response_code(404);
            die(404);
        }
        break;
    case 'POST':
        $count = count($_FILES['files']['name']);
        
        // looping through all the uploaded files
        for($i = 0; $i<$count; $i++) {
            $fullpath = $_FILES['files']["name"][$i];

            // check if a folder is droped or a file
            // folder upload would contain 'full_path' in request
            // which contains the path of the uploaded file along with folder name
            if(isset($_POST['full_path'][$i])) {
                $fullpath = $_POST['full_path'][$i];
            }

            $tmpFilePath = $_FILES['files']['tmp_name'][$i];
            if ($tmpFilePath != ""){

                // Setup our new file path
                if(!is_dir($uploadDir . dirname($fullpath))){
                    // recursively creating directory if it's no already there.
                    mkdir($uploadDir . dirname($fullpath),0777,true);
                };
                
                $newFilePath = $uploadDir . $fullpath;

                // Upload the file
                if(move_uploaded_file($tmpFilePath, $newFilePath)) {
                    echo "File is valid, and was successfully uploaded.\n";
                } else {
                    echo "Possible file upload attack!\n";
                }
            }
        }
        break;
}

?>
