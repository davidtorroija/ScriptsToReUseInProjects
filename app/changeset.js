/*globals define,$,console, _*/
define([],
    function (ko, _) {
        var operations = {
            insert: 1,
            update: 2,
            'delete': 3
        };
        function getChangeSet() { 
                           
            var changeSet = {
                Entries: [],
                referenceIdentity: 0,
                clean: cleanChangeSet
            };

            function cleanChangeSet() {
                changeSet.Entries = [];
                changeSet.referenceIdentity = 0;
            };
            return changeSet;
        }
        function toJS(changeSet) {
            var js = $.extend(true, {}, changeSet);
            delete js.referenceIdentity;
            delete js.clean;
            return js;
        }
        return {
            operations: operations,
            getChangeSet: getChangeSet,
            toJS: toJS
        };
});

//tracked object
var tracked = {
    //properties
    //evaluate encapsulate under track
    commit: function() {
        //current -> lastSaved
        //modified = true
    },
    undo: function() {
        //lastSaved -> current
    },
    modified: false,
    original: null,
    lastSaved: null
};
