// ==UserScript==
// @name         Search On Selection
// @version      0.2.2
// @description  Search the selected text on different sites with a single click.
// @match        *://*/*
// ==/UserScript==

const CLIPBOARD_ICON_DATA = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAAXNSR0IB2cksfwAAAAlwSFlzAAASnAAAEpwBstb/cwAAAS9QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAu8MpQAAAGV0Uk5TAAVs1OdfDwxUfdr+/9aNYhcYqeb6++vGLz9pWr/fQ05rVWV4oIy59/nggUxQXMzu2O/99KP87W50+POikOyH6sqywPLhu/DiYbHxhnx1aHnob4TSyfX2x6iWS1KPfkXlc+O+oc4SX3gfAAAA+ElEQVR4nGNggAFGJmYWVjYGdMDOwcnFzcPLxy+AJiEoJCzCwyMqJi6BJCgpxSQtKcMDBrJy8kwKilAJWR4eZiVlFTBQlVPj4VGHSmjw8GhqaSuCgY6uHlAfVEKEBx0gS+gbcGNKcBsaGfOZmGJKmGmZK1hYWllbgIGNGMIoWws7ex51B0cwcHJGssNFmBuX5cIGRpgSVq5u7h6eWCS8vH18/cTcrP3BwCYAYZRxYJAbj0awKxiEhCLZYamB0+dhAVh8HhouzMUfIRpqCAZWRgiJyKjoGA3b2DgwUNJEGBXPmpDIE5aUDAaObgSD3QuXRDKaFqMUoCAAZeIydEpSbzoAAAAASUVORK5CYII=";
(function () {
    'use strict';

    // A dictionary containing the icon, onclick, and getUrl function for each link
    const linkInfo = {
        "Copy to clipboard": {
            icon: CLIPBOARD_ICON_DATA,
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

    function isCurrentPage(url) {
        return url.replace("www.", "") === window.location.href.replace("www.", "");
    }

    // Create a dictionary of link elements
    const linkElements = {};
    for (const key in linkInfo) {
        const linkElement = document.createElement("a");
        linkElement.target = "_blank";
        linkElement.style.display = "none";
        linkElement.style.position = "absolute";

        const iconImg = document.createElement("img");
        iconImg.src = linkInfo[key].icon;
        iconImg.style.width = "24px";
        iconImg.style.height = "24px";
        iconImg.style.display = "block";
        iconImg.style.position = "absolute";
        iconImg.style.zIndex = "9999";
        iconImg.style.filter = "drop-shadow(0 0 1px #ffffff)";
        iconImg.style.position = "relative";

        linkElement.appendChild(iconImg);
        document.body.appendChild(linkElement);

        linkElements[key] = { link: linkElement };
    }

    // Handle selection changes
    function handleSelectionChange() {
        const HORIZONTAL_OFFSET = 1;
        const RIGHT_PADDING = 15;

        const selection = document.getSelection();
        if (selection.toString().length) {
            // Find the links that should be visible
            const visibleLinkKeys = [];
            for (const key in linkElements) {
                const currentLinkElement = linkElements[key];
                const currentLinkInfo = linkInfo[key];

                let linkUrl = currentLinkInfo.getUrl(selection.toString());

                if (linkUrl !== null) {
                    // Don't show the link if it's the current page
                    if (isCurrentPage(linkUrl)) {
                        currentLinkElement.link.style.display = "none";
                        continue;
                    }
                }

                visibleLinkKeys.push(key);
            }

            const selectionRange = selection.getRangeAt(0);
            const selectionBoundingRect = selectionRange.getBoundingClientRect();
            
            // Update the visible links urls, onclicks, and positions
            for (let i = 0; i < visibleLinkKeys.length; i++) {
                let key = visibleLinkKeys[i];
                const currentLinkElement = linkElements[key];
                const currentLinkInfo = linkInfo[key];
                currentLinkElement.link.style.top = selectionBoundingRect.bottom + window.pageYOffset - i * (currentLinkElement.link.offsetHeight + HORIZONTAL_OFFSET) + "px";
                currentLinkElement.link.style.left = selectionBoundingRect.right + window.pageXOffset + RIGHT_PADDING + "px";
                currentLinkElement.link.style.display = "block";

                const currentLinkUrl = currentLinkInfo.getUrl(selection.toString());
                if (currentLinkUrl !== null) {
                    currentLinkElement.link.href = currentLinkUrl;
                }

                currentLinkElement.link.onclick = currentLinkInfo.onclick.bind(null, selection.toString());
            }
        } else {
            // Hide all elements if there is no selection
            for (const key in linkElements) {
                const linkElement = linkElements[key];
                linkElement.link.style.display = "none";
            }
        }
    }

    document.addEventListener("selectionchange", handleSelectionChange);
})();
