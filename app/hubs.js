define(['ko'],
function (ko) {

    function getVM() {

        var hubsHandler =
        {
            notificationAdded: ko.observable()
        };

        var notificationsHub = $.connection.notificationsHub;
        $.extend(notificationsHub.client, {
            notificationAdded: function (item) {
                hubsHandler.notificationAdded(item);
            }
        });
        return hubsHandler;

    }
    var instance = null;
    $.connection.hub.start();
    function getSingleton() {
        return instance || (instance = getVM());
    }

    return {
        getVM: getSingleton
    };
});