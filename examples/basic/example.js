jQuery(function () {
    "use strict"
    RedLocomotive({
        "baseUrl": "../../"
    }, function(engine) {
        engine.spriteSheet.create([
            {
                "url": "sprite/test.png",
                "spriteWidth": 100,
                "spriteHeight": 100
            }
        ], function() {
            alert('loaded');
        });

        //create a test element
        //var testElement = engine.element.create('test', 'test', 100, 100, 100, 100);

        //

        //console.log(engine);
    });
});