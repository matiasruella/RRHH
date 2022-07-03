//@ts-nocheck
sap.ui.define([
],
    function () {
        "use strict";
        var _model = "employeeModel";
        var _entity = "/Users"

        function count(context, onSuccess, onError) {

            context.getView().getModel(_model).read(_entity, {
                success: function (data) {

                    if (data){
                    let _result = data.results.filter(item => item.SapId == context.getOwnerComponent().SapId);

                    onSuccess(_result.length)
                     }

                }.bind(this),
                error: function (e) {

                    onError(e)

                }.bind(this)
            })
        }

        function create(entity, body, context, onSuccess, onError) {

            context.getView().getModel(_model).create(entity, body, {

                success: function (data) {

                    onSuccess(data)

                }.bind(this),
                error: function (e) {

                    onError(e)

                }.bind(this)
            })

        }

        function read(entity, context, onSuccess, onError) {

            context.getView().getModel(_model).read(entity, {
                success: function (data) {

                    onSuccess(data)

                }.bind(this),
                error: function (e) {

                    onError(e)

                }.bind(this)
            })


        }



        function remove(path, context, onSuccess, onError){ 

            context.getView().getModel(_model).remove(path,{success:onSuccess,onError:onError})


        }
        function update() { }


        var Employee = {

            count: count,
            create: create,
            read: read,
            update: update,
            remove: remove


        }


        return Employee;


    });