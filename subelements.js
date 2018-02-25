(function (){
    angular.module('app.subelements', [
    ]).component('subelements', {
        controller: controller, controllerAs: 'vm',
        templateUrl: 'subelements.html',
        bindings: {
            motherObj: '<',
            chainKey: '@',
            opened: '<',
            level: '<',
            root: '<',
            nodeName: '<',
            forceOnChange: '<'
        }
    });

    function controller(
        $timeout
    ) {
        var vm = this;

        var TIME_BEFORE_FADING_OUT = 4000;

        this.$onChanges = $onChanges;

        vm.getType = getType;
        vm.toggle = toggle;
        vm.children = children;

        function children(val) {
            var type = vm.getType(val);
            var amount = 0;
            if(val && type === 'object') {
                angular.forEach(val, function() {
                    amount ++;
                });
            } else if(val && type === 'array') {
                amount = val.length;
            }
            return amount;
        }

        function toggle(key) {
            var levelKey = vm.chainKey + '_' + key;
            if (vm.opened[levelKey]) {
                delete vm.opened[levelKey];
            } else {
                vm.opened[levelKey] = true;
            }
        }

        function $onChanges(changesObj) {

            var type = !vm.motherObj ? 'undefined' : vm.getType(vm.motherObj.value);

            if (!vm.motherObj || !vm.motherObj.value || (type !== 'object' && type !== 'array')) {
                vm.showThis = [];
                return;
            }

            if (type === 'object'){

                if (vm.root) {
                    var lastNodeName = vm.nodeName;
                    if (lastNodeName !== vm.nodeNameFromLastCheck) {
                        vm.showThis = [];
                    }
                    vm.nodeNameFromLastCheck = vm.nodeName;
                }

                vm.showThis = vm.showThis || [];

                angular.forEach(vm.motherObj.value, function(val, key) {

                    var newValues = {
                        $key: key,
                        $type: vm.getType(val),
                        $children: vm.children(val),
                        value: val
                    };

                    var existingElement = vm.showThis && vm.showThis.find(function(curCurrent) {return curCurrent.$key === key;});
                    if (!existingElement) {
                        vm.showThis.push(newValues);
                    } else {
                        var valueIsDifferent = (existingElement.$type !== 'object' && existingElement.$type !== 'array' && existingElement.value !== newValues.value);
                        var timeoutIsRunningAlready = !!existingElement.$lastValue;

                        var oldValue = existingElement.value;
                        Object.assign(existingElement, newValues);
                        if (valueIsDifferent && !timeoutIsRunningAlready) {
                            existingElement.$lastValue = oldValue;
                            $timeout(function(){
                                existingElement.$lastValue = undefined;
                            }, TIME_BEFORE_FADING_OUT);
                        }
                        var timeoutIsRunningAlready_parent = !!vm.motherObj.$highlightedParent;
                        if (!vm.root && valueIsDifferent && !timeoutIsRunningAlready_parent) {
                            vm.motherObj.$highlightedParent = true;
                            $timeout(function(){
                                vm.motherObj.$highlightedParent = undefined;
                            }, TIME_BEFORE_FADING_OUT);

                        }
                    }
                });
            } else {//array
                var wasFilledAndArray = (vm.showThis && vm.getType(vm.showThis) === 'array');
                if (wasFilledAndArray) {
                    var timeoutIsRunningAlready_parent = !!vm.motherObj.$oldLength;
                    if (!timeoutIsRunningAlready_parent && vm.showThis.length !== vm.motherObj.value.length) {
                        vm.motherObj.$oldLength = vm.showThis.length;
                        $timeout(function(){
                            vm.motherObj.$oldLength = undefined;
                        }, TIME_BEFORE_FADING_OUT);
                    }
                }

                vm.showThis = vm.motherObj.value.map(function(cur, index) {
                    var $lastValue;
                    if (wasFilledAndArray) {
                        if (vm.showThis.length > index) {
                            if (vm.showThis[index].value !== cur) {
                                //todo
                            }
                        }
                    }
                    return {
                        $lastValue: $lastValue,
                        $key: index,
                        $type: vm.getType(cur),
                        $children: vm.children(cur),
                        value: cur
                    }
                });
            }

            vm.showThis = vm.showThis.sort(function(a, b) {
                return (a.$key > b.$key) ? 1 : -1;
            });

            vm.forceOnChange = !vm.forceOnChange;

        }
    }
})();