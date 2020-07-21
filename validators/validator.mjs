const validator={}
validator.validateMainObject=(data)=>{
    let error=[];
    try
    {
        if(!data.hasOwnProperty("action"))
            error.push("action property is missing in main object.");
        if(!data.hasOwnProperty("data"))
            error.push("data property is missing main object.");
    }
    catch (err)
    {
        error.push(err);
    }
    finally
    {
        return error;
    }
}
export let validate=validator;