document.getElementById("levelslider").onchange = function() {
    let value = Math.abs(this.value);
    console.log(value);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type:"LEVEL_" + value}, function(response) {
//                $("#text").text(response);
        });
    });
};
