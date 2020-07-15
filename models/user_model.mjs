import mongoose from "mongoose";
import {config} from "../config/config.mjs";
import {dateTime} from "../config/date.mjs";
import {encrypt} from "../helper/encryptdecrypt.mjs";
import {log} from "../config/log.mjs"

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect(config.database_url);

const userSchema=new mongoose.Schema({
    "user":{
        "name":{type:String,require:true},
        "email":{type:String,require:true},
        "contact":{type:String,require:true},
        "address":{type:String,require:true},
        "user_type":{type:String,default:"user"},
        "created_on":{type:Date ,default:dateTime.get(config.db_date_format)},
        "user_salt":{type:String,default:"N/A"}
    },
    "login":{
        "username":{type:String,require:true},
        "password":{type:String,require:true},
        "username1":{type:String,default:"N/A"},
        "password1":{type:String,default:"N/A"},
        "user1_logged_in":{type:Date ,default:dateTime.get(config.db_date_format)},
        "user2_logged_in":{type:Date ,default:dateTime.get(config.db_date_format)},
        "token1":{type:String,require:true},
        "token2":{type:String,default:"N/A"}
    },
    "stall":{
        "name":{type:String,default:"N/A"},
        "location":{type:String,default:"N/A"},
        "channel":{type:String,default:"N/A"}
    }
});
userSchema.pre('save',async function(next){
    try
    {
        let user=this;

        let response=await userObj.verifyUser(user);

        if(response.status=="unsuccess")
            throw new Error(response.error);
        
        let encryptData=encrypt.password(user.login.password);

        user.user.name=encrypt.encrypt(user.user.name,encryptData.salt);
        user.user.email=encrypt.encrypt(user.user.email,encryptData.salt);
        user.user.contact=encrypt.encrypt(user.user.contact,encryptData.salt);
        user.user.address=encrypt.encrypt(user.user.address,encryptData.salt);
        user.user.user_salt=encryptData.salt_string;

        user.login.username=encrypt.encrypt(user.login.username,encryptData.salt);
        user.login.password=encryptData.password;
        user.login.username1=encrypt.encrypt(user.login.username1,encryptData.salt);
        user.login.password1=encrypt.passwordWithSaltString(user.login.password1,encryptData.salt_string);

        user.stall.name=encrypt.encrypt(user.stall.name,encryptData.salt);
        user.stall.location=encrypt.encrypt(user.stall.location,encryptData.salt);
        user.stall.channel=encrypt.encrypt(user.stall.channel,encryptData.salt);

        let token=encrypt.generateToken({"username":user.login.username,"user_type":user.user.user_type});
		
		if(token.status=="unsuccess")
            throw new Error(token.error);
            
        user.login.token1=token.msg;
        
        if(user.user.user_type=="stall")
        {
            let token1=encrypt.generateToken({"username":user.login.username1,"user_type":user.user.user_type});
		
		    if(token1.status=="unsuccess")
                throw new Error(token1.error);
            
            user.login.token2=token1.msg;
        }
        next();
    }
    catch (error)
    {
        console.log(error);
        throw new Error(error);
    }
});
userSchema.post("find",function(data){
    try 
    {
        for(let i=0;i<data.length;i++)
        {
            data[i].user.name=encrypt.decrypt(data[i].user.name,data[i].user.user_salt);
            data[i].user.email=encrypt.decrypt(data[i].user.email,data[i].user.user_salt);
            data[i].user.contact=encrypt.decrypt(data[i].user.contact,data[i].user.user_salt);
            data[i].user.address=encrypt.decrypt(data[i].user.address,data[i].user.user_salt);

            data[i].login.username=encrypt.decrypt(data[i].login.username,data[i].user.user_salt);
            data[i].login.username1=encrypt.decrypt(data[i].login.username1,data[i].user.user_salt);

            data[i].stall.name=encrypt.decrypt(data[i].stall.name,data[i].user.user_salt);
            data[i].stall.location=encrypt.decrypt(data[i].stall.location,data[i].user.user_salt);
            data[i].stall.channel=encrypt.decrypt(data[i].stall.channel,data[i].user.user_salt);
        }
    } catch (error) {
        // console.log(error);
        throw new Error(error);
    }
});
const userDBModel=new mongoose.model("chatUsers",userSchema);
const userObj={};
userObj.addUser=(data)=>{
    try 
    {
        const response=userDBModel(data).save();
        return response.then((result)=>{
            return {"status":"success","msg":"User created successfully.","error":""};
        })
    } catch (error) {
        // console.log(error);
        return {"status":"unsuccess","msg":"","error":""+error};
    }
}
userObj.verifyUser=(data)=>{
    try 
    {
        let userData=userDBModel.find({"user.user_type":data.user.user_type});
        return userData.then((result)=>{
            try 
            {
                for(let i=0;i<result.length;i++)
                {
                    if(data.user.email==result[i].user.email)
                        return {"status":"unsuccess","msg":"","error":"Email id already exists."};
                    if(data.user.contact==result[i].user.contact)
                        return {"status":"unsuccess","msg":"","error":"Contact number already exists."};
                }
                return {"status":"success","msg":"User verified successfully.","error":""};
            } catch (error) {
                return {"status":"unsuccess","msg":"","error":"Problem in verifing user."};
            }
        })    
    } catch (error) {
        // console.log(error);
        throw new Error(error);
    }
}
userObj.getUserDetails=(data)=>{
    try
    {
        let response="";
        if(data.user_type=="admin")
            response=userDBModel.find();
        else if (data.user_type=="stall")
            response=userDBModel.find({$or:[{"login.username":data.username},{"login.username1":data.username}]});
        else
            response=userDBModel.find({"login.username":data.username});

        return response.then((result)=>{
            try
            {
                if(result.length==0)
                    return {"status":"unsuccess","msg":"","error":"No record found."};
                return {"status":"success","msg":result,"error":""};
            }
            catch (error)
            {
                log.error("Exception in userObj.getUserDetails inner function::"+error);
                return {"status":"unsuccess","msg":"","error":"Problem in fetching user details. Please try after sometime."};
            }
        });
    }
    catch (error)
    {
        console.error(error);
        return {"status":"unsuccess","msg":"","error":"Problem in fetching user details. Please try again."};
    }
}
userObj.get
export let userdb=userObj;