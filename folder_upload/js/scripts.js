var ALLOWED = 1, NOT_ALLOWED = 0; // overwriting permission
var overwrite = []; // save the overwriting permission for folders of files here.

Dropzone.options.uploadArea = {
    paramName: "files", // The name that will be used to transfer the file
    maxFilesize: 5000, // MB
    addRemoveLinks: true, // if true, will hae a remove link in preview
    uploadMultiple: true,
    parallelUploads: 1000,
    acceptedFiles: "image/*,video/mp4,video/webm", // limiting file types
    accept: function(file, done) {
        // if a folder is dropeed, "fullPath" will be defined
        if(file.fullPath) {
            // striping the actual filename and getting the directory of that file
            var dir = file.fullPath.substring(0, file.fullPath.lastIndexOf('\/'));

            if(overwrite[dir] != ALLOWED && fileExists(dir)) {
                if(overwrite[dir] == undefined && confirm(dir + " already exists,\nOverwrite?")) {
                    overwrite[dir] = ALLOWED;
                    deleteFolder(dir);
                    done();
                }
                else {
                    done("folder already exists");
                    overwrite[dir] = NOT_ALLOWED;
                }
            }
            else 
                done();
        }
        // in case of just files
        else {
            if(fileExists(file.name)) {
                if(confirm(file.name + " already exists,\nOverwrite?"))
                    done();
                else 
                    done("file already exists");
            }
            else 
                done();
        }
    },
    init: function() {
        this.on("sendingmultiple", function(files, xhr, data) {
            var i=0;
            for(i in files){
                // in case of folder upload, adding the fullPath s in request
                if(files[i].fullPath) {
                    data.append("full_path["+i+"]", files[i].fullPath);
                }
                i++;
            }
        });
        this.on("queuecomplete", function(file) { 
            overwrite = [];
            syncFolders();
        });
    }
};

function fileExists(url)
{
    var http = new XMLHttpRequest();
    http.open('GET', 'upload.php/?url='+url, false);
    http.send();
    console.log(http.status);
    return http.status!=404;
}

function syncFolders() {
    var xmlhttp = new XMLHttpRequest();
    
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
               if (xmlhttp.status == 200) {
                    console.log(xmlhttp.responseText);
                    files = JSON.parse(xmlhttp.responseText);
                    document.getElementById("folder_list").innerHTML = "";
                    folders = [];
                    for(file in files) {
                        // getting the folder name
                        // if files[file] = 'media/presentations/slides1/presentations.png
                        // then 'presentations' will be pushed to "folders"
                        folder = files[file].split("\/")[1]; 
                        if(folders.indexOf(folder) == -1) {
                            folders.push(folder);
                            document.getElementById("folder_list").innerHTML += 
                            '<li>'+folder+'<i class="js-remove">✖</i></li>';
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
    console.log("deleting "+folder_name );
    var xmlhttp = new XMLHttpRequest();
    var formData = new FormData();
    formData.append("folder_name", folder_name);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
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

function reorderFolders(folder_order){
    
    var xmlhttp = new XMLHttpRequest();
    var formData = new FormData();
    formData.append("folder_order", folder_order);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
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
        if(confirm("Sure to delete?")) {
            var el = editableList.closest(evt.item); // get dragged item
            el && el.parentNode.removeChild(el);
            deleteFolder(evt.item.innerText.slice(0,-1));
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


window.onload = function() {
    syncFolders();
}