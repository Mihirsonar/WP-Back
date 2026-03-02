class ApiError extends Error {
    constructor(status, message,stack="") {
        super(message); 
        this.status = status;
        this.message = message;
        this.success = false;
        if(stack){
            this.stack = stack;
        }else{
            Error.captureStackTrace(this, this.constructor);
        }   
    }
}

export { ApiError };