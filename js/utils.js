function toArray(list) {
    return Array.prototype.slice.call(list || [], 0);
}

// Shortcuts

$(document).on("keydown", function (e) {
    var kc = e.which || e.keyCode;

    // if (e.ctrlKey && e.shiftKey && String.fromCharCode(kc).toUpperCase() == "S") {
    //   e.preventDefault();
    //   downloadFile();
    // }

    // if (e.ctrlKey && String.fromCharCode(kc).toUpperCase() == "U") {
    //   e.preventDefault();
    //   alert("Coming soon.");
    // }

    // if (e.ctrlKey && String.fromCharCode(kc).toUpperCase() == "O") {
    //   e.preventDefault();
    //   openFile();
    // }

    // if (e.ctrlKey && String.fromCharCode(kc).toUpperCase() == "N") {
    //   e.preventDefault();
    //   newFile();
    // }

    // if (e.ctrlKey && String.fromCharCode(kc).toUpperCase() == "Q") {
    //     e.preventDefault();
    //     // toggleVIM();
    //     quitVSK();
    // }

    // if (e.ctrlKey && String.fromCharCode(kc).toUpperCase() == "P") {
    //   e.preventDefault();
    //   toggleVIM();
    // }
});

// Download blobs

function downloadBlob(blob, name = "file.txt") {
    // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
    const blobUrl = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement("a");

    // Set link's href to point to the Blob URL
    link.href = blobUrl;
    link.download = name;

    // Append link to the body
    document.body.appendChild(link);

    // Dispatch click event on the link
    // This is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(
        new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
        })
    );

    // Remove link from body
    document.body.removeChild(link);
}

function getURI() {
    return window.location.protocol + "//" + window.location.hostname;
}

function getFileExtension(filename) {
    return filename.substring(filename.lastIndexOf(".") + 1, filename.length) || filename;
}
