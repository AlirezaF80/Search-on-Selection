// ==UserScript==
// @name         Search On Selection
// @version      0.2.1
// @description  Search the selected text on different sites with a single click.
// @match        *://*/*
// ==/UserScript==

(function () {
    'use strict';

    function tempAlert(message, duration) {
        const textElement = document.createElement("span");
        textElement.setAttribute("style", "color:white; ");
        textElement.innerHTML = message;
        
        const alertBackgroundElement = document.createElement("div");
        alertBackgroundElement.setAttribute("style", "position:absolute;bottom:0%;left:50%;background-color:black;border-radius:5px;padding:5px;");
        
        alertBackgroundElement.appendChild(textElement);

        setTimeout(function () {
            alertBackgroundElement.parentNode.removeChild(alertBackgroundElement);
        }, duration);
        document.body.appendChild(alertBackgroundElement);
    }
    
    // Define a dictionary that contains the link, icon, and onclick function for each link
    const links = {
        "Copy to clipboard": {
            icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAAXNSR0IB2cksfwAAAAlwSFlzAAASnAAAEpwBstb/cwAAAS9QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAu8MpQAAAGV0Uk5TAAVs1OdfDwxUfdr+/9aNYhcYqeb6++vGLz9pWr/fQ05rVWV4oIy59/nggUxQXMzu2O/99KP87W50+POikOyH6sqywPLhu/DiYbHxhnx1aHnob4TSyfX2x6iWS1KPfkXlc+O+oc4SX3gfAAAA+ElEQVR4nGNggAFGJmYWVjYGdMDOwcnFzcPLxy+AJiEoJCzCwyMqJi6BJCgpxSQtKcMDBrJy8kwKilAJWR4eZiVlFTBQlVPj4VGHSmjw8GhqaSuCgY6uHlAfVEKEBx0gS+gbcGNKcBsaGfOZmGJKmGmZK1hYWllbgIGNGMIoWws7ex51B0cwcHJGssNFmBuX5cIGRpgSVq5u7h6eWCS8vH18/cTcrP3BwCYAYZRxYJAbj0awKxiEhCLZYamB0+dhAVh8HhouzMUfIRpqCAZWRgiJyKjoGA3b2DgwUNJEGBXPmpDIE5aUDAaObgSD3QuXRDKaFqMUoCAAZeIydEpSbzoAAAAASUVORK5CYII=",
            onclick: function (selectedText) {
                navigator.clipboard.writeText(selectedText);
                tempAlert("Copied to Clipboard!", 1000);
            },
            getUrl: function (selectedText) { return null; }
        },
        "Google": {
            icon: "https://www.google.com/s2/favicons?sz=32&domain=google.com",
            onclick: function (selectedText) { },
            getUrl: function (selectedText) {
                return "https://www.google.com/search?q=" + selectedText;
            }
        }
    };

    // Create a dictionary of link elements and icon elements
    const elements = {};
    for (const key in links) {
        const link = document.createElement("a");
        link.target = "_blank";
        link.style.display = "none";

        const iconImg = document.createElement("img");
        iconImg.src = links[key].icon;
        iconImg.style.width = "24px";
        iconImg.style.height = "24px";
        iconImg.style.display = "none";
        iconImg.style.position = "absolute";
        iconImg.style.zIndex = "9999";
        iconImg.style.filter = "drop-shadow(0 0 1px #ffffff)";

        link.appendChild(iconImg);
        document.body.appendChild(link);

        elements[key] = { link: link, icon: iconImg };
    }

    function isCurrentPage(url) {
        return url.replace("www.", "") === window.location.href.replace("www.", "");
    }


    // Handle selection changes
    function handleSelectionChange() {
        const HORIZONTAL_OFFSET = 1;
        const RIGHT_PADDING = 15;

        const selection = document.getSelection();
        if (selection.toString().length) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // Find elements to show based on the selected text
            const keysToShow = [];
            for (const key in elements) {
                const element = elements[key];
                const linkInfo = links[key];

                let link = linkInfo.getUrl(selection.toString());

                if (link !== null) {
                    // check if link is the same as the page we're on, if so, don't show the link
                    if (isCurrentPage(link)) {
                        element.link.style.display = "none";
                        element.icon.style.display = "none";
                        continue;
                    }
                }

                keysToShow.push(key);
            }

            // then set the positions of the elements
            for (let i = 0; i < keysToShow.length; i++) {
                let key = keysToShow[i];
                const element = elements[key];
                const linkInfo = links[key];
                element.link.style.top = rect.top + window.pageYOffset + "px";
                element.link.style.left = rect.right + window.pageXOffset + RIGHT_PADDING + "px";
                element.link.style.display = "block";
                const iconTop = rect.bottom + window.pageYOffset - i * (element.icon.offsetHeight + HORIZONTAL_OFFSET);
                element.icon.style.top = iconTop + "px";
                element.icon.style.left = rect.right + window.pageXOffset + RIGHT_PADDING + "px";
                element.icon.style.display = "block";

                const link = linkInfo.getUrl(selection.toString());
                if (link !== null) {
                    element.link.href = link;
                }

                element.link.onclick = linkInfo.onclick.bind(null, selection.toString());
            }
        } else {
            // Hide all elements if there is no selection
            for (const key in elements) {
                const element = elements[key];
                element.link.style.display = "none";
                element.icon.style.display = "none";
            }
        }
    }

    document.addEventListener("selectionchange", handleSelectionChange);
})();
