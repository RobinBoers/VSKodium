// Connect to USB devices

let connectButton = document.getElementById("connectButton");
let disconnectButton = document.getElementById("disconnectButton");
let connected = document.getElementById("connected-display");
let flashButton = document.getElementById("flashButton");

// Append a line to the console frame
function consolePrintln(message) {
    var con = document.getElementById("output");
    con.innerHTML += message + "<br/>";
    con.scrollTop = con.scrollHeight;
}

// List of connected devices (a single value could be used if only connecting to one device)
var connectedDevices = [];

// Example event call-back handler
function uBitEventHandler(reason, device, data) {
    switch (reason) {
        case "connected":
            consolePrintln("Connected.");
            connectedDevices.push(device);
            flashButton.style.display = "block";
            connected.style.display = "block";
            break;
        case "disconnected":
            consolePrintln("Disconnected.");
            connectedDevices = connectedDevices.filter((v) => v != device);
            break;
        case "connection failure":
            consolePrintln("Connection Failure.");
            break;
        case "error":
            consolePrintln("Error");
            break;
        case "console":
            consolePrintln("Console Data: " + data.data);
            break;
        case "graph-event":
            consolePrintln(`Graph Event:  ${data.data} (for ${data.graph}${data.series.length ? " / series " + data.series : ""})`);
            break;
        case "graph-data":
            consolePrintln(`Graph Data: ${data.data} (for ${data.graph}${data.series.length ? " / series " + data.series : ""})`);
            break;
    }
}

connectButton.addEventListener("click", () => {
    document.getElementsByClassName("preview")[0].style.display = "block";
    document.getElementById("output").innerHTML = "";
    uBitConnectDevice(uBitEventHandler);
});

disconnectButton.addEventListener("click", () => {
    connectedDevices.forEach((d) => uBitDisconnect(d));
    flashButton.style.display = "none";
    connected.style.display = "none";
});
