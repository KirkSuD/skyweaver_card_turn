(function() {
'use strict';

try {

console.log("Skyweaver card turn:", "start");

const isFirefox = typeof browser != "undefined";
const thebrowser = isFirefox ? browser : chrome;
console.log("Skyweaver card turn:", "isFirefox:", isFirefox);
// console.log("Skyweaver card turn:", "browser:", thebrowser);

// if there's registered service worker, unregister & refresh
//   because Chrome service worker would cache script
// const dummy = () => {};
// navigator.serviceWorker.register = () => new Promise(dummy, dummy);
// navigator.serviceWorker.addEventListener("install", function(e) {
//     console.log("Skyweaver card turn:", "service worker install:", e);
// });
navigator.serviceWorker.getRegistrations().then(function(registrations) {
    if (registrations.length > 0) {
        for(let registration of registrations) {
            console.log("Skyweaver card turn:", "remove service worker:", registration);
            registration.unregister();
        }
        location.reload(true);
    }
});
function messageListner(msg) {
    console.log("Skyweaver card turn:", "received patched script");
    // insert script to body
    const newScript = document.createElement("script");
    newScript.textContent = msg;
    document.getElementsByTagName("body")[0].appendChild(newScript);
    console.log("Skyweaver card turn:", "patched script");
    thebrowser.runtime.onMessage.removeListener(messageListner);
}
thebrowser.runtime.onMessage.addListener(messageListner);
console.log("Skyweaver card turn:", "finish");

}
catch (error) {
    console.log("Skyweaver card turn:", "error:", error);
}

})();
