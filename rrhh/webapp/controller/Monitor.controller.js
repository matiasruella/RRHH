//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

                /**
         * Función del ciclo de vida onInit
         */
        function onBeforeRendering() {
        }
        
        var Monitor = Controller.extend("mr.rrhh.controller.Monitor", {});

        Monitor.prototype.onBeforeRendering = onBeforeRendering;

        return Monitor;

    });
