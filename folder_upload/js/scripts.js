// Primary source https://github.com/23/resumable.js/tree/master/samples

var ALLOWED = 1, NOT_ALLOWED = 0; // overwriting permission
var overwrite = []; // save the overwriting permission for folders of files here.


var r = new Resumable({
    target: 'resumable_upload.php',
    query: { upload_token: 'files' },
    fileType: ['jpeg','jpg','png','webm', 'mp4']
});


function upload(file) {
    // Show progress pabr
    $('.resumable-progress, .resumable-list').show();
    // Show pause, hide resume
    $('.resumable-progress .progress-resume-link').hide();
    $('.resumable-progress .progress-pause-link').show();
    // Add the file to the list
    $('.resumable-list').append('<li class="resumable-file-' + file.uniqueIdentifier + '">Uploading <span class="resumable-file-name"></span> <span class="resumable-file-progress"></span>');
    $('.resumable-file-' + file.uniqueIdentifier + ' .resumable-file-name').html(file.fileName);
    // Actually start the upload
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

        // if a folder is dropeed, "fullPath" will be defined
        if(file.relativePath != file.fileName) {
            // striping the actual filename and getting the directory of that file
            var dir = file.relativePath.substring(0, file.relativePath.lastIndexOf('\/'));

            if(overwrite[dir] != ALLOWED && fileExists(dir)) {
                if(overwrite[dir] == undefined && confirm(dir + " already exists,\nOverwrite?")) {
                    overwrite[dir] = ALLOWED;
                    deleteFolder(dir);
                    upload(file);
                }
                else {
                    overwrite[dir] = NOT_ALLOWED;
                }
            }
            else 
                upload(file);
        }
        // in case of just files
        else {
            if(fileExists(file.fileName)) {
                if(confirm(file.fileName + " already exists,\nOverwrite?"))
                    upload(file);
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

// Dropzone.options.uploadArea = {
//     paramName: "files", // The name that will be used to transfer the file
//     maxFilesize: 5000, // MB
//     addRemoveLinks: true, // if true, will hae a remove link in preview
//     uploadMultiple: true,
//     parallelUploads: 1000,
//     // acceptedFiles: "image/*,video/mp4,video/webm", // limiting file types
//     accept: function(file, done) {
//         // if a folder is dropeed, "fullPath" will be defined
//         if(file.fullPath) {
//             // striping the actual filename and getting the directory of that file
//             var dir = file.fullPath.substring(0, file.fullPath.lastIndexOf('\/'));
//             if(overwrite[dir] != ALLOWED && fileExists(dir)) {
//                 if(overwrite[dir] == undefined ) {
//                     confirm_dialog (
//                         dir+" already exists, do you want to overwrite?",
//                         function() {
//                             overwrite[dir] = ALLOWED;
//                             deleteFolder(dir);
//                             done();
//                         },
//                         function() {
//                             done("folder already exists");
//                             overwrite[dir] = NOT_ALLOWED;
//                         }
//                     )
//                 }
//                 else {
//                     done("folder already exists");
//                 }
//             }
//             else 
//                 done();
//         }
//         // in case of just files
//         else {
//             if(fileExists(file.name)) {
//                 if(confirm(file.name + " already exists,\nOverwrite?"))
//                     done();
//                 else 
//                     done("file already exists");
//             }
//             else 
//                 done();
//         }
//     },
//     init: function() {
//         this.on("sendingmultiple", function(files, xhr, data) {
//             var i=0;
//             for(i in files){
//                 // in case of folder upload, adding the fullPath s in request
//                 if(files[i].fullPath) {
//                     data.append("full_path["+i+"]", files[i].fullPath);
//                 }
//                 i++;
//             }
//         });
//         this.on("queuecomplete", function(file) { 
//             overwrite = [];
//             syncFolders();
//         });
//     }
// };

function fileExists(url) {
    var http = new XMLHttpRequest();
    http.open('GET', 'upload.php/?url=' + url, false);
    http.send();
    console.log(http.status);
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
                    folder = files[file].split("\/")[1];
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
                alert('something else other than 200 was returned');
            }
        }
    };

    xmlhttp.open("GET", "sync_folders.php", true);
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

            }
            else if (xmlhttp.status == 400) {
                alert('There was an error 400');
            }
            else {
                alert('something else other than 200 was returned');
            }
        }
    };

    xmlhttp.open("POST", "sync_folders.php", true);
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

    xmlhttp.open("POST", "sync_folders.php", true);
    xmlhttp.send(formData);
}


var folder_list = document.getElementById("folder_list");
var editableList = Sortable.create(folder_list, {
    filter: '.js-remove',
    onFilter: function (evt) {
        if (confirm("Sure to delete?")) {
            var el = editableList.closest(evt.item); // get dragged item
            el && el.parentNode.removeChild(el);
            deleteFolder(evt.item.innerText.slice(0, -1));
            window.location.reload(true);
        }
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