(function (){
    angular.module('app', [
        'app.subelements'
    ]).component('panel', {
        controller: controller, controllerAs: 'vm',
        templateUrl: 'panel.html'
    });

    function controller(
        $interval
    ) {

        var TIME_CHECKING_SESSION_STORAGE = 500;

        var vm = this;

        vm.opened = {};

        vm.getMarginStepsOfShowScope = function() {
            if (!vm.parents) {
                return 0;
            }
            var index = vm.parents.findIndex(function(cur){return cur.thisElementWillBeShown});
            if (index === -1) {
                return 0;
            } else {
                return vm.lineBreaksBeforeThisIndex(index);
            }
        };

        vm.lineBreaksBeforeThisIndex = function(index) {
            if (!index || index > vm.parents.length - 1) {
                return 0;//root index or invalid index
            } else if (!vm.parents[index].hasIsolatedScope && !vm.parents[index-1].hasIsolatedScope) {
                return 0;//this non-scope-element is right to another non-scope-element
            } else {
                return vm.parents.slice(0, index).filter(function(elm, idx) {
                    return (elm.hasIsolatedScope || (idx && vm.parents[idx-1].hasIsolatedScope));
                }).length + 1;//collect linebreaks before this
            }
        };

        $interval(function(){
            try {
                var item = sessionStorage.getItem('angularloader_$0');
                if (item) {
                    var parsed = JSON.parse(item);
                    vm.dom = {value: parsed.dom};
                    vm.nodeName = parsed.nodeName;
                    vm.parents = parsed.parents;
                } else {
                    vm.dom = null;
                    vm.nodeName = '';
                    vm.parents = [];
                }
            } catch(e) {
                vm.dom = null;
                vm.nodeName = '';
                vm.parents = [];
            }
            vm.timer = (vm.timer == null) ? 0 : vm.timer + 1;
        }, TIME_CHECKING_SESSION_STORAGE);

    }
})();