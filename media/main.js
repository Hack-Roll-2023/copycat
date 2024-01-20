//@ignore-ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    // Handle messages sent from the extension to the webview
    window.addEventListener("message", (event) => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case "addCopyCount": {
                updateCopyCount(message.value);
                break;
            }
            case "updateCopyCredit": {
                updateCopyCredit(message.value);
                break;
            }
        }
    });

    function updateCopyCount(copyCount) {
        document.querySelector(".copyCounter").textContent = `Illegal external copy 😾 = ${copyCount}`;
    }

    function updateCopyCredit(copyCount) {
        document.querySelector(".copyCredit").textContent = `Your copy credit 🤫 = ${copyCount}`;
    }
})();
