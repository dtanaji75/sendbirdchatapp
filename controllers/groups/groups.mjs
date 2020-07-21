import {SendBirdAction} from "../../config/sendbirdAction.mjs";
import {userdb} from "../../models/user_model.mjs";
import {encrypt} from "../../helper/encryptdecrypt.mjs";
import {dateTime} from "../../config/date.mjs";
import { channeldb } from '../../models/channels_model.mjs';

let groupObj={};

groupObj.createNewGroup=async(data,tokenData)=>{
    try
    {
        let userDetails=await userdb.getUserByToken(tokenData);
        if(userDetails.status=="unsuccess")
            return userDetails;
        userDetails=userDetails.msg;

        let sendBirdUser=new SendBirdAction();
        
        await sendBirdUser.connect(userDetails[0].login.username,userDetails[0].user.name);

        let openChannel=await sendBirdUser.createOpenChannel(data.group_name);

        await sendBirdUser.enter(openChannel.url);

        let channelData={
            name:openChannel.name,
            isOpen:true,
            channelUrl:openChannel.url,
            user:userDetails[0].login.username,
            username:userDetails[0].login.username
        }

        let addChannel=await channeldb.addChannel(channelData);

        if(addChannel.status=="unsuccess")
            return addChannel;

        sendBirdUser.disconnect();

        return {"status":"success","msg":"Group created successfully.","error":""};
    }
    catch (error)
    {
        console.log(error);
        return {"status":"unsuccess","msg":"","error":"Problem in sending message."};
    }
}
groupObj.joinGroup=async(data,tokenData)=>{
    try
    {
        let userDetails=await userdb.getUserByToken(tokenData);
        if(userDetails.status=="unsuccess")
            return userDetails;
        
        userDetails=userDetails.msg;

        let channelDetails=await groupObj.getChannelByName(data,tokenData);
        
        let sendBirdUser=new SendBirdAction();

        if(channelDetails.status=="unsuccess")
            return channelDetails;
        
        channelDetails=channelDetails.msg;

        let channelData={
            name:channelDetails.name,
            isOpen:true,
            channelUrl:channelDetails.channelUrl,
            user:userDetails[0].login.username,
            username:userDetails[0].login.username
        }

        let channelObj=await channeldb.getUserChannel(channelData);

        if(channelObj.status=="unsuccess")
        {
            let addChannel=await channeldb.addChannel(channelData);
            
            if(addChannel.status=="unsuccess")
                return addChannel;
        }

        
        await sendBirdUser.connect(userDetails[0].login.username,userDetails[0].user.name);
        
        channelData=await sendBirdUser.getChannel(channelDetails.channelUrl,true);

        await channelData.enter((response,error)=>{
            if(error)
                throw new Error(error);
        });
        await channelData.sendUserMessage("hi",(response,error)=>{})

        sendBirdUser.disconnect();
        
        return {"status":"success","msg":userDetails[0].user.name+" joined this group","error":""};
    }
    catch (error)
    {
        console.log(error);
        return {"status":"unsuccess","msg":"","error":"Problem in joining a group."};
    }
}
groupObj.leaveGroup=async(data,tokenData)=>{
    try
    {
        let userDetails=await userdb.getUserByToken(tokenData);
        if(userDetails.status=="unsuccess")
            return userDetails;
        
        userDetails=userDetails.msg;

        let sendBirdUser=new SendBirdAction();
        
        await sendBirdUser.connect(userDetails[0].login.username,userDetails[0].user.name);

        let channelDetails=await groupObj.getChannelByName(data,tokenData);

        console.log(channelDetails);

        if(channelDetails.status=="unsuccess")
            return channelDetails;
        
        channelDetails=channelDetails.msg;

        let channelData={
            channelUrl:channelDetails.url,
            username:userDetails[0].login.username
        }

        let removeChannel=await channeldb.removeChannel(channelData);

        if(removeChannel.status=="unsuccess")
            return addChannel;

        channelData=await sendBirdUser.getChannel(channelDetails.url,true);

        await channelData.exit((response,error)=>{
            if(error)
                throw new Error(error);
        });
        
        sendBirdUser.disconnect();

        return {"status":"success","msg":userDetails[0].user.name+" left this group","error":""};
    }
    catch (error)
    {
        console.log(error);
        return {"status":"unsuccess","msg":"","error":"Problem in leaving group."};
    }
}
groupObj.getAllOpenGroupDetails=async(tokenData)=>{
    try
    {
        let userDetails=await userdb.getUserByToken(tokenData);
        if(userDetails.status=="unsuccess")
            return userDetails;
        
        userDetails=userDetails.msg;
        
        let sendBirdUser=new SendBirdAction();
        
        await sendBirdUser.connect(userDetails[0].user.email,userDetails[0].user.name);
                
        let groupMessages=[];
        let openChannelDetails=await sendBirdUser.getOpenChannelList();

        for(let i=0;i<openChannelDetails.length;i++)
        {
            let channelObj=openChannelDetails[i];

            let participantObj=await channeldb.getParticipants({"channelUrl":channelObj.url});
            
            if(participantObj.status=="unsuccess")
                participantObj=[];
            else
                participantObj=participantObj.msg;
            
            groupMessages.push({"channelUrl":channelObj.url,"group_name":channelObj.name,"group_created_on":dateTime.convert(channelObj.createdAt),"members":paticipantObj});
        }

        sendBirdUser.disconnect();

        return {"status":"success","msg":groupMessages,"error":""};
    }
    catch (error)
    {
        console.log(error);
        return {"status":"unsuccess","msg":"","error":"Problem in fetching group details."};
    }
}
groupObj.getChannelByName=async(data,tokenData)=>
{
    try
    {
        let userDetails=await userdb.getUserByToken(tokenData);
        if(userDetails.status=="unsuccess")
            return userDetails;
        
        userDetails=userDetails.msg;

        let sendBirdUser=new SendBirdAction();
        
        await sendBirdUser.connect(userDetails[0].user.email,userDetails[0].user.name);
        
        let openChannelDetails=await sendBirdUser.getOpenChannelList();

        let channelObj={};
        let channelFlag=false;
        
        for(let i=0;i<openChannelDetails.length;i++)
        {
            channelObj=openChannelDetails[i];
            
            if(channelObj.name==data.group_name)
            {
                channelFlag=true;
                break;
            }

        }
        sendBirdUser.disconnect();
        if(channelFlag)
        {
            let participantObj=await channeldb.getParticipants({"channelUrl":channelObj.url});
            
            if(participantObj.status=="unsuccess")
                participantObj=[];
            else
                participantObj=participantObj.msg;
            
            return {"status":"success","msg":{"channelUrl":channelObj.url,"group_name":channelObj.name,"group_created_on":dateTime.convert(channelObj.createdAt),"members":participantObj},"error":""};
        }
        return {"status":"unsuccess","msg":"","error":"Group details not found."};
    }
    catch (error)
    {
        console.log(error);
        return {"status":"unsuccess","msg":"","error":"Problem in fetching group details."};
    }
}
export let groups=(request,response)=>{
    try 
    {
        
        let data=request.body;

        if(data.action=="createNewGroup")
        {
            const token=request.headers.authorization.replace("Bearer ","");
            const result=encrypt.verifyToken(token);
            result.then((result)=>{
                if(result.status=="unsuccess")
                {
                    response.json(result);
                    return;
                }
                
                let resp=groupObj.createNewGroup(data.data,result.msg);
                
                resp.then((result)=>{
                    response.json(result);
                });
                resp.catch((error)=>{
                    response.json({"status":"unsuccess","msg":"","error":error});
                });
            });
        }
        else if(data.action=="joinGroup")
        {
            const token=request.headers.authorization.replace("Bearer ","");
            const result=encrypt.verifyToken(token);
            result.then((result)=>{
                if(result.status=="unsuccess")
                {
                    response.json(result);
                    return;
                }
                let resp=groupObj.joinGroup(data.data,result.msg);
                
                resp.then((result)=>{
                    response.json(result);
                });
                resp.catch((error)=>{
                    response.json({"status":"unsuccess","msg":"","error":error});
                });
            });
        }
        else if(data.action=="leaveGroup")
        {
            const token=request.headers.authorization.replace("Bearer ","");
            const result=encrypt.verifyToken(token);
            result.then((result)=>{
                if(result.status=="unsuccess")
                {
                    response.json(result);
                    return;
                }
                let resp=groupObj.leaveGroup(data.data,result.msg);
                
                resp.then((result)=>{
                    response.json(result);
                });
                resp.catch((error)=>{
                    response.json({"status":"unsuccess","msg":"","error":error});
                });
            });
        }
        else if(data.action=="getGroupByName")
        {
            const token=request.headers.authorization.replace("Bearer ","");
            const result=encrypt.verifyToken(token);
            result.then((result)=>{
                if(result.status=="unsuccess")
                {
                    response.json(result);
                    return;
                }
                let resp=groupObj.getChannelByName(data.data,result.msg);
                
                resp.then((result)=>{
                    response.json(result);
                });
                resp.catch((error)=>{
                    response.json({"status":"unsuccess","msg":"","error":error});
                });
            });
        }
        else if(data.action=="getAllGroups")
        {
            const token=request.headers.authorization.replace("Bearer ","");
            const result=encrypt.verifyToken(token);
            result.then((result)=>{
                if(result.status=="unsuccess")
                {
                    response.json(result);
                    return;
                }
                let resp=groupObj.getAllOpenGroupDetails(result.msg);
                
                resp.then((result)=>{
                    response.json(result);
                });
                resp.catch((error)=>{
                    response.json({"status":"unsuccess","msg":"","error":error});
                });
            });
        }
        else
        {
            response.json({"status":"unsuccess","msg":"","error":data.action+" is not present."});
        }
        // response.json({"status":"success","msg":"User details accessed","error":''});
    }
    catch (error)
    {
        console.log(error);
        response.json({"status":"unsuccess","msg":"","error":error});
    }
}