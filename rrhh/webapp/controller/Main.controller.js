//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "mr/rrhh/model/Employee"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof "mr.rrhh.model.Employee"} Employee
     */
    function (Controller,Employee) {
        "use strict";

        /**
         * Función del ciclo de vida onInit
         */
        function onInit() {

       
        }


        /**
         * Función ciclo de vida onBeforeRendering
         */
        function onBeforeRendering(){
            
            //Obtenemos la cantidad de empleados para informar al monitor
            Employee.count(this,onCountSuccess.bind(this))
            
        }


        /**
         * Función callback con el resultado de contar empleados
         * @param {Cantidad de empleados en base de datos} data 
         */
        function onCountSuccess(data){

            //Seteamos la cantidad de empleados en el Tile del monitor
            this.getView().byId("employeeCount").setValue(data);

        }

        /**
         * Evento al presionar algun Tile en pantalla
         * @param {*} oEvent 
         */
        function onTilePress(oEvent){
            
            //Obtenemos el ID del tile presionado
            var _id = oEvent.getSource().getId();

            //Reemplazamos lo que no nos interesa del id por un espacio 
            var _sourceId = _id.replace("container-mr.rrhh---Main--","" )
            
            //Creamos dinamicamente el nombre de la ruta.
            var _route = "Route" + _sourceId;

            //Obtenemos el router
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            //Consultamos si existe la ruta armada dinamicamente.
            if (oRouter.getRoute(_route)){

                //Si existe, navegamos a esa vista.
                 oRouter.navTo(_route,true);

            
            }
        }



         
        var Main = Controller.extend("mr.rrhh.controller.Main", {});

        Main.prototype.onInit = onInit;
        Main.prototype.onBeforeRendering = onBeforeRendering;
        Main.prototype.onTilePress = onTilePress;
        Main.prototype.onCountSuccess = onCountSuccess;
        
        return Main;


    });
