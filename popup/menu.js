let levels;


function readLevels() {
    return browser.storage.sync.get(LevelList).then((r) => {
        if(r == undefined || r.LevelList == undefined) {
            return;
        }
        levels = r.LevelList;
        let slider = document.getElementById("levelslider");
        slider.min = 0;
        slider.max = levels.length;
    }
    , (error) => alert(error));
}


function init() {
    readLevels();
    
    // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // chrome.tabs.sendMessage(tabs[0].id, { type: "DISABLED" }, function(response) {
            // console.log(response);
        // });
    // });
    
    document.getElementById("levelslider").onmouseup = function() {
        let value = Math.abs(this.value);
        let l;
                
        if(value == 0)
            l = "DISABLED";
        else
            l = levels[value-1];
        
        console.log(l);
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { type: l }, function(response) {
                console.log(response);
            });
        });
    };
    
    document.getElementById("levelslider").oninput  = function() {
        let value = Math.abs(this.value);
        let l;   
        if(value == 0) l = "DISABLED";
        else l = levels[value-1];
        document.getElementById("leveltext").textContent = l;
    };
}


init();
