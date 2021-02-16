requirejs.config({
    baseUrl: 'src/',
    urlArgs: "bust=" + (new Date()).getTime(),
});
require(["test/SyncTest"], function (SyncTest) {
    console.log("Sync test");
    SyncTest.SyncTest.test();
    SyncTest.SyncTest.power();
});
