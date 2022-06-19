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
        function onInit() {

        }
        
        var App = Controller.extend("mr.rrhh.controller.App", {});

        App.prototype.onInit = onInit;

        return App;

    });
