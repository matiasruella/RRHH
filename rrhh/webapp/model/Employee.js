sap.ui.define([
], 
    function () {
        "use strict";
        var _model = "employeeModel";
        
        function count(context,onSuccess,onError){

            context.getView().getModel(_model).read("/Users",{
                success: function(data){

                    let _result = data.results.filter(item => item.SapId == context.getOwnerComponent().SapId);
                    
                    onSuccess( _result.length)

                }.bind(this),
                error:function(e){
                    
                    onError(e)
                    
                }.bind(this)
            }) 
        }

        function create(){}
        function read(){}
        function update(){}
        function remove(){}


        var Employee = {

            count:count,
            create:create,
            read:read,
            update:update,
            remove:remove


        }

       
    return Employee;
        

});