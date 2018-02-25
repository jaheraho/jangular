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