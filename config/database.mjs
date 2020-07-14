import mysql from "mysql";

const db=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"practice"
}).connect((err)=>{
    if(err)
        console.log({"status":"unsuccess","msg":"","error":err});
});

export let insertRecord=async function(){
    try 
    {
       
    } catch (error) {

        return {"status":"unsuccess","msg":"","error":"Problem in inserting new record."};
    }
}