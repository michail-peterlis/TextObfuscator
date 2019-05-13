var searchList = new Map();


function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}


function obfuscateTypedChar(charStr) {
    let idx = searchList.get(charStr);
    if(idx === undefined)
        return charStr;
    let p = mainList[idx];
    do {
        var c = p[getRandomInt(p.length)];
    } while(c == charStr);

    return c;
}

//
// function insertTextAtCursor(text) {
//     var sel, range, textNode;
//     if (document.getSelection) {
//         sel = document.getSelection();
//         if (sel.getRangeAt && sel.rangeCount) {
//             range = sel.getRangeAt(0);
//             range.deleteContents();
//             textNode = document.createTextNode(text);
//             range.insertNode(textNode);
//
//             // Move caret to the end of the newly inserted text node
//             range.setStart(textNode, textNode.length);
//             range.setEnd(textNode, textNode.length);
//             sel.removeAllRanges();
//             sel.addRange(range);
//         }
//     } else if (document.selection && document.selection.createRange) {
//         range = document.selection.createRange();
//         range.pasteHTML(text);
//     }
// }


function OnKeyPress(event) {
    event = event || window.event;
    event.preventDefault();
    var charCode = (typeof event.which == "undefined") ? event.keyCode : event.which;
    if (charCode) {
        var charStr = String.fromCharCode(charCode);
        var transformedChar = obfuscateTypedChar(charStr);
        var start = this.selectionStart;
        var end = this.selectionEnd;
        var val = this.value;
        this.value = val.slice(0, start) + transformedChar + val.slice(end);

        // Move the caret
        this.selectionStart = this.selectionEnd = start + transformedChar.length;
        // event.stopImmediatePropagation();
        return false;

        // var charStr = String.fromCharCode(charCode);
        // var greek = obfuscateTypedChar(charStr);
        // insertTextAtCursor(greek);
        // return false;
    }

    // if (event.which) {
    //     var charStr = String.fromCharCode(event.which);
    //     var transformedChar = obfuscateTypedChar(charStr);
    //     if (transformedChar != charStr) {
    //         var start = this.selectionStart, end = this.selectionEnd, val = this.value;
    //         this.value = val.slice(0, start) + transformedChar + val.slice(end);
    //
    //         // Move the caret
    //         this.selectionStart = this.selectionEnd = start + 1;
    //         return false;
    //     }
    // }
}


function OnFocusIn(event) {
    let $focused = event.target;
    if($focused === undefined)
        return;
    //$(":focus").on("keypress", OnKeyPress);
    $focused.addEventListener("keypress", OnKeyPress, true);
    $focused.style.background = 'pink';
}


function OnFocusOut(event) {
    let $focused = event.target;
    if($focused === undefined)
        return;
    $focused.removeEventListener("keypress", OnKeyPress, true);
    $focused.style.background = '';
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

                mainList.forEach(function(l, i) {
                    l.forEach(function(e) {
                        searchList.set(e, i);
                    });
                });
            break;
        }
    }
);
