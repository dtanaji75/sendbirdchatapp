let validator={};

validator.validateRegister=(data)=>{
    let error=[];
    try
    {
        if(!data.hasOwnProperty("name"))
            error.push("name property is missing in main object.");
        if(!data.hasOwnProperty("email"))
            error.push("email property is missing main object.");
        if(!data.hasOwnProperty("contact"))
            error.push("contact property is missing in main object.");
        if(!data.hasOwnProperty("address"))
            error.push("address property is missing main object.");
        if(!data.hasOwnProperty("nickname"))
            error.push("nickname property is missing in main object.");
        if(!data.hasOwnProperty("password"))
            error.push("password property is missing main object.");

        if(error.length>0)
            return error;
        
        if(data.name=="")
            error.push("Name cannot be empty.");
        if(data.email=="")
            error.push("Email cannot be empty.");
        if(data.contact=="")
            error.push("Contact number cannot be empty.");
        if(data.nickname=="")
            error.push("Nickname cannot be empty.");
        if(data.password=="")
            error.push("Password cannot be empty.");
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
validator.validateLogin=(data)=>{
    let error=[];
    try
    {
        if(!data.hasOwnProperty("username"))
            error.push("username property is missing in main object.");
        if(!data.hasOwnProperty("password"))
            error.push("password property is missing main object.");
        if(!data.hasOwnProperty("user_type"))
            error.push("user_type property is missing in main object.");

        if(error.length>0)
            return error;
        
        if(data.username=="")
            error.push("Username cannot be empty.");
        if(data.password=="")
            error.push("Password cannot be empty.");
        if(data.user_type=="")
            error.push("User type cannot be empty.");
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
validator.validateBlockUser=(data)=>{
    let error=[];
    try
    {
        if(!data.hasOwnProperty("user"))
            error.push("user property is missing in main object.");
        

        if(error.length>0)
            return error;
        
        if(data.user=="")
            error.push("user cannot be empty.");
        
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
validator.validateUnblockUser=(data)=>{
    let error=[];
    try
    {
        if(!data.hasOwnProperty("user"))
            error.push("user property is missing in main object.");
        

        if(error.length>0)
            return error;
        
        if(data.user=="")
            error.push("user cannot be empty.");
        
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
export let userValidator=validator;