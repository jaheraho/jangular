
var devtools = chrome.devtools;
var elements = devtools.panels.elements;
var getScope_caller = "(" + getScopes.toString() + ")()";

var TIME_HOW_OFTEN_WRITE_SESSION_STORAGE = 1000;

elements.createSidebarPane(
    'jAngular',
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
    var parentTree = [];

    var firstElementWithIsolatedScope = null;
    while (nearest.parentElement) {
        var element = angular.element(nearest);
        var thisElementWillBeShown = false;
        var hasIsolatedScope = false;
        if (element && element.isolateScope && element.isolateScope()) {
            if (!firstElementWithIsolatedScope) {
                firstElementWithIsolatedScope = element;
                thisElementWillBeShown = true;
            }
            hasIsolatedScope = true;
        }
        parentTree.push({
            thisElementWillBeShown: thisElementWillBeShown,//just one!
            hasIsolatedScope: hasIsolatedScope,//all with isolated scope!
            nodeName: nearest.nodeName
        });
        //go up in the dom tree
        nearest = nearest.parentElement;
    }

    if (!firstElementWithIsolatedScope) {
        return null
    }

    var isolatedScope = angular.element(firstElementWithIsolatedScope).isolateScope();

    const dom = {};

    //save vm and §ctrl of the isolatedScope
    angular.forEach(isolatedScope, function(value, key) {
        if (key === '$ctrl' || key === 'vm') {
            dom[key] = value;
        }
    });

    return {
        parents: parentTree.slice().reverse(),
        dom: dom
    }
}