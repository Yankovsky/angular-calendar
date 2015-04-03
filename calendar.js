angular.module('calendar', []).directive('calendar', ['$timeout', function($timeout) {
    // Key event mapper
    var keys = {
        13: 'enter',
        32: 'space',
        33: 'pageup',
        34: 'pagedown',
        35: 'end',
        36: 'home',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    }

    return {
        restrict: 'EA',
        templateUrl: 'calendar.html',
        scope: {
            customClasses: '&',
            onDayClick: '&',
            formatDayHeader: '@',
            dayTemplate: '@'
        },
        link: function(scope, element, attrs) {
            var currentDate = moment()
            var minDate = currentDate.clone()
            var maxDate = currentDate.clone().add(90, 'days')
            var startingDay = 1

            scope.move = function(direction) {
                currentDate.add(direction, 'months')
                refreshView()
            }

            scope.getClasses = function(day) {
                var classes = [scope.customClasses()(day)]
                angular.forEach(['disabled', 'secondary'], function(property) {
                    if (day[property]) {
                        classes.push(property)
                    }
                })
                return classes
            }

            scope.handleDayClick = function(day) {
                if (!day.disabled) {
                    if (day.secondary) {
                        scope.move(day.date.isBefore(currentDate) ? -1 : 1)
                    }
                    scope.onDayClick()(day)
                }
            }

            scope.keydown = function(evt) {
                var key = keys[evt.which]

                if (!key || evt.shiftKey || evt.altKey) {
                    return
                }

                evt.preventDefault()
                evt.stopPropagation()
                if (key === 'enter' || key === 'space') {
                    debugger
                    if (isDisabled(that.activeDate)) {
                        return // do nothing
                    }
                    scope.select(that.activeDate)
                    focusElement()
                } else if (evt.ctrlKey && (key === 'up' || key === 'down')) {
                    scope.toggleMode(key === 'up' ? 1 : -1)
                    focusElement()
                } else {
                    handleKeyDown(key, evt)
                    refreshView()
                }
            }

            function focusElement() {
                $timeout(function() {
                    element[0].focus()
                }, 0, false)
            }

            function refreshView() {
                var firstDayOfMonth = currentDate.clone().startOf('month')
                var month = firstDayOfMonth.month()
                var numDisplayedFromPreviousMonth = (6 + firstDayOfMonth.day() - startingDay) % 7 + 1
                var startDate = firstDayOfMonth.clone().subtract(numDisplayedFromPreviousMonth, 'days')

                scope.moveLeftDisabled = startDate.isBefore(minDate)
                scope.moveRightDisabled = startDate.clone().add(42, 'days').isAfter(maxDate)

                // 42 is the number of days on a six-row calendar
                var n = 42
                var days = new Array(n), current = startDate.clone(), i = 0
                current.hours(12) // Prevent repeated dates because of timezone bug
                while (i < n) {
                    var day = current.clone()
                    var isDisabled = day.isBefore(minDate) || day.isAfter(maxDate)
                    var isSecondary = day.month() !== month
                    days[i++] = {
                        id: day.format('YYYYMMDD'),
                        date: day,
                        label: day.format('D'),
                        disabled: isDisabled,
                        secondary: isSecondary
                    }
                    current.add(1, 'day')
                }

                scope.labels = new Array(7)
                for (var j = 0; j < 7; j++) {
                    scope.labels[j] = days[j].date.format(scope.formatDayHeader)
                }

                scope.title = currentDate.format('MMMM')
                scope.rows = split(days, 7)
            }

            function split(arr, size) {
                var arrays = []
                while (arr.length > 0) {
                    arrays.push(arr.splice(0, size))
                }
                return arrays
            }

            function handleKeyDown(key, evt) {
                var date = activeDate.getDate()

                if (key === 'left') {
                    date = date - 1   // up
                } else if (key === 'up') {
                    date = date - 7   // down
                } else if (key === 'right') {
                    date = date + 1   // down
                } else if (key === 'down') {
                    date = date + 7
                } else if (key === 'pageup' || key === 'pagedown') {
                    var month = activeDate.getMonth() + (key === 'pageup' ? -1 : 1)
                    activeDate.setMonth(month, 1)
                    date = Math.min(getDaysInMonth(activeDate.getFullYear(), activeDate.getMonth()), date)
                } else if (key === 'home') {
                    date = 1
                } else if (key === 'end') {
                    //document.activeElement
                    date = getDaysInMonth(activeDate.getFullYear(), activeDate.getMonth())
                }
                activeDate.setDate(date)
            }

            refreshView()
        }
    }
}])