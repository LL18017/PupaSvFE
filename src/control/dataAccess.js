class dataAccess {
    PATH_URL="tipoProducto";
    constructor(path) {
        this.PATH_URL = path; // Definir PATH_URL con un valor por defecto
        this.URL = `http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/${this.PATH_URL}`;
    }

    /**
     * 
     * @param {id} id id de la entidad a consulta este valor es opcional
     * @param first first primer valor rrequerido este valro es opcional
     * @param {*} max maximo valores requerido este valor es opcional
     * @returns 
     */
    getData(id, first, max) {
        let request = "";

        if (id !== undefined) {
            request += `/${id}`;
        }

        const queryParams = new URLSearchParams();
        if (first !== undefined && max !== undefined) {
            queryParams.append("first", first);
            queryParams.append("max", max);
        }

        if (queryParams.toString()) {
            request += `?${queryParams.toString()}`;
        }

        request=this.URL+request
        return fetch(request, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
    }


    createData(registro){
        
        return fetch(this.URL,{
           method: "POST",
            headers: {
            "Content-Type": "application/json"
        },
           body:JSON.stringify(registro)
        })
    }
    updateData(registro,id){

        let request = "";
        if (id !== undefined) {
            request += `/${id}`;
        }
        request=this.URL+request;
        return fetch(request,{
           method: "PUT",
           headers: {
           "Content-Type": "application/json"
       },
          body:JSON.stringify(registro)
       })
    }
    deleteData(id){
        let request = this.URL;

        if (id !== undefined && id!=="") {
            request += `/${id}`;
        }
        return fetch(request,{
            method: "DELETE",
            headers: {
            "Content-Type": "application/json"
            }
        })
    }



};

export default dataAccess;