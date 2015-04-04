angular.module("calendar", []).directive("calendar", ["$timeout", function($timeout) {
    return {
        restrict: "EA",
        templateUrl: "calendar.html",
        scope: true,
        link: function(scope, element, attrs) {
            scope.dayTemplate = attrs.dayTemplate
            var customClasses = scope.$parent.$eval(attrs.customClasses)
            var onDayClick = scope.$parent.$eval(attrs.onDayClick)

            var currentDate = moment()
            var minDate = currentDate.clone()
            var maxDate = currentDate.clone().add(90, "days")
            var startingDay = 1

            scope.move = function(direction) {
                currentDate.add(direction, "months")
                refreshView()
            }

            scope.getClasses = function(day) {
                var classes = [customClasses(day)]
                angular.forEach(["disabled", "secondary"], function(property) {
                    if (day[property]) {
                        classes.push(property)
                    }
                })
                return classes
            }

            if (!attrs.readonly) {
                scope.handleDayClick = function(day) {
                    if (!day.disabled) {
                        if (day.secondary) {
                            scope.move(day.date.isBefore(currentDate) ? -1 : 1)
                        }
                        onDayClick(day)
                    }
                }
            }

            function refreshView() {
                var firstDayOfMonth = currentDate.clone().startOf("month")
                var month = firstDayOfMonth.month()
                var numDisplayedFromPreviousMonth = (6 + firstDayOfMonth.day() - startingDay) % 7 + 1
                var startDate = firstDayOfMonth.clone().subtract(numDisplayedFromPreviousMonth, "days")

                scope.moveLeftDisabled = startDate.isBefore(minDate)
                scope.moveRightDisabled = startDate.clone().add(42, "days").isAfter(maxDate)

                // 42 is the number of days on a six-row calendar
                var n = 42
                var days = new Array(n), current = startDate.clone(), i = 0
                current.hours(12) // Prevent repeated dates because of timezone bug
                while (i < n) {
                    var day = current.clone()
                    var isDisabled = day.isBefore(minDate) || day.isAfter(maxDate)
                    var isSecondary = day.month() !== month
                    days[i++] = {
                        id: day.format("YYYYMMDD"),
                        date: day,
                        label: day.format("D"),
                        disabled: isDisabled,
                        secondary: isSecondary
                    }
                    current.add(1, "day")
                }

                scope.labels = new Array(7)
                for (var j = 0; j < 7; j++) {
                    scope.labels[j] = days[j].date.format(attrs.formatDayHeader)
                }

                scope.title = currentDate.format("MMMM")
                scope.rows = split(days, 7)
            }

            function split(arr, size) {
                var arrays = []
                while (arr.length > 0) {
                    arrays.push(arr.splice(0, size))
                }
                return arrays
            }

            refreshView()
        }
    }
}])