importScripts('./node_modules/requirejs/require.js');
requirejs.config({
    baseUrl: 'src/',
    urlArgs: "bust=" + (new Date()).getTime(),
});
require(['test/Test'], function (Test) {
    console.log("Init slave")
    postMessage("ok", undefined);
    onmessage = (data) => {
        console.log("Slaved received buffers");
        Test.Test.slave(data.data);
    }
});
