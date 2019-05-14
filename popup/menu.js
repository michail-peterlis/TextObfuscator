
$(document).ready(function() {
    $("#LEVEL_0").click(() => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {type:"LEVEL_0"}, function(response) {
//                $("#text").text(response);
            });
        });
    });



    var activeTabId;

    chrome.tabs.onActivated.addListener(function(activeInfo) {
      activeTabId = activeInfo.tabId;
    });


    $("#LEVEL_1").click(() => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {type:"LEVEL_1"}, function(response) {
//                $("#text").text(response);
            });
        });
    });
});
