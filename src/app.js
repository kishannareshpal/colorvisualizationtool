// utils
let isDark = false;

// components
var textarea;
var colorsDiv; // the div which will show the colors typed in the textarea.


document.addEventListener('DOMContentLoaded', function () {
    // web page is ready!
    setup();


    // Dark mode toggle (Light mode is the default):
    const toggleDarkBtn = document.querySelector(".toggle-dark");
    toggleDarkBtn.addEventListener('click', function() {
        setDarkModeEnabled(!isDark);
    });
});



function setup() {
    // Initialize the components
    textarea = document.querySelector("#textarea");
    colorsGrid = document.querySelector("#colorsGrid");

    // Initialize the colors grid as Muuri. For drag-and-drop & sort support.
    // use this var to append new items (colors) to the grid.
    var grid = new Muuri('.grid', {
        dragEnabled: true,
        dragSort: true
    });

    // Make the text area height, dynamic. Change the height to fit the content.
    autosize(textarea);

    // Enable dark mode based on the browser color scheme
    setDarkModeEnabled(doesBrowserPreferDarkMode())

    // Detect browser changes to dark and light mode, and update this page's color scheme accordingly
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        const darkModeEnabled = event.matches;
        setDarkModeEnabled(darkModeEnabled);
    })
    
    // Check out our colors everytime the textarea's value changes.
    textarea.addEventListener('input', function () {
        // Grab the text inside the textarea.
        const value = textarea.value;

        // Now check if the text contains any hex color codes.
        let hexColorCodeRegexMatcher = /(#([\da-f]{3}){1,2}|(rgb|hsl)a\((\d{1,3}%?,\s?){3}(1|0?\.\d+)\)|(rgb|hsl)\(\d{1,3}%?(,\s?\d{1,3}%?){2}\))/ig // hex color code regex matcher.
        // let hexColorCodeRegexMatcher = /(?:#)[0-9a-f]{8}|(?:#)[0-9a-f]{6}|(?:#)[0-9a-f]{4}|(?:#)[0-9a-f]{3}/ig // hex color code regex matcher.
        // match the current text on the input against the hex regex, and get a list of all the colors in it.
        const matchedColorsList = value.match(hexColorCodeRegexMatcher);

        // Clear the colors grid from any previous colors.
        grid.remove(grid.getItems(), { removeElements: true });

        // No hex colors were typed in the textarea. No need to do anything else.
        if (matchedColorsList == undefined) return; // if no colors were matched. abort.

        // Some colors found on the textarea.
        // loop through them all and show it in little cards.
        matchedColorsList.forEach(colorVal => {

            const item_div = document.createElement("div")
            item_div.style.zIndex = 1;
            item_div.classList.add("item");

            const itemContent_div = document.createElement("div")
            itemContent_div.classList.add("item-content");

            const colorcard_div = document.createElement("div");
            colorcard_div.classList.add("card");
            colorcard_div.style.backgroundColor = colorVal;
            
            itemContent_div.appendChild(colorcard_div);
            item_div.appendChild(itemContent_div);
            grid.add(item_div); // add the color to the grid.


            // Setup actions on the card:
            // Whenever the user clicks on this card,
            // the color will be selected on the textarea. neat, innit.
            colorcard_div.addEventListener('click', (event) => selectText(colorVal));

            // Also show the hex color code on hover.
            var hoverText = "<span style='background-color: yellow'>" + colorVal + "</span>" + "<br>";
                hoverText += "<b>RGB</b>: " + colorcard_div.style.backgroundColor;

            tippy(colorcard_div, {
                inertia: true,
                animation: 'shift-away',
                allowHTML: true,
                theme: 'light-border',
                interactiveBorder: 10,
                content: hoverText,
                maxWidth: 'none',
                zIndex: 10000,
                moveTransition: 'transform 0.2s ease-out'
            })
        });
    })
}


/**
 * Selects the {@constant text} on the input.
 * 
 * @param {String} text the text string you want to select on the input.
 */
function selectText(text) {
    if (text == null) return; // do nothing

    // Grab the value from the input
    const value = textarea.value;

    // find the color in the input
    const query = escapeRegExp(text); // escape our text because {String#query} accepts a regex, 
                                      // and if the text contains any regex character you would have unpredicted results.

    // the range of selection.
    const selectionStartPosition = value.search(query); // will return the index of where the first character of the query is located in our original string.
    const selectionEndPosition  = selectionStartPosition + text.length;
    
    if (selectionStartPosition == -1) {
        // Did not find the color hex typed in the input..
        // do nothing..
        return;
    }

    textarea.focus();
    textarea.setSelectionRange(selectionStartPosition, selectionEndPosition);


    // Now scroll to where we selected
    var charsPerRow = textarea.cols; // get the nr of chars in a row on this textarea.
    var selectionRow = (selectionStartPosition - (selectionStartPosition % charsPerRow)) / charsPerRow; // find out in which row our selection is.

    // we need to scroll to this row but scrolls are in pixels,
    // so we need to know a row's height, in pixels
    var lineHeight = textarea.clientHeight / textarea.rows;
    textarea.scrollTop = lineHeight * selectionRow; // scroll !!
}



/**
 * Enable dark mode on the entire page.
 * Default: According to browser preferences.
 * 
 * @param {Boolean} enabled true means, dark mode enabled. false, light mode enabled.
 */
function setDarkModeEnabled(enabled) {
    // Toggle dark mode.
    isDark = enabled;

    const content = document.querySelector(".content");
    const body = document.querySelector("body");
    
    // toggle dark mode
    document.querySelector(".title").style.color = isDark ? "#eee" : "#000";
    textarea.style.color = isDark ? "#fff" : "#000";
    body.style.color = isDark ? "#eee" : "#000";
    body.style.backgroundColor = isDark ? "#282736" : "#FBFDFE";
    content.style.backgroundColor = isDark ? "#222435" : "#FBFDFE";
}



/**
 * Returns true if the browser is set to dark color scheme.
 * 
 * @returns {Boolean} true if the browser is set to use dark color scheme, 
 *                    or false if it is set to use the light color scheme.
 */
function doesBrowserPreferDarkMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}


function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }