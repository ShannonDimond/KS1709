// Primary source https://github.com/23/resumable.js/tree/master/samples

var ALLOWED = 1, NOT_ALLOWED = 0; // overwriting permission
var overwrite = []; // save the overwriting permission for folders of files here.


var r = new Resumable({
    target: '../php/resumable_upload.php',
    query: { upload_token: 'files' },
    fileType: ['jpeg','jpg','png','webm', 'mp4','JPEG','JPG','PNG','WEBM','MP4']
});


function upload(file) {    
    // Actually start the upload
    $('.resumable-progress .progress-resume-link').hide();
    $('.resumable-progress .progress-pause-link').show();
    r.upload();
}

if (!r.support) {

} else {
    // Show a place for dropping/selecting files
    $('.resumable-drop').show();
    r.assignDrop($('.resumable-drop')[0]);
    r.assignBrowse($('.resumable-browse')[0]);
    // Handle file add event
    r.on('fileAdded', function (file) {

        // Show progress pabr
        $('.resumable-progress, .resumable-list').show();
        // Show pause, hide resume
        // Add the file to the list
        $('.resumable-list').append('<li class="resumable-file-' + file.uniqueIdentifier + '">Uploading <span class="resumable-file-name"></span> <span class="resumable-file-progress"></span>');
        $('.resumable-file-' + file.uniqueIdentifier + ' .resumable-file-name').html(file.fileName);
        
        // if a folder is dropeed, "relativePath" will be defined
        if(file.relativePath != file.fileName) {
            // striping the actual filename and getting the directory of that file
            var dir = file.relativePath.substring(0, file.relativePath.lastIndexOf('/'));
            console.log(overwrite[dir]);
            if(overwrite[dir] != ALLOWED && fileExists(dir)) {
                if(overwrite[dir] == undefined) {
                    confirmMessage(
                        dir + " already exists,\nOverwrite?",
                        function() {
                            overwrite[dir] = ALLOWED;
                            deleteFolder(dir);
                            upload(file);
                        },
                        function() {
                            overwrite[dir] = NOT_ALLOWED;
                            r.removeFile(file);
                        }
                    )
                    
                }
                else {
                    overwrite[dir] = NOT_ALLOWED;
                    r.removeFile(file);
                }
            }
            else {
                overwrite[dir] = ALLOWED;
                upload(file);
            }
        }
        // in case of just files
        else {
            if(fileExists(file.fileName)) {
                confirmMessage(
                    file.fileName + " already exists,\nOverwrite?",
                    function(){upload(file)},
                    function(){r.removeFile(file)}
                );
            }
            else
                upload(file);
        }
    });
    r.on('pause', function () {
        // Show resume, hide pause
        $('.resumable-progress .progress-resume-link').show();
        $('.resumable-progress .progress-pause-link').hide();
    });
    r.on('complete', function () {
        // Hide pause/resume when the upload has completed
        $('.resumable-progress .progress-resume-link, .resumable-progress .progress-pause-link').hide();
        syncFolders();
        overwrite = [];
    });
    r.on('fileSuccess', function (file, message) {
        // Reflect that the file upload has completed
        $('.resumable-file-' + file.uniqueIdentifier + ' .resumable-file-progress').html('(completed)');
    });
    r.on('fileError', function (file, message) {
        // Reflect that the file upload has resulted in error
        $('.resumable-file-' + file.uniqueIdentifier + ' .resumable-file-progress').html('(file could not be uploaded: ' + message + ')');
    });
    r.on('fileProgress', function (file) {
        // Handle progress for both the file and the overall upload
        $('.resumable-file-' + file.uniqueIdentifier + ' .resumable-file-progress').html(Math.floor(file.progress() * 100) + '%');
        $('.progress-bar').css({ width: Math.floor(r.progress() * 100) + '%' });
    });
}


function fileExists(url) {
    var http = new XMLHttpRequest();
    http.open('GET', '../php/checkfile.php/?url=' + url, false);
    http.send();
    return http.status != 404;
}

function syncFolders() {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                console.log(xmlhttp.responseText);
                files = JSON.parse(xmlhttp.responseText);
                document.getElementById("folder_list").innerHTML = "";
                folders = [];
                for (file in files) {
                    // getting the folder name
                    // if files[file] = 'media/presentations/slides1/presentations.png
                    // then 'presentations' will be pushed to "folders"
                    folder = files[file].split("/")[0];
                    if (folders.indexOf(folder) == -1) {
                        folders.push(folder);
                        document.getElementById("folder_list").innerHTML +=
                            '<li>' + folder + '<i class="js-remove">✖</i></li>';
                    }
                }
            }
            else if (xmlhttp.status == 400) {
                alert('There was an error 400');
            }
            else {
                alert(xmlhttp.status);
            }
        }
    };

    xmlhttp.open("GET", "../php/sync_folders.php", true);
    xmlhttp.send();
}

function deleteFolder(folder_name) {
    console.log("deleting " + folder_name);
    var xmlhttp = new XMLHttpRequest();
    var formData = new FormData();
    formData.append("folder_name", folder_name);
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                syncFolders();
            }
            else if (xmlhttp.status == 400) {
                alert('There was an error 400');
            }
            else {
                alert('something else other than 200 was returned');
            }
        }
    };

    xmlhttp.open("POST", "../php/delete_folder.php", true);
    xmlhttp.send(formData);
}

function reorderFolders(folder_order) {

    var xmlhttp = new XMLHttpRequest();
    var formData = new FormData();
    formData.append("folder_order", folder_order);
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {

            }
            else if (xmlhttp.status == 400) {
                alert('There was an error 400');
            }
            else {
                alert('something else other than 200 was returned');
            }
        }
    };

    xmlhttp.open("POST", "../php/sync_folders.php", true);
    xmlhttp.send(formData);
}


var folder_list = document.getElementById("folder_list");
var editableList = Sortable.create(folder_list, {
    filter: '.js-remove',
    onFilter: function (evt) {
        confirmMessage(
            "Sure to delete?",
            function() {
                var el = editableList.closest(evt.item); // get dragged item
                el && el.parentNode.removeChild(el);
                deleteFolder(evt.item.innerText.slice(0, -1));
            },
            function(){}
        )
    },
    onEnd: function (evt) {
        evt.oldIndex;  // element's old index within parent
        evt.newIndex;  // element's new index within
        folder_order = evt.target.parentNode.innerText.replace(/\✖/g, '');
        reorderFolders(folder_order);
    },
    onRemove: function (evt) {
    },
});


window.onload = function () {
    syncFolders();
}


function confirmMessage(message, onAccept, onCancel) {
    $("#confirm-box").css("display" ,"inherit");
    document.getElementById("message").innerText = message;
    document.getElementById("okbtn").onclick = function(){onAccept();$("#confirm-box").css("display" ,"none");}
    document.getElementById("cancelbtn").onclick = function(){onCancel();$("#confirm-box").css("display" ,"none");}
}
