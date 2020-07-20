import mongoose from "mongoose";
import {config} from "../config/config.mjs";
import {dateTime} from "../config/date.mjs";

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect(config.database_url);

const channelSchema=new mongoose.Schema({
    "username":{type:String,required:true},
    "channels":[{
                name:{type:String,required:true},
                isOpen:{type:Boolean,default:false},
                user:{type:String,default:"N/A"},
                channelUrl:{type:String,default:"N/A"},
                created_on:{type:String,default:dateTime.get(config.db_date_format)}
         }]
});

const channelDBModel=new mongoose.model("userChannels",channelSchema);
const channelObj={};
channelObj.addChannel=(data)=>{
    try 
    {
        const response=channelDBModel.find({"username":data.username});
        return response.then(async(result)=>{
            try 
            {
                if(result.length==0)
                {
                    let db={
                        "username":data.username,
                        "channels":[
                            {
                                "name":data.name,
                                "isOpen":data.isOpen,
                                "channelUrl":data.channelUrl,
                                "user":data.user
                            }
                        ]
                    }
                    await channelDBModel(db).save();
                }
                else
                {
                    let channelsObj=result[0].channels;

                    for(let i=0;i<channelsObj.length;i++)
                    {
                        if(channelsObj[i].isOpen==data.isOpen && data.name==channelsObj[i].name && channelsObj[i].isOpen==true)
                            return {"status":"unsuccess","msg":"","error":"Channel already created.","channelUrl":channelsObj[i].channelUrl};
                        if(data.user==channelsObj[i].user)
                            return {"status":"unsuccess","msg":"","error":"Channel already created.","channelUrl":channelsObj[i].channelUrl};
                        
                    }
                    channelsObj.push({
                        "name":data.name,
                        "isOpen":data.isOpen,
                        "channelUrl":data.channelUrl,
                        "user":data.user
                    });

                    let updateResult=await channelDBModel.updateOne({"username":data.username},{$set:{"channels":channelsObj}});
                    console.log(updateResult);
                }
                return {"status":"success","msg":"Channel added successfully.","error":""};
            }
            catch (error)
            {
                return {"status":"unsuccess","msg":"","error":""+error};
            }
        })
    } catch (error) {
        // console.log(error);
        return {"status":"unsuccess","msg":"","error":""+error};
    }
}
channelObj.getUserChannels=(data)=>{
    try 
    {
        let channelData=channelDBModel.find({"username":data.username});
        return channelData.then((result)=>{
            try 
            {
                if(result.length==0)
                    return {"status":"unsuccess","msg":"","error":"No channel found."};
                return {"status":"success","msg":result[0].channels,"error":""};
            } catch (error) {
                return {"status":"unsuccess","msg":"","error":"Problem in fetching channels."};
            }
        })    
    } catch (error) {
        // console.log(error);
        throw new Error(error);
    }
}
channelObj.getUserChannel=(data)=>{
    let channelData=channelDBModel.find({"username":data.username});
    return channelData.then((result)=>{
        try
        {
            if(result.length==0)
                return {"status":"unsuccess","msg":"","error":"No channel found."};
                for(let i=0;i<result[0].channels.length;i++)
                {
                    let channel=result[0].channels[i];
                    if(data.isOpen && channel.isOpen && channel.name==data.name)
                        return {"status":"success","msg":channel,"error":""};
                    else if(channel.user==data.user)
                        return {"status":"success","msg":channel,"error":""};
                    
                }
                return {"status":"unsuccess","msg":"","error":"Channel not found."};    
        }
        catch (error)
        {
            return {"status":"unsuccess","msg":"","error":"Problem in fetching channel details."};
        }
    });
}
export let channeldb=channelObj;