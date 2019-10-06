"use strict";

let   currentRow    = null;
let   currentOption = null;
const PLACEHOLDER   = "[PLACEHOLDER]";
let   levels        = new Map();


function init() {
    document.getElementById("levelSelect").onchange = switchLevel;
    document.getElementById("newLevel").onclick = newLevel;
    document.getElementById("deleteLevel").onclick = deleteLevel;
    document.getElementById("save").onclick = storeSettings;
    document.getElementById("reset").onclick = restoreDefaults;
    document.getElementById("export").onclick = exportSettings;
    document.getElementById("import").onclick = () => { document.getElementById("choseFile").click(); };
    document.getElementById("choseFile").onchange = importSettings;
    
    readSettings()
        .then(reloadView);
}


async function readSettings(e, first = false) {
    if(e != undefined)
        e.preventDefault();
    
    let ll = await browser.storage.sync.get("LevelList");
    if(ll == undefined || ll.LevelList == undefined) {
        await storeDefaults();
        if(first != true)
            await readSettings(e, true);
        return;
    }
            
    let promises = [];
    ll.LevelList.forEach((i) => {
        promises.push(browser.storage.sync.get(i).then((l) => {
            levels.set(i, l[i])
        }));
    });
    return Promise.all(promises);
    
// }
// , (error) => alert(error));
        
    // defaultOptions.forEach((e) => {
        // browser.storage.sync.set(e)
            // .then(setItem, onError);
    // });
}


async function storeSettings() {
    let l = document.getElementById("levelSelect");
    let s = l.value;
    
    if(s != "") {
        l.remove(l.selectedIndex); 
        levels.delete(s);
    
        s = document.getElementById("nameLevel").value;
        let tbl = document.getElementById("settings_table");
        let tableInfo = Array.prototype.map.call(tbl.querySelectorAll('tr'), (tr) => {
            return Array.prototype.map.call(tr.querySelectorAll('td'), (td) => {
                let x = td.innerText;
                if(x == PLACEHOLDER)
                    return;
                return x;
            });
        });
        
        tableInfo = tableInfo.filter((i) => {
            i = i.filter((u) => { return u != undefined; });
            return i.length > 0;
        });
        
        levels.set(s, tableInfo);
        
        let option = document.createElement("option");
        option.text = s;
        l.add(option);
        l.value = s;
        
        await browser.storage.sync.set({ LevelList: Array.from(levels.keys()) });
        let constructJson = (jsonKey, jsonValue) => {
            let jsonObj = {};
            jsonObj[jsonKey] = jsonValue;
            return jsonObj;
        };
        
        let promises = [];
        levels.forEach((v, k) => {
            promises.push(browser.storage.sync.set(constructJson(k, v)));
        });
        return Promise.all(promises);
    }
}


function unicodeLength(str) {
    return [...str].length;
}


function string_as_unicode_escape(input) {
    if(input == undefined)
        return;
    
    let pad_four = (input) => { return ' \\u' + "0".repeat(4 - input.length) + input; }

    let output = '';
    for (let i = 0, l = input.length; i < l; i++)
        output += pad_four(input.charCodeAt(i).toString(16).toUpperCase());
    return output;
}


function createSettingsTable(table) {
    let id = "settings_table";
    let target = document.getElementById("settings_column");
    
    while (target.firstChild)
        target.removeChild(target.firstChild);
    
    let tbl  = document.createElement('table');
    tbl.id = id;
    tbl.style.border = '1px solid black';
    
    for(let i = 0; i < table.length; i++){
        let tr = tbl.insertRow();
        tr.onclick = markSettingRow;

        for(let j = 0; j < table[i].length; j++){
            let c = table[i][j];
            if(c != undefined) {
                let td = tr.insertCell();
                td.ondblclick = delConfusable;

                let d = document.createElement("div");
                d.textContent = c;
                d.title = string_as_unicode_escape(c);
                
                td.appendChild(d);
            }
        }
    }
    
    let tr = tbl.insertRow();
    tr.onclick = markSettingRow;
    let td = tr.insertCell();
    let d = document.createElement("div");
    d.textContent = PLACEHOLDER;
    td.appendChild(d);
    
    target.appendChild(tbl);
}


function createSuggestionTable() {
    let id = "suggestion_table";
    let target = document.getElementById("suggestion_column");
    let table = confusablesSummary;
    
    while (target.firstChild)
        target.removeChild(target.firstChild);
    
    let tbl  = document.createElement('table');
    tbl.id = id;
        
    for(let i = 0; i < table.length; i++){
        let tr = tbl.insertRow();
        
        for(let j = 0; j < table[i].length; j++){
            let td = tr.insertCell();
            let b = document.createElement("input");
            b.type = "button";
            b.classList.add("suggestionButton");
            b.title = string_as_unicode_escape(table[i][j]);
            b.value = (table[i][j] == " " ? "SPACE" : table[i][j]);
            b.onclick = addConfusable;
            td.appendChild(b);
        }
    }
    target.appendChild(tbl);
}


function markSettingRow(elmt) {
    if(currentRow != undefined)
        currentRow.classList.remove("markedRow");
    currentRow = elmt.target.parentNode.parentNode;
    currentRow.classList.add("markedRow");
}


function addConfusable(elmt) {
    if(currentRow != undefined) {
        for(let i=0, cell; cell = currentRow.childNodes[i]; ++i)
            if(cell.innerText == PLACEHOLDER) {
                currentRow.removeChild(cell);
                let tbl = currentRow.parentElement;
                let tr = tbl.insertRow();
                tr.onclick = markSettingRow;
                let td = tr.insertCell();
                let d = document.createElement("div");
                d.textContent = PLACEHOLDER;
                td.appendChild(d);
            }
        let td = currentRow.insertCell();
        td.ondblclick = delConfusable;
        let d = document.createElement("div");
        d.textContent = this.value;
        d.title = string_as_unicode_escape(this.value);
        td.appendChild(d);
    }
}


function delConfusable(elmt) {
    let td = elmt.target;
    while(td.nodeName != "TD" && td != undefined)
        td = td.parentElement;
    if(td == undefined)
        return;
    let tr = td.parentNode;
    tr.removeChild(td);
    
    if(tr.childNodes.length == undefined || tr.childNodes.length == 0) {
        td = tr.insertCell();
        let d = document.createElement("div");
        d.textContent = PLACEHOLDER;
        td.appendChild(d);
    }
}


function switchLevel() {
    let s = document.getElementById("levelSelect").value;
     if(s != "") {
        let t = levels.get(s);
        createSettingsTable(t);
        document.getElementById("nameLevel").value = s;
     }
}


function newLevel() {
    levels.set("NewLevel", new Array());
    let l = document.getElementById("levelSelect");
    let o = document.createElement("option");
    o.text = "NewLevel";
    l.add(o);
    l.value = "NewLevel";
    
    createSuggestionTable();
    switchLevel();
}


async function deleteLevel() {
    let l = document.getElementById("levelSelect");
    let s = l.value;
    if(s != "") {
        l.remove(l.selectedIndex);
        let a = new Array();
        for(let i=0; i<l.options.length; ++i)
            a.push(l[i].text);
    
        await browser.storage.sync.set({ LevelList: a });
        await browser.storage.sync.remove(s);
        levels.delete(s);
    }
    
    switchLevel();
}


function reloadView() {
    let l = document.getElementById("levelSelect");
    while (l.options.length > 0)
        l.remove(0);
    
    levels.forEach((v, k) => {
        let option = document.createElement("option");
        option.text = k;
        l.add(option);
    });
    
    createSuggestionTable();
    switchLevel();
}


async function restoreDefaults() {
    await storeDefaults();
    readSettings().then(reloadView);
}


function exportSettings() {
    let s = document.getElementById("levelSelect").value;
    if(s != "") {
        let tbl = document.getElementById("settings_table");
        let tableInfo = Array.prototype.map.call(tbl.querySelectorAll('tr'), (tr) => {
            return Array.prototype.map.call(tr.querySelectorAll('td'), (td) => {
                let x = td.innerText;
                if(x == PLACEHOLDER)
                    return;
                return x;
            });
        });
        
        tableInfo = tableInfo.filter((i) => {
            i = i.filter((u) => { return u != undefined; });
            return i.length > 0;
        });
        
        exportToJsonFile(tableInfo);
    }
}


function importSettings() {
    let cf = document.getElementById("choseFile");
    if(cf.files.length > 0) {
        newLevel();
        let fr = new FileReader();
        fr.onloadend = function(e) {
            let json = JSON.parse(e.target.result);
            levels.set("NewLevel", json);
            switchLevel();
        };
        fr.readAsText(cf.files[0], "UTF-8");
    }
}


function exportToJsonFile(jsonData) {
    let dataStr = JSON.stringify(jsonData);
    let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    let exportFileDefaultName = 'export.json';
    
    let blob = new Blob([dataStr], {type: dataUri});
    let objectURL = URL.createObjectURL(blob);
    browser.downloads.download({'url': objectURL,
    'filename': exportFileDefaultName}).then((id) => {
        browser.downloads.show(id);
    });
    
    // let linkElement = document.createElement('a');
    // linkElement.setAttribute('href', dataUri);
    // linkElement.setAttribute('download', exportFileDefaultName);
    // linkElement.click();
}


init();
