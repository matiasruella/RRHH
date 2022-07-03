//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "mr/rrhh/model/Employee",
    "mr/rrhh/model/Formatter"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel  
     * @param {typeof sap.u.MessageBox} MessageBox
     * @param {typeof mr.rrhh.model.Employee} Employee
     * @param {typeof mr.rrhh.model.Formatter} Formatter
     */
    function (Controller, JSONModel, MessageBox, Employee,Formatter) {
        "use strict";
        
        /**
         * Función para resetear el wizard cada vez que se entra a la pagina
         * @param {*} oEvent 
         */
        function _onObjectMatched(oEvent){
            this.resetWizard();
        }

        /**
         * Función ciclo de vida onInit
         */
        function onInit(){  

            //Obtenemos el router y le definimos un object matched a la routa del empleado
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteEmployee").attachPatternMatched(_onObjectMatched,this);
        }
        /**
         * Función ciclo de vida onBeforeRendering
         */
        function onBeforeRendering() {

            //Obtenemos el wizard y los pasos
            this._wizardEmployee = this.byId("employeeWizard");

            this._wizardStep1 = this._wizardEmployee.getSteps()[0];

            this._wizardStep2 = this._wizardEmployee.getSteps()[1];

            this._wizardStep3 = this._wizardEmployee.getSteps()[2];

            // Creamos un modelo para alojar los datos del empleado.
            this._employee = new JSONModel({});

            // Seteamos el modelo a la vista
            this.getView().setModel(this._employee);


            //Obtenemos el modelo de salarios
            let _salaries = new JSONModel();

            _salaries.loadData("./model/json/Salaries.json")

            this.getView().setModel(_salaries, "Salaries");


            //Obtenemos el modelo i18n
            this._oResourceModel = this.getView().getModel("i18n").getResourceBundle();

        }

        /**
         * Función al presionar un tipo de empleado
         * @param {*} oEvent 
         */
        function onTypePress(oEvent) {

            //Obtenemos el id del boton que se presionó y nos quedamos con la parte del ID
            var _id = oEvent.getSource().getId().replace("container-mr.rrhh---Employee--", "");

            //Seteamos el tipo en el modelo de datos
            this._employee.setData({
                type: parseInt(_id)
            })

            //Obtenemos el slider del salario
            let _salarySlide = this.byId("Salary");

            //Obtenemos la configuración de los salarios mediante el tipo de empleado
            let _salary = this.getView().getModel("Salaries").getProperty("/Salaries/" + _id + "/");

            //Configuramos los valores del slider
            _salarySlide.setMax(_salary.maxSalary);
            _salarySlide.setMin(_salary.minSalary);
            _salarySlide.setStep(_salary.stepSalary);
            _salarySlide.setValue(_salary.defaultSalary);

            //Pasamos al siguiente paso
            if (this._wizardEmployee.getCurrentStep() === this._wizardStep1.getId()) {
                this._wizardEmployee.nextStep();
            } else {
                this._wizardEmployee.goToStep(this._wizardStep2)
            }


        }

        /**
         * Función para validar los datos ingresados por pantalla
         * @param {*} oEvent 
         */
        function onValidateEmployee(oEvent) {

            //Obtenemos los datos del empleado
            var _employeeData = this._employee.getData();

            //Declaramos un variable para determinar si todo el formulario es valido
            var _employeeValid = true;

            //Validación de nombre
            if (!_employeeData.name) {
                _employeeData.nameState = "Error"
                _employeeValid = false;

            } else {
                _employeeData.nameState = "None"
            }


            //Validación de apellido
            if (!_employeeData.lastName) {
                _employeeData.lastNameState = "Error"
                _employeeValid = false;

            } else {
                _employeeData.lastNameState = "None"
            }

            //Validación de Fecha de incorporación
            if (!this.byId("dateEmployee").isValidValue() ||
                !_employeeData.date) {
                _employeeData.dateState = "Error"
                _employeeValid = false;

            } else {
                _employeeData.dateState = "None"
            }

            //Validación de DNI
            if (!_validateDNI.bind(this)()) {
                _employeeData.dniState = "Error"
                _employeeValid = false;

            } else {
                _employeeData.dniState = "None"
            }

            //Si es valido, habiltamos el boton para proximo paso
            if (_employeeValid) {
                this._wizardEmployee.validateStep(this._wizardStep2);
            } else {
                this._wizardEmployee.invalidateStep(this._wizardStep2);
            }

        }


        /**
         * Función que valida que el DNI sea Español
         */
        function _validateDNI() {

            var _employeeData = this._employee.getData();

            if (_employeeData.type == 0 || _employeeData.type == 2) {

                var dni = _employeeData.dni;
                var number;
                var letter;
                var letterList;
                var regularExp = /^\d{8}[a-zA-Z]$/;
                //Se comprueba que el formato es válido
                if (regularExp.test(dni) === true) {
                    //Número
                    number = dni.substr(0, dni.length - 1);
                    //Letra
                    letter = dni.substr(dni.length - 1, 1);
                    number = number % 23;
                    letterList = "TRWAGMYFPDXBNJZSQVHLCKET";
                    letterList = letterList.substring(number, number + 1);
                    if (letterList !== letter.toUpperCase()) {
                        return false;

                    } else {
                        return true;
                    }
                } else {
                    return false;
                }

            } else if (!_employeeData.dni) {

                return false;
            } else {
                return true;
            }

        }

        /**
         * Función que se dispara al completarse el wizard
         */
        function onWizardComplete() {

            //Necesitamos saber cuantos archivos se subieron para la revisión
            var _upload = this.byId("employeeFiles");

            //Obtenemos la cantidad de archivos del uploadController
            var _filesUpload = _upload.getItems();

            //Creamos un array
            var _files = []

            //Recorremos los arhivos
            for (var _file in _filesUpload) {

                //Appendeamos el nombre del archivo que estamos tratando
                _files.push({ name: _filesUpload[_file].getFileName() })

            };

            //Seteamos el modelo con los archivos y la cantidad de archivos
            this._employee.setProperty("/files", _files);
            this._employee.setProperty("/filesCount", _files.length);

            //Pasamos a la pagina de revisión
            this.byId("wizardNavContainer").to(this.byId("wizardReviewPage"));
        }

        /**
         * Función para volver a editar el paso seleccionado
         * @param {*} oEvent 
         */
        function onEditLink(oEvent) {

            //Obtenemos el paso del wiazrd seleccionado para editar del ID del link
            var _stepSelected = parseInt(oEvent.getSource().getId().replace("container-mr.rrhh---Employee--edit_", ""));

            var fnAfterNavigate = function () {
                //Obtenemos el paso
                var step = this._wizardEmployee.getSteps()[_stepSelected]

                //Direccionamos el wizard
                this._wizardEmployee.goToStep(step);

                this.byId("wizardNavContainer").detachAfterNavigate(fnAfterNavigate);
            }.bind(this);

            this.byId("wizardNavContainer").attachAfterNavigate(fnAfterNavigate);

            this.byId("wizardNavContainer").back();

        }


        /**
         * Función que se ejecuta al darle al boton cancelar
         * @param {*} oEvent 
         */
        function onCancel(oEvent) {

            //Mostramos un pop up para que el usuario decida si sale o no del wizard
            MessageBox.warning(this._oResourceModel.getText("employeeWizardCancelMessage"), {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (result) {
                    if (result === 'OK') {

                        this.backToMenu();

                    }
                }.bind(this)
            });
        }


        /**
         * Reinicia el wizard
         */
        function resetWizard() {

            if (this)
            //Reiniciamos el wizard por si se vuelve atras.
            this._wizardEmployee.discardProgress(this._wizardStep1);

            //Volvemos al Step 1.
            this._wizardEmployee.goToStep(this._wizardStep1);

            //Seteamos el step 1 para que no aparezaca como validado.
            this._wizardStep1.setValidated(false);

        }

        /**
         * Vuelve al menu principal.
         */
        function backToMenu() {

            //Damos un back por si se encuentra en la pagina de revisión
            this.byId("wizardNavContainer").back();

            //Redirigimos a la vista principal
            sap.ui.core.UIComponent.getRouterFor(this).navTo("RouteMain", true)

        }

        /**
         * Función que se dispara al darle al boton de guardar. 
         * @param {*} oEvent 
         */
        function onSave(oEvent) {

            //Obtenemos los datos del modelo
            var _employeeData = this._employee.getData()

            //Enviamos la petición de creación
            Employee.create("/Users",
                {
                    "SapId": this.getOwnerComponent().SapId,
                    "Type": _employeeData.type.toString(),
                    "FirstName": _employeeData.name,
                    "LastName": _employeeData.lastName,
                    "Dni": _employeeData.dni,
                    "CreationDate": _employeeData.date,
                    "Comments": _employeeData.comments,
                    "UserToSalary":
                        [
                            {
                                Amount: parseFloat(_employeeData.salary).toString(),
                                Waers: "EUR",
                                Comments:this._oResourceModel.getText("employeeWizardStep2CreationComment"),
                                CreationDate:_employeeData.date


                            }
                        ]
                },
                this,
                onCreateSucces.bind(this),
                onCreateError.bind(this)
            );

        }

        /**
         * Función callback al enviar una petición de creación
         * @param {*} data 
         */
        function onCreateSucces(data) {

            //Seteamos el empleado al modelo
            this._employee.getData().employeeId = data.EmployeeId;

            //Subimos los ficheros cargados.
            this.byId("employeeFiles").upload();

            MessageBox.success(this._oResourceModel.getText("employeeWizardCreateSuccess", [data.FirstName, data.LastName, data.EmployeeId]), {
                onClose: function (result) {
                    backToMenu.bind(this)();

                }.bind(this)
            });
        }


        /**
         * Función callback al enviar una petición de creación
         * @param {*} data 
         */
        function onCreateError(error) {
            console.log("ERROR PA")
            MessageBox.error(this._oResourceModel.getText("employeeWizardCreateError"), {
                onClose: function (result) {
                    backToMenu.bind(this)();

                }.bind(this)
            });
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
            var _employeeData = this._employee.getData()

            //Obtenemos el parametro fileName
            let _fileName = oEvent.getParameter("fileName");

            // Armamos el headerSlug
            let oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                name: "slug",
                value: this.getOwnerComponent().SapId + ";" + _employeeData.employeeId + ";" + _fileName
            })

            //Seteamos el headerSlug al control UploadCollection
            oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

        }



        var EmployeeController = Controller.extend("mr.rrhh.controller.Employee", {});

        EmployeeController.prototype.onInit = onInit;
        EmployeeController.prototype.onTypePress = onTypePress
        EmployeeController.prototype.onBeforeRendering = onBeforeRendering;
        EmployeeController.prototype.onValidateEmployee = onValidateEmployee;
        EmployeeController.prototype.onWizardComplete = onWizardComplete;
        EmployeeController.prototype.onEditLink = onEditLink;
        EmployeeController.prototype.onCancel = onCancel;
        EmployeeController.prototype.onSave = onSave;
        EmployeeController.prototype.onCreateSucces = onCreateSucces;
        EmployeeController.prototype.onCreateError = onCreateError;
        EmployeeController.prototype.backToMenu = backToMenu;
        EmployeeController.prototype.resetWizard = resetWizard;
        EmployeeController.prototype.onFileBeforeUpload = onFileBeforeUpload;
        EmployeeController.prototype.onFileChange = onFileChange;
        EmployeeController.prototype.Formatter = Formatter;

        return EmployeeController;

    });
