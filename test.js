requirejs.config({
    baseUrl: 'src/',
    urlArgs: "bust=" + (new Date()).getTime(),
});
require(['test/Test', "test/SyncTest"], function (Test, SyncTest) {

    console.log("Sync test");
    SyncTest.SyncTest.test();

    SyncTest.SyncTest.power();

    return;
    console.log("Init main");
    const worker = new Worker("worker.js");
    worker.onmessage = () => {
        console.log("Start test");
        Test.Test.main(worker);
    }
});
