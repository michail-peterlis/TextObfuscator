var searchList = new Map();


function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}


function obfuscateTypedChar(charStr) {
    let idx = searchList.get(charStr);
    if(idx === undefined)
        return charStr;
    let p = new Array();
    idx.forEach(function(i) {
        p.push(mainList[i]);
    });
    let c = p[getRandomInt(p.length)];
    if(c == charStr) c = p[getRandomInt(p.length)];

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
                    let p = mainList[idx[0]];
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


chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        // sendResponse($focused.tagName);

        switch(message.type) {
            case "LEVEL_0":
                document.removeEventListener("focusin", OnFocusIn, true);
                document.removeEventListener("focusout", OnFocusOut, true);
            break;

            case "LEVEL_1":
                document.addEventListener("focusin", OnFocusIn, true);
                document.addEventListener("focusout", OnFocusOut, true);

                var append = (k, v) => {
                    let mv = searchList.get(k);
                    if(mv === undefined) {
                        mv = new Array();
                        searchList.set(k, mv);
                    }
                    mv.push(v);
                };

                mainList.forEach((v, i) => {
                    v.forEach((e) => {
                        append(e, i);
                        if(e.length > 1) {
                            let mb = e.split('');
                            mb.forEach((l) => { append(l, i); });
                        }
                    });
                });
            break;
        }
    }
);
