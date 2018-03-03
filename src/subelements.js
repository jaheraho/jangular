(function (){
    angular.module('app.subelements', [
    ]).component('subelements', {
        controller: controller, controllerAs: 'vm',
        templateUrl: 'subelements.html',
        bindings: {
            rootObj: '<',
            chainKey: '@',
            opened: '<',
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

        function $onChanges() {

            var type = !vm.rootObj ? 'undefined' : vm.getType(vm.rootObj.value);

            checkForChangedNodeName();

            //is either object or array
            if (!vm.rootObj || !vm.rootObj.value || (type !== 'object' && type !== 'array')) {
                vm.showThis = [];
                return;
            } else {
                vm.showThis = vm.showThis || [];
                if (type === 'object'){
                    handleObject();
                } else {//array
                    handleArray();
                }
            }

            //sort the whole thing
            vm.showThis = vm.showThis.sort(function(a, b) {
                return (a.$key > b.$key) ? 1 : -1;
            });

            //force reload
            vm.forceOnChange = !vm.forceOnChange;

            function checkForChangedNodeName() {
                if (vm.root) {
                    var lastNodeName = vm.nodeName;
                    if (lastNodeName !== vm.nodeNameFromLastCheck) {
                        vm.showThis = [];
                    }
                    vm.nodeNameFromLastCheck = vm.nodeName;
                }
            }

            function handleObject() {

                //iterate children properties, update values, and highlight rootObject/children
                angular.forEach(vm.rootObj.value, checkForChanges);

                function checkForChanges(val, key) {

                    var newValues = {
                        $key: key,
                        $type: vm.getType(val),
                        $children: vm.children(val),
                        value: val
                    };

                    var existingElement = vm.showThis.find(function(curCurrent) {return curCurrent.$key === key;});
                    if (!existingElement) {
                        vm.showThis.push(newValues);
                        return;
                    }

                    var valueIsDifferent = (existingElement.$type !== 'object' && existingElement.$type !== 'array' && key !== '$$hashKey' && existingElement.value !== newValues.value);
                    var timeoutIsRunningAlready = !!existingElement.$lastValue;

                    //highlight value
                    var oldValue = existingElement.value;
                    Object.assign(existingElement, newValues);
                    if (valueIsDifferent && !timeoutIsRunningAlready) {
                        existingElement.$lastValue = oldValue;
                        $timeout(function(){
                            existingElement.$lastValue = undefined;
                        }, TIME_BEFORE_FADING_OUT);
                    }

                    //highlight rootObj
                    if (!vm.root && valueIsDifferent && !vm.rootObj.$highlightMe) {
                        vm.rootObj.$highlightMe = true;
                        $timeout(function(){
                            vm.rootObj.$highlightMe = undefined;
                        }, TIME_BEFORE_FADING_OUT);
                    }
                }
            }

            function handleArray() {

                var oldMaxLength = checkForChangedLengthAndAdjustArray();
                //look for changed values
                var index = 0;
                for (var cur of vm.showThis) {
                    checkForChanges(cur, index, oldMaxLength);
                    index ++;
                }

                function checkForChangedLengthAndAdjustArray() {
                    var oldLength = vm.showThis.length;
                    var rootLength = vm.rootObj.value.length;
                    if (oldLength !== rootLength) {

                        //differnt size -> HIGHLIGHT
                        if (vm.rootObj.$oldLength) {
                            vm.rootObj.$oldLength = oldLength;
                            $timeout(function(){
                                vm.rootObj.$oldLength = undefined;
                            }, TIME_BEFORE_FADING_OUT);
                        }

                        //adjust array size
                        if (oldLength > rootLength) {
                            vm.showThis = vm.showThis.slice(0, rootLength);
                        } else  {
                            var toAdd = (rootLength - oldLength);
                            vm.showThis = vm.showThis.concat(([...Array(toAdd)]).map(function(){return {};}));
                        }
                    }
                    return oldLength;
                }

                function checkForChanges(cur, index, oldLength) {
                    cur.$key = index;

                    var newValue = vm.rootObj.value[index];

                    Object.assign(cur, {
                        $type: getType(newValue),
                        $children: vm.children(newValue),
                        value: newValue
                    });

                    if (index >= oldLength && !cur.$highlightMe) {
                        cur.$highlightMe = true;
                        //reset highlighted elements
                        $timeout(function(){
                            cur.$highlightMe = undefined;
                        }, TIME_BEFORE_FADING_OUT);

                        //highlight rootObj
                        if (!vm.rootObj.$oldLength) {
                            vm.rootObj.$oldLength = oldLength;
                            $timeout(function(){
                                vm.rootObj.$oldLength = undefined;
                            }, TIME_BEFORE_FADING_OUT);
                        }
                    }
                }

            }

        }
    }
})();