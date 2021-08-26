// Create FS
// -----------------------------

window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
window.directoryEntry = window.directoryEntry || window.webkitDirectoryEntry;

let fs;
let fsSize = 10; //in MB
let currentDirectory;
var requestedBytes = 1024 * 1024 * fsSize;

$(document).ready(function () {
    navigator.webkitPersistentStorage.requestQuota(
        requestedBytes,
        function (grantedBytes) {
            window.requestFileSystem(PERSISTENT, grantedBytes, onInitFS, errorHandler);
        },
        function (e) {
            console.log("Error", e);
        }
    );
});

// General
// -----------------------------

function listResults(entries) {
    // Remove contents there already
    document.querySelector(".files").innerHTML = "";

    // Document fragments can improve performance since they're only appended
    // to the DOM once. Only one browser reflow occurs.
    var fragment = document.createDocumentFragment();

    entries.forEach(function (entry, i) {
        var type = entry.isDirectory ? "folder" : "file";
        var li = document.createElement("li");
        li.innerHTML = [entry.name].join("");
        li.setAttribute("class", type);
        if (entry.isDirectory && entry.name == "..") li.setAttribute("onclick", `updir()`);
        else if (entry.isDirectory) li.setAttribute("onclick", `diropener("${entry.name}")`);
        else {
            li.setAttribute("onclick", `fileopener("${entry.name}", getFileExtension("${entry.name}"))`);
            li.setAttribute("class", type + " " + getFileExtension(entry.name));
        }
        fragment.appendChild(li);
    });

    document.querySelector(".files").appendChild(fragment);
}

// Read directories and list results in finder
let entries = [];

function listEntries(cwd) {
    setTimeout(() => {
        var dirReader = cwd.createReader();
        readEntries(dirReader);
    }, 1000);
}

function readEntries(dirReader) {
    dirReader.readEntries(function (results) {
        if (!results.length) {
            if (currentDirectory.fullPath !== "/") entries.unshift({ name: "..", isDirectory: true });
            listResults(entries.sort());
            entries = [];
        } else {
            entries = entries.concat(toArray(results));
            readEntries(dirReader);
        }
    }, errorHandler);
}

function onInitFS(filesystem) {
    // Debug message
    console.log("Opened filesystem: " + filesystem.name);

    // Make global variable
    fs = filesystem;
    currentDirectory = fs.root;

    // Populate finder
    listEntries(currentDirectory);
}

// setInterval(() => {
//     listEntries(currentDirectory);
//     update();
// }, 1100);

function errorHandler(e) {
    console.log(e);
}

// Upload files
// -----------------------------

// document.querySelector('#upload-files').onchange = function(e) {
//     var files = this.files;

//     // Duplicate each file the user selected to the app's fs.
//     for (var i = 0, file; file = files[i]; ++i) {

//         // Capture current iteration's file in local scope for the getFile() callback.
//         (function(f) {
//             fs.root.getFile(f.name, {create: true, exclusive: true}, function(fileEntry) {
//             fileEntry.createWriter(function(fileWriter) {
//                 fileWriter.write(f); // Note: write() can take a File or Blob object.
//             }, errorHandler);
//             }, errorHandler);
//         })(file);

//     }

// };

// Create, read and write files
// -----------------------------

// create empty file
function createEmpty(cwd, dest) {
    cwd.getFile(
        dest,
        { create: true },
        function (fileEntry) {
            console.log("created file " + dest);
        },
        errorHandler
    );
}

// example: createEmpty(fs.root, "log.txt")
// creates empty file called "log.txt"
// the first agrument is the current directory

// overwrite existing files and create new ones
function overwrite(cwd, src, dest) {
    cwd.getFile(
        dest,
        { create: true },
        function (fileEntry) {
            // Create a FileWriter object for our FileEntry (log.txt).
            fileEntry.createWriter(function (fileWriter) {
                // Create a new Blob and write it to log.txt.
                let blob = new Blob([src], { type: "text/plain" });

                fileWriter.onwriteend = function () {
                    if (fileWriter.length === 0) {
                        //fileWriter has been reset, write file
                        fileWriter.write(blob);
                    } else {
                        //file has been overwritten with blob
                        //use callback or resolve promise
                    }
                };
                fileWriter.truncate(0);

                fileWriter.onerror = function (e) {
                    console.log("Write failed: " + e.toString());
                };
            }, errorHandler);
        },
        errorHandler
    );
}

// example: overwrite(fs.root, "Hello World!", "log.txt");
// overwrites content of "log.txt" with "Hello World!". if the file
// doesnt exist create it
// the first agrument is the current directory

// read file
function read(cwd, src, callback) {
    cwd.getFile(
        src,
        {},
        function (fileEntry) {
            // Get a File object representing the file,
            // then use FileReader to read its contents.
            fileEntry.file(function (file) {
                var reader = new FileReader();

                reader.onloadend = function (e) {
                    callback(this.result);
                };

                reader.readAsText(file);
            }, errorHandler);
        },
        errorHandler
    );
}

// example: read(fs.root, "log.txt")
// dump content of file "log.txt"
// the first agrument is the current directory

// remove files
function remove(cwd, src) {
    cwd.getFile(
        src,
        { create: false },
        function (fileEntry) {
            fileEntry.remove(function () {
                console.log("File " + src + " removed.");
            }, errorHandler);
        },
        errorHandler
    );
}

// example: remove(fs.root, "log.txt")
// remove file "log.txt" in root directory
// the first agrument is the current directory

// create directory
function createDir(cwd, dest) {
    cwd.getDirectory(dest, { create: true }, function () {}, errorHandler);
}

// example: createDir(fs.root, "Pictures")
// creates directory called "Pictures" on the filesystem root
// the first agrument is the current directory

// remove directory (recursively)
function removeDir(cwd, src) {
    cwd.getDirectory(
        src,
        {},
        function (dirEntry) {
            dirEntry.removeRecursively(function () {
                console.log("Directory " + src + " removed.");
            }, errorHandler);
        },
        errorHandler
    );
}

// example: removeDir(fs.root, "Pictures")
// remove the "Pictures" directory on the filesystem root
// the first agrument is the current directory

function changeDir(cwd, src) {
    cwd.getDirectory(
        src,
        { create: false },
        function (directoryEntry) {
            currentDirectory = directoryEntry;
            console.log(currentDirectory);
        },
        errorHandler
    );
}

// example: changeDir(fs.root, "Pictures")
// enters the "Pictures" directory on the filesystem root
// the first agrument is the current directory

// File managment
// -----------------------------

// move files
function move(src, dirName) {
    fs.root.getFile(
        src,
        {},
        function (fileEntry) {
            fs.root.getDirectory(
                dirName,
                {},
                function (dirEntry) {
                    fileEntry.moveTo(dirEntry);
                },
                errorHandler
            );
        },
        errorHandler
    );
}

// example: move('/me.png', 'newfolder/')
// moves "me.png" from the root folder to the "newfolder" folder

// move or rename files
function rename(cwd, src, newName) {
    cwd.getFile(
        src,
        {},
        function (fileEntry) {
            fileEntry.moveTo(cwd, newName);
        },
        errorHandler
    );
}

// example: rename(fs.root, 'me.png', 'you.png');
// rename file "me.png" to "you.png"
// the first agrument is the current directory

// copy files
function copy(cwd, src, dest) {
    cwd.getFile(
        src,
        {},
        function (fileEntry) {
            cwd.getDirectory(
                dest,
                {},
                function (dirEntry) {
                    fileEntry.copyTo(dirEntry);
                },
                errorHandler
            );
        },
        errorHandler
    );
}

// example: copy(fs.root, '/folder1/me.png', 'folder2/mypics/');
// copy file "me.png" located in "folder1" to "mypics" in "folder2"
// the first agrument is the current directory

// UI functions
// -----------------------------

function newFile() {
    let filename = prompt("Enter filename:");
    createEmpty(currentDirectory, filename);

    listEntries(currentDirectory);
}

function newFolder() {
    let name = prompt("Enter filename:");
    createDir(currentDirectory, name);

    update();
    listEntries(currentDirectory);
}

function openFile() {
    let filename = prompt("Enter filename:");
    fileopener(filename, getFileExtension(filename));

    update();
    listEntries(currentDirectory);
}

function renameFile() {
    let filename = prompt("Rename file to:");
    rename(currentDirectory, currentDoc, filename);

    currentDoc = "default";

    editor.setValue("");

    update();
    listEntries(currentDirectory);
}

function deleteFile() {
    remove(currentDirectory, currentDoc);

    update();
    listEntries(currentDirectory);
}
