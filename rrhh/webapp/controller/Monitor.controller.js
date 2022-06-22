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

            this.getView().getModel("employeeModel").remove("/Users(EmployeeId='0000',SapId='matiasruela@gmail.com')",{
                success:function(data){
                    console.log(data)
                }.bind(this),
                error:function(e){
                    console.log(e)
                }.bind(this),
            })
        }
        
        var Monitor = Controller.extend("mr.rrhh.controller.Monitor", {});

        Monitor.prototype.onBeforeRendering = onBeforeRendering;

        return Monitor;

    });
