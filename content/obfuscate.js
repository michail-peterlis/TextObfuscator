var searchList = new Map();
var table;
let lastInput;

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}


function obfuscateTypedChar(charStr) {
    let idx = searchList.get(charStr);
    let c;
    if(idx === undefined)
        return charStr;
    let p = new Array();
    if(idx.length == 1) {
        table[idx[0]].forEach(function(i) { p.push(i); });
        c = p[getRandomInt(p.length)];
        if(c == charStr) c = p[getRandomInt(p.length)];
    }
    else {
        idx.forEach((i) => {
            if(table[i].find((e) => { return e == charStr; })) {
                p = table[i];
                c = p[getRandomInt(p.length)];
                if(c == charStr) c = p[getRandomInt(p.length)];
                // lastInput += charStr;
            }
        });
    }
    if(c === undefined)
        c = charStr;
    return c;
}


function OnKeyPress(event) {
    event = event || window.event;
    event.preventDefault();
    var charCode = (typeof event.which == "undefined") ? event.keyCode : event.which;
    if (charCode) {
        let charStr = String.fromCharCode(charCode);
        let transformedChar = obfuscateTypedChar(charStr);

        // firefox <input>/<textarea> workaround
        if(this.selectionStart != undefined) {
            let start = this.selectionStart;
            let end = this.selectionEnd;
            let val = this.value;

            let idx = searchList.get(charStr);
            if(idx != undefined) {
                if(idx.length == 1) {
                    let p = table[idx[0]];
                    transformedChar = p[getRandomInt(p.length)];
                    if(transformedChar == charStr) transformedChar = p[getRandomInt(p.length)];
                }
                else {
                    // what now????
                }
            }

            this.value = val.slice(0, start) + transformedChar + val.slice(end);
            this.selectionStart = this.selectionEnd = start + transformedChar.length;
        }
        else  {
            let doc = this.ownerDocument || this.document;
            let win = doc.defaultView || doc.parentWindow;
            let sel;
            if (win.getSelection != undefined) {
                sel = win.getSelection();
                if (sel.rangeCount > 0) {
                    let range = sel.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(document.createTextNode(transformedChar));
                    range.setStart(range.endContainer, range.endOffset);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        }
        // else if (document.selection && document.selection.createRange) {
        //     range = document.selection.createRange();
        //     range.text = transformedChar;
        // }
        return false;
    }
}


function OnFocusIn(event) {
    let focused = event.target;
    if(focused === undefined)
        return;
    focused.addEventListener("keypress", OnKeyPress, true);
    focused.style.background = '#ffb3d9';
}


function OnFocusOut(event) {
    let focused = event.target;
    if(focused === undefined)
        return;
    focused.removeEventListener("keypress", OnKeyPress, true);
    focused.style.background = '';
}


async function switchLevel(message, sender, sendResponse) {
    // sendResponse($focused.tagName);

    if(message.type == "DISABLED") {
        document.removeEventListener("focusin", OnFocusIn, true);
        document.removeEventListener("focusout", OnFocusOut, true);
    }
    else {        
        await browser.storage.sync.get(message.type).then((l) => {
            table = l[message.type];
                    
            searchList.clear();

            var append = (k, v) => {
                let mv = searchList.get(k);
                if(mv === undefined) {
                    mv = new Array();
                    searchList.set(k, mv);
                }
                mv.push(v);
            };

            table.forEach((v, k) => {
                v.forEach((e) => {
                    append(e, k);
                    if(e.length > 1) {
                        let mb = e.split('');
                        mb.forEach((l) => { append(l, k); });
                    }
                });
            });
            
            document.addEventListener("focusin", OnFocusIn, true);
            document.addEventListener("focusout", OnFocusOut, true);
        });
    }
}



chrome.runtime.onMessage.addListener(switchLevel);
