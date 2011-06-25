RedLocomotive('tests', function(){

    function createTest(parentElementSelector, tests) {

        var test = {},
            result = '',
            table = jQuery('<table></table>');

        jQuery(parentElementSelector).append(table);

        for (var i = 0; i < tests.length; i += 1) {
            test = tests[i];

            var label = jQuery('<td>' + test.label + '</td>');
            var value = jQuery('<td></td>');
            var row = jQuery('<tr></tr>').append(label).append(value);
            table.append(row);

            //a wrapper for updating the value
            function updateValue(text) {
                value.html(text);
            }

            //if a test, check falsy vs thruthiness
            if (test.test) {
                if (test.test()) {
                    value.html('<span style="color: #00C407">Successful</h1>');
                } else {
                    value.html('<span style="color: #C40000">Failed</h1>');
                }

            //if an event, update the value on every event
            } else if (test.event) {
                E.action('mousemove', 'updateTest', function () { updateValue(test.event) });
                E.action('mousedown', 'updateTest', function () { updateValue(test.event) });
                E.action('active', 'updateTest', function () { updateValue(test.event) });

            //if a value, set the value
            } else if (test.value) {
                value.html(test.value);
            }
        }
    }

    return {
        "create": createTest
    }
});