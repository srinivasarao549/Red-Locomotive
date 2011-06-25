RedLocomotive('core', function(options, engine){
    "use strict"

    //create configuration
    var config = jQuery.extend({
        "selector": "canvas",
        "fps": 30
    }, options);

    //get the canvas
    var canvas = jQuery(config.selector),
        mousePos = [0, 0],
        mousedown = [false, 0, 0],
        active = false;

    //core loop
    setInterval(function () {
        engine.hook('core-loop');
    }, Math.round(1000 / config.fps));

    //core secondary loop
    setInterval(function () {
        engine.hook('core-sec-loop');
    }, 1000);

    //events
    (function events() {
        //mouse position
        jQuery(document).mousemove(function (e) {
            mousePos = [e.pageX, e.pageY];
            engine.hook('mousemove', e);
        });
        //mouse down
        jQuery(document).mousedown(function (e) {
            mousedown = [true, e.pageX, e.pageY];
            engine.hook('mousedown', e);
        });
        //mouse up
        jQuery(document).mouseup(function (e) {
            mousedown = [false, e.pageX, e.pageY];
            engine.hook('mouseup', e);
        });
        //window focus
        jQuery(window).focus(function (e) {
            active = true;
            engine.hook('active', e);
        });
        //window blur
        jQuery(window).blur(function (e) {
            active = false;
            engine.hook('inactive', e);
        });
    })();

    //return the core api
    return {
        "mousePosition": mousePos,
        "mouseDown": mousedown,
        "active": active
    }

});