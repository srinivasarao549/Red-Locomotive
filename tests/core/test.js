jQuery(function(){

    RedLocomotive({
        "baseUrl": '../../'
    }, function (E) {
        E.require('tests', function () {
            E.tests.create('#test', [
                {
                    "label": "Mouse Position: ",
                    "event": E.mousePosition[0] + 'px ' + E.mousePosition[1] + 'px'
                }, {
                    "label": "Mouse Down: ",
                    "event": (E.mouseDown ? 'True' : 'False')
                }, {
                    "label": "System Active: ",
                    "event": (E.active ? 'True' : 'False')
                }
            ]);
        });
    });
    
});