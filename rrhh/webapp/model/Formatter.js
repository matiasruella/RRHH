//@ts-nocheck
sap.ui.define([
],
    function () {
        "use strict";


        function getDate(creationDate) {

            var _finishDate = new Date(creationDate).getTime();

            return true;

        }

        function getType(type){
            console.log(type)
            return ( type == '0' ? "Interno" : type == '1' ? "Autónomo" : 'Gerente' );

        }



        return {
            getDate: getDate,
            getType:getType
        };


    });