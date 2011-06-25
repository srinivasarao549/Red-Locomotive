jQuery(function(){
    RedLocomotive({
        "baseUrl": '../'
    }, function (engine) {

        //Loader Module Tests
        test("Loader Module", function() {

            function testHooksAndActions() {
                var result = false;
                engine.action("test", "hookTest", function () { result = true; });
                engine.hook("test");
                return result;
            }

            function testClearHooksAndActions() {
                var result = 0;
                engine.action("test2", "hookTest", function () { result += 1; });
                engine.action("test2", "hookTest2", function () { result += 2; });
                engine.action("test2", "hookTest3", function () { result += 3; });
                engine.hook("test2");
                engine.clearAction("test2", "hookTest2");
                engine.hook("test2");
                engine.clearHook("test2");
                engine.hook("test2");
                return result === 10;
            }

            ok(testHooksAndActions(), "Adding Hooks and Actions");
            ok(testClearHooksAndActions(), "Clearing Hooks and Actions");
        });

        //Core Module Tests
        test("Core Module", function() {
            function testHook(hookName, eventName, eventHost) {
                var result = false;
                engine.action(hookName, "hookTest", function () { result = true; });
                jQuery(eventHost).trigger(eventName);
                return result;
            }

            ok(typeof engine.mousePosition !== "undefined", "Mouse Position");
            ok(typeof engine.mouseDown !== "undefined", "Mouse Click");
            ok(typeof engine.active !== "undefined", "Window Active (in focus)");
            ok(testHook("mousemove", "mousemove", document), "Mouse Movement Hook");
            ok(testHook("mousedown", "mousedown", document), "Mouse Click Hook");
            ok(testHook("active", "focus", window), "Window Active Hook");
            ok(testHook("inactive", "blur", window), "Window Inactive Hook");
        });

        //Sprite Module Tests
        
    });
});