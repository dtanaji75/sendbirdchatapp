
export let user=(request,response)=>{
    try 
    {
        response.json({"status":"success","msg":"User details accessed","error":''});
    } catch (error) {
        response.json({"status":"unsuccess","msg":"","error":error});
    }
}