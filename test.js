requirejs.config({
    baseUrl: 'src/',
    urlArgs: "bust=" + (new Date()).getTime(),
});
require(['test/Test', "test/SyncTest"], function (Test, SyncTest) {
    console.log("Sync test");
    SyncTest.SyncTest.test();
    SyncTest.SyncTest.power();
});
