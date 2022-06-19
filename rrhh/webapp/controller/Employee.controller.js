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
        
        var Employee = Controller.extend("mr.rrhh.controller.Employee", {});

        Employee.prototype.onInit = onInit;

        return Employee;

    });
