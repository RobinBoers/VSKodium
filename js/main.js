let editor;
let vim = false;
let currentDoc = "default";

let localStorage = window.localStorage;

let darkTheme = localStorage.getItem("darkTheme") || false;

var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

if (!isChrome) {
    alert("This editor is made specificly for Google Chrome/Chromium. It uses Chrome-only APIs so some features might not work on other browsers. Sorry Firefox users :( \n \nIf you are using Chrome/Chromium that means my browser detection is broken and I would appriciate it if you would send me an e-mail :D");
}

$(document).ready(function () {
    let code = document.getElementById("input");
    editor = CodeMirror.fromTextArea(code, {
        lineNumbers: true,
        lineWrapping: true,
        matchBrackets: true,
        matchTag: true,
        showCursorWhenSelecting: true,
        autofocus: true,
        spellcheck: false,
        autocorrect: false,
        autocapitalize: false,
        autoCloseBrackets: true,
        autoCloseTags: true,
        highlightSelectionMatches: true,
        styleActiveLine: true,
        keyMap: "default",
        mode: "htmlmixed",
        theme: "neo",
        extraKeys: {
            F11: function (cm) {
                cm.setOption("fullScreen", !cm.getOption("fullScreen"));
            },
            "Alt-Z": function () {
                if (editor.getOption("lineWrapping") == true) editor.setOption("lineWrapping", false);
                else editor.setOption("lineWrapping", true);
            },
            "Ctrl-P": function () {
                toggleVIM();
            },
            "Ctrl-O": function () {
                openFile();
            },
            "Ctrl-N": function () {
                newFile();
            },
            "Ctrl-U": function () {
                alert("Coming soon.");
            },
            "Ctrl-Q": function () {
                quitVSK();
            },
        },
    });

    if (darkTheme) {
        editor.setOption("theme", "ayu-dark");
        document.getElementById("root").className = "ayu";
    }

    editor.on("keyup", function (cm, event) {
        if (!vim && !cm.state.completionActive /*Enables keyboard navigation in autocomplete list*/ && event.keyCode != 13 && event.keyCode != 32 && event.keyCode != 9 && event.keyCode != 27 && event.keyCode != 8 && event.keyCode != 221 && event.keyCode != 219 && event.keyCode != 48 && event.keyCode != 57 && event.keyCode != 188 && event.keyCode != 190 && event.keyCode != 191 && event.keyCode != 16 && event.keyCode != 59) {
            /*Do not autocomplete when pressing Enter, Space, Tab, Esc, Backspace, Shift, any bracket or ; */
            CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
        }
        update();
    });

    var commandDisplay = document.getElementById("command-display");
    var keys = "";

    editor.on("vim-keypress", function (key) {
        keys = keys + key;
        commandDisplay.innerText = keys;
    });

    editor.on("vim-command-done", function (e) {
        keys = "";
        commandDisplay.innerHTML = keys;
    });

    var vimMode = document.getElementById("vim-mode");
    editor.on("vim-mode-change", function (e) {
        vimMode.innerText = e["mode"];
    });

    CodeMirror.commands.save = function () {
        save();
    };

    update();
    document.getElementById("fs-size").innerHTML = fsSize + "MB";
});

function update() {
    if (editor.options.mode == "htmlmixed" || connected.style.display == "block") {
        document.getElementsByClassName("preview")[0].style.display = "block";
        document.getElementById("output").innerHTML = editor.getValue();
    } else if (editor.options.mode == "markdown") {
        var converter = new showdown.Converter();
        let convertedToHTML = converter.makeHtml(editor.getValue());
        document.getElementsByClassName("preview")[0].style.display = "block";
        document.getElementById("output").innerHTML = convertedToHTML;
    } else {
        document.getElementsByClassName("preview")[0].style.display = "none";
        console.log("hidden");
    }
}

function toggleVIM() {
    if (vim == true) {
        vim = false;
        editor.setOption("keyMap", "default");
        document.getElementById("vim-toolbar").style.display = "none";

        console.log("VIM mode off.");
    } else {
        vim = true;
        editor.setOption("keyMap", "vim");
        document.getElementById("vim-toolbar").style.display = "block";

        console.log("VIM mode on.");
    }
}

function save() {
    data = editor.getValue();

    console.log("Saving...");
    overwrite(currentDirectory, data, currentDoc);
}

function fileopener(src, mode) {
    console.log("Opened " + src + ".");

    if (!mode) mode = "python";

    mode = langs[mode];

    read(currentDirectory, src, function (data) {
        // CodeMirror.Doc(data, mode);

        editor.setOption("value", data);
        editor.setOption("mode", mode);

        currentDoc = src;

        update();
        document.getElementById("lang-display").innerHTML = mode;
    });

    var nodes = document.getElementById("files").childNodes;

    for (i = 0; i < nodes.length; i++) {
        nodes[i].classList.remove("selected");
        if (nodes[i].innerText == src) {
            nodes[i].classList.add("selected");
        }
    }
}

function diropener(src) {
    console.log("Opened " + src + " directory.");

    changeDir(currentDirectory, src);
    listEntries(currentDirectory);
}

function updir() {
    console.log("Going one directory up.");

    currentDirectory.getParent(function (parent) {
        console.log("Openend " + parent.name + " directory.");
        currentDirectory = parent;
        update();

        listEntries(currentDirectory);
    });
}

function downloadFile() {
    read(currentDirectory, currentDoc, function (data) {
        let blob = new Blob([data], { type: "text/plain" });
        downloadBlob(blob, currentDoc);
    });
}

function quitVSK() {
    if (confirm("Close Window?")) {
        close();
    }
}

function switchTheme() {
    if (darkTheme) {
        darkTheme = false;
        editor.setOption("theme", "neo");
        document.getElementById("root").className = "neo";
        localStorage.setItem("darkTheme", false);
    } else {
        darkTheme = true;
        editor.setOption("theme", "ayu-dark");
        document.getElementById("root").className = "ayu";
        localStorage.setItem("darkTheme", true);
    }
}
