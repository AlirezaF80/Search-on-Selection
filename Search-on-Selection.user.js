// ==UserScript==
// @name         Search On Selection
// @version      0.1
// @description  Search the selected text on different sites with a single click.
// @match        *://*/*
// ==/UserScript==

(function () {
    'use strict';
    // Define a dictionary that contains the link and icon information
    const links = {
        "Google": {
            icon: "https://www.google.com/s2/favicons?sz=32&domain=google.com",
            urlFunction: function (name) {
                return "https://www.google.com/search?q=" + name;
            }
        }
    };

    // Create a dictionary of link elements and icon elements
    const elements = {};
    for (const key in links) {
        const link = document.createElement("a");
        link.href = links[key].url;
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


    // Handle selection changes
    document.addEventListener("selectionchange", function () {
        const selection = document.getSelection();
        if (selection.toString().length) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const topOffset = 1;
            const rightOffset = 15;

            // first find what elements to show
            const keysToShow = [];

            for (const key in elements) {
                const element = elements[key];
                const linkInfo = links[key];
                let link = linkInfo.urlFunction(selection.toString());
                // check if link is the same as the page we're on, if so, don't show the link
                if (link.replace("www.", "") === window.location.href.replace("www.", "")) { // this check takes www. into account
                    element.link.style.display = "none";
                    element.icon.style.display = "none";
                    continue;
                }
                keysToShow.push(key);
            }

            // then set the positions of the elements
            for (let i = 0; i < keysToShow.length; i++) {
                let key = keysToShow[i];
                const element = elements[key];
                const linkInfo = links[key];
                const link = linkInfo.urlFunction(selection.toString());
                element.link.style.top = rect.top + window.pageYOffset + "px";
                element.link.style.left = rect.right + window.pageXOffset + rightOffset + "px";
                element.link.style.display = "block";
                const iconTop = rect.bottom + window.pageYOffset - i * (element.icon.offsetHeight + topOffset);
                element.icon.style.top = iconTop + "px";
                element.icon.style.left = rect.right + window.pageXOffset + rightOffset + "px";
                element.icon.style.display = "block";

                element.link.href = link;
            }
        } else {
            for (const key in elements) {
                const element = elements[key];
                element.link.style.display = "none";
                element.icon.style.display = "none";
            }
        }
    });
})();
