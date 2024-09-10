class apiError extends Error {
    constructor(statusCode,message="someting went wrong",errors = [],
        statck = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.success = false;


        if(statck){
            this.stack = statck
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export default apiError
    
