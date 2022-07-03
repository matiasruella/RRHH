//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "mr/rrhh/model/Employee",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/StandardListItem",
    "mr/rrhh/model/Formatter",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof mr.rrhh.model.Employee} Employee
     * @param {typeof sap.ui.model.Filter} Filter
     * @param {typeof sap.ui.model.FilterOperator} FilterOperator
     * @param {typeof sap.m.StandardListItem} StandardListItem
     * @param {typeof mr.rrhh.model.Formatter} Formatter
     * @param {typeof sap.m.MessageBox} MessageBox
     * @param {typeof sap.ui.model.json.JSONModel } JSONModel
     */
    function (Controller, Employee, Filter, FilterOperator, StandardListItem, Formatter, MessageBox, JSONModel) {
        "use strict";

        /**
         * Función para resetear el wizard cada vez que se entra a la pagina
         * @param {*} oEvent 
         */
        function _onObjectMatched(oEvent){
            
            //Reinicializamos los paneles.
            this.byId("employeeDataPanel").setVisible(false)
            this.byId("employeeInfoPanel").setVisible(false)
            this.byId("employeeFooterBar").setVisible(false)
            this.byId("employeeSelectPanel").setVisible(true)   
        }

        /**
         * Función ciclo de vida onInit
         */
        function onInit(){  

            //Obtenemos el router y le definimos un object matched a la ruta del monitor
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteMonitor").attachPatternMatched(_onObjectMatched,this);
        }

        /**
         * Función del ciclo de vida onInit
         */
        function onBeforeRendering() {

            //Obtengo la lista de empleados
            this._employeeList = this.byId("employeeList")

            //Enlazamos los datos del modelo a la lista
            this.bindList();

            //Obtenemos el modelo i18n
            this._oResourceModel = this.getView().getModel("i18n").getResourceBundle();

            //Propiedad que contiene el popup de salario.
            this._advancementEmployee;


        }

        /**
         * Función que bindea los datos del modelo a la lista de empleados
         */
        function bindList() {

            //Bindeamos los empleados aplicando los filtros correspondientes
            this._employeeList.bindItems(
                {
                    path: "employeeModel>/Users",
                    filters: new Filter(
                        {
                            path: "SapId",
                            operator: FilterOperator.EQ,
                            value1: this.getOwnerComponent().SapId,
                        }),
                    //Creamos un standard list item por cada empleado
                    template: new StandardListItem(
                        {
                            icon: "{= ${employeeModel>Type}==='0' ? 'sap-icon://employee-pane' : ${employeeModel>Type}==='1' ? 'sap-icon://employee' : 'sap-icon://leads' }",
                            title: "{employeeModel>FirstName} {employeeModel>LastName}",
                            description: "{employeeModel>Dni}",
                            type: "Active"
                        }
                    )
                }

            )

        }


        /**
         * Función para volver al menu principal
         * @param {*} oEvent 
         */
        function onNavBack(oEvent) {

            //Obtenemos el componente de las rutas
            var _oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            //Navegamos a la ruta principal
            _oRouter.navTo("RouteMain", true)

        }


        /**
         * Función para filtrar empleados segun el valor del value Search
         * @param {} oEvent 
         */
        function onSearch(oEvent) {

            var filters;

            //Obtenemos el valor del buscador
            var _valueSearch = oEvent.getSource().getValue();

            //Si no esta vacio, creamos los filtros por Nombre, Apellido y DNI
            if (_valueSearch !== "") {
                filters = new sap.ui.model.Filter({
                    filters: [
                        new Filter("FirstName", FilterOperator.Contains, _valueSearch),
                        new Filter("LastName", FilterOperator.Contains, _valueSearch),
                        new Filter("Dni", FilterOperator.Contains, _valueSearch)
                    ],
                    //Con este flag nos aseguramos el OR en el filtro, para AND lo ponemos en true
                    and: false
                });


            }

            //Bindeamos la los empleados a una variable
            var oBinding = this._employeeList.getBinding("items");

            //Aplicamos los filtros creados
            oBinding.filter(filters);
        }


        /**
         * Función que se ejecuta al seleccionar un empleado de la lista
         * @param {} oEvent 
         */
        function onShowEmployee(oEvent) {

            //Obtenemos el path del empleado seleccionado
            var _sPath = oEvent.getParameter("listItem").getBindingContext("employeeModel").getPath();

            //Bindeamos los datos del empleado seleccionado al elemento de los detalles
            this.byId("detailsEmployee").bindElement("employeeModel>" + _sPath)

            //Activamos los paneles de información necesaria y desactivamos el "Seleccione un empleado"
            this.byId("employeeDataPanel").setVisible(true)
            this.byId("employeeInfoPanel").setVisible(true)
            this.byId("employeeFooterBar").setVisible(true)
            this.byId("employeeSelectPanel").setVisible(false)

            //Bindeamos los ficheros que tiene asociado el empleado.
            this.byId("UploadCollection").bindAggregation("items", {
                path: "employeeModel>UserToAttachment",
                template: new sap.m.UploadCollectionItem({
                    documentId: "{employeeModel>AttId}",
                    fileName: "{employeeModel>DocName}",
                    visibleEdit: false

                }).attachPress(function (oEvent) {
                    //Obtenemos el path del contexto seleccionado
                    const sPath = oEvent.getSource().getBindingContext("employeeModel").getPath();

                    //Descargamos el fichero seleccionado
                    window.open("/sap/opu/odata/sap/ZEMPLOYEES_SRV" + sPath + "/$value");

                })

            })

        }

        /**
         * Función que se ejecuta al darle al boton de eliminar archivo
         * @param {} oEvent 
         */
        function onFileDeleted(oEvent) {

            //Obtenemos el path del fichero seleccionado
            var _sPath = oEvent.getParameter("item").getBindingContext("employeeModel").getPath();

            //Obtenemos los datos del objeto seleccionado
            var _attachmentData = oEvent.getParameter("item").getBindingContext("employeeModel").getObject();

            //Eliminamos el Archivo seleccionado
            Employee.remove(_sPath,
                this,
                function () {

                    //Obtenemos el control y refrescamos los ficheros listados
                    this.byId("UploadCollection").getBinding("items").refresh()
                    //Enviamos un mensaje de exito
                    MessageBox.success(this._oResourceModel.getText("monitorRemoveFileSuccess", [_attachmentData.DocName]))

                }.bind(this),
                function () {
                    //Si hay algun error, enviamos mensaje de error
                    MessageBox.error(this._oResourceModel.getText("monitorRemoveFileError", [_attachmentData.DocName]))
                }.bind(this))
        }

        /**
         * Función que se ejecuta cuando se agrega un archivo al control UploadCollection
         * @param {*} oEvent 
         */
        function onFileChange(oEvent) {

            //Configuramos el token de la cabecera.
            let oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                name: "x-csrf-token",
                value: this.getView().getModel("employeeModel").getSecurityToken()
            });

            //Agregamos ala cabecera
            oEvent.getSource().addHeaderParameter(oCustomerHeaderToken);
        }

        /**
         * Función que se ejecuta antes de hacer el upload del control UploadCollection
         * @param {*} oEvent 
         */
        function onFileBeforeUpload(oEvent) {

            //Obtenemos los datos del modelo
            var _employeeData = oEvent.getSource().getBindingContext("employeeModel").getObject();

            //Obtenemos el parametro fileName
            let _fileName = oEvent.getParameter("fileName");

            // Armamos el headerSlug
            let oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                name: "slug",
                value: this.getOwnerComponent().SapId + ";" + _employeeData.EmployeeId + ";" + _fileName
            })

            //Seteamos el headerSlug al control UploadCollection
            oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

        }

        /**
         * Función que se ejecuta al finalizar el subida de un archivo
         * @param {*} oEvent 
         */
        function onFileUploadComplete(oEvent) {

            //Obtenemos el control y refrescamos los ficheros listados
            oEvent.getSource().getBinding("items").refresh();

        }

        /**
         * Función que muestra un popup para agregar un nuevo salario
         * @param {*} oEvent 
         */
        function onAdvancementEmployee(oEvent) {

            // Si todavia no se asigno un popup
            if (!this._advancementEmployee) {

                //Le asignamos el fragmento que contiene el dialog
                this._advancementEmployee = sap.ui.xmlfragment("mr.rrhh.fragment.JobAdvancement", this);
                
                //Lo agregamos como dependencia de la vista
                this.getView().addDependent(this._advancementEmployee);

            }

            //Creamos el modelo del ascenso
            var _modelAdvancement = new JSONModel({ EmployeeId: oEvent.getSource().getBindingContext("employeeModel").getObject().EmployeeId });

            //Seteamos el modelo a la vista
            this.getView().setModel(_modelAdvancement, "advancementModel");

            //Abrimos el popup
            this._advancementEmployee.open();

        }


        /**
         * Función para cerrar el popup de salarios
         */
        function onCloseAdvancement() {
            this._advancementEmployee.close();
        }

        /**
         * Función que guarda el salario ingresado por pantalla
         * @param {*} oEvent 
         */
        function onSaveAdvancement(oEvent) {

            //Obtenemos los datos del modelo bindeado a los elementos del dialogo
            var _salaryData = this.getView().getModel("advancementModel").getData();

            //Enviamos la petición de creación
            Employee.create("/Salaries",
                {
                    "SapId": this.getOwnerComponent().SapId,
                    "EmployeeId": _salaryData.EmployeeId,
                    "CreationDate": _salaryData.CreationDate,
                    "Amount": _salaryData.Amount,
                    "Waers": 'EUR',
                    "Comments": _salaryData.Comments
                },
                this,
                function (data) {
                    sap.m.MessageToast.show(this._oResourceModel.getText("onSaveAdvancementMessage"))
                }.bind(this),
            );

            this._advancementEmployee.close();

        }


        /**
         * Función al presionar el boton de baja del empleado
         * @param {} oEvent 
         */
        function onDeleteEmployee(oEvent) {

            //Obtenemos los datos del empleado, mediante el binding context
            var _employeeData = oEvent.getSource().getBindingContext("employeeModel").getObject();

            //Obtenemos el path del empleado mediante el binding context
            var _employeePath = oEvent.getSource().getBindingContext("employeeModel").getPath();

            //Mostramos un pop up para que el usuario decida si sale o no del wizard
            MessageBox.warning(this._oResourceModel.getText("monitorRemoveEmployeeMessage",[ _employeeData.FirstName + " " +_employeeData.LastName]), {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (result) {
                    if (result === 'OK') {


                        // Enviamos petición para eliminar el empleado
                        Employee.remove(_employeePath,this,
                            function(data){

                                //Activamos los paneles de información necesaria y desactivamos el "Seleccione un empleado"
                                this.byId("employeeDataPanel").setVisible(false)
                                this.byId("employeeInfoPanel").setVisible(false)
                                this.byId("employeeFooterBar").setVisible(false)
                                this.byId("employeeSelectPanel").setVisible(true)

                                //Refrescamos la lista de empleados
                                this._employeeList.getBinding("items").refresh()

                                //Enviamos mensaje de notificación al usuario
                                sap.m.MessageToast.show(this._oResourceModel.getText("onDeleteEmployeeMessage"))

                            }.bind(this)
                        )
                        

                    }
                }.bind(this)
            });
        }

        var Monitor = Controller.extend("mr.rrhh.controller.Monitor", {});

        Monitor.prototype.onInit = onInit;
        Monitor.prototype._onObjectMatched = _onObjectMatched;
        Monitor.prototype.onBeforeRendering = onBeforeRendering;
        Monitor.prototype.bindList = bindList;
        Monitor.prototype.onNavBack = onNavBack;
        Monitor.prototype.onSearch = onSearch;
        Monitor.prototype.onShowEmployee = onShowEmployee;
        Monitor.prototype.Formatter = Formatter;
        Monitor.prototype.onFileDeleted = onFileDeleted;
        Monitor.prototype.onFileUploadComplete = onFileUploadComplete;
        Monitor.prototype.onFileBeforeUpload = onFileBeforeUpload;
        Monitor.prototype.onFileChange = onFileChange;
        Monitor.prototype.onAdvancementEmployee = onAdvancementEmployee;
        Monitor.prototype.onCloseAdvancement = onCloseAdvancement;
        Monitor.prototype.onSaveAdvancement = onSaveAdvancement;
        Monitor.prototype.onDeleteEmployee = onDeleteEmployee;

        return Monitor;

    });
