
var devtools = chrome.devtools;
var elements = devtools.panels.elements;
var getScope_caller = "(" + getScopes.toString() + ")()";

var TIME_HOW_OFTEN_WRITE_SESSION_STORAGE = 1000;

elements.createSidebarPane(
    'isolatedScope',
    postCreate
);

function postCreate(sidebarPane) {
    sidebarPane.setPage('panelContainer.html');
    // sidebarPane.setObject();
    updatePanelProperties();
}

function updatePanelProperties() {
    devtools.inspectedWindow.eval(getScope_caller, postEval);
}

function postEval(response){
    sessionStorage.setItem('angularloader_$0', JSON.stringify(response));
    setTimeout(function(){
        updatePanelProperties()
    }, TIME_HOW_OFTEN_WRITE_SESSION_STORAGE);
}

function getScopes() {
    if (!$0 || !angular || !angular.element) {
        return null;
    }
    var nearest = $0;
    var tree = [];

    while (nearest.parentElement) {
        var element = angular.element(nearest);
        if (element && element.isolateScope && element.isolateScope()) {
            tree.push(nearest);
        }
        nearest = nearest.parentElement;
    }

    if (!tree.length) {
        return null
    }

    var parents = [];
    if (tree.length > 1) {
        parents = tree.slice(1, tree.length).map((cur) => cur.nodeName);
    }

    var isolatedScope = angular.element(tree[0]).isolateScope();
    var nodeName = tree[0].nodeName;

    const dom = {};

    angular.forEach(isolatedScope, function(value, key) {
        if (key === '$ctrl' || key === 'vm') {
            dom[key] = value;
        }
    });

    return {
        parents: parents.slice().reverse(),
        nodeName: nodeName,
        dom: dom
    }
}