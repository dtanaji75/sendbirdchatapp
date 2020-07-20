import profanity  from '@2toad/profanity';
import badwords from 'bad-words';
import {SendBirdAction} from "../../config/sendBirdAction.mjs";
import {userdb} from "../../models/user_model.mjs";
import {encrypt} from "../../helper/encryptdecrypt.mjs";
import {dateTime} from "../../config/date.mjs";

let chatObj={};

chatObj.getUserList=async(data,tokenData)=>{
    try 
    {
        let userData={
            user_type:"admin",
            username:tokenData.username
        }
        if(data.name!="")
            userData.name=data.name;
        if(data.status!="")
            userData.status=data.status;
        if(data.email!="")
            userData.email=data.email;
        if(data.contactno!="")
            userData.contactno=data.contactno;
        if(data.location!="" && tokenData.user_type=="stall")
            userData.location=data.location;
        if(data.stallname!="" && tokenData.user_type=="stall")
            userData.stallname=data.stallname;
            
        let response = await userdb.getUserDetails(userData);
        return response;
    } catch (error) {
        console.log(error);
        return {"status":"unsuccess","msg":"","error":"Problem in fetching user list"};
    }
}
chatObj.sendUserMessage=async(data,tokenData)=>
{
    try
    {
        let userDetails=await userdb.getUserByToken(tokenData);
        if(userDetails.status=="unsuccess")
            return userDetails;
        userDetails=userDetails.msg;
        let sendBirdUser=new SendBirdAction();
        
        await sendBirdUser.connect(userDetails[0].user.email,userDetails.user.name);
        let channelDetails=await sendBirdUser.getChannel(data.url,false);

        let messageResult=await channelDetails.sendUserMessage(data.message,(message,error)=>{});

        sendBirdUser.disconnect();

        return {"status":"success","msg":"Message sent successfully.","error":""};
    }
    catch (error)
    {
        console.log(error);
        return {"status":"unsuccess","msg":"","error":"Problem in sending message."};
    }
}
chatObj.getUserMessage=async(tokenData)=>{
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

            let paticipantObj=await sendBirdUser.getParticipantList(channelObj.url);
            
            let userMsg=await sendBirdUser.getMessageList(channelObj,true);
            
            let grpMsg=[];
            for(let j=0;j<userMsg.length;j++)
            { 
                
                let message={
                    "messageId":userMsg[j].messageId,
                    "message":userMsg[j].message,
                    "message_date_time":dateTime.convert(userMsg[j].createdAt),
                    "sender_id":userMsg[j]._sender.userId,
                    "sender_name":userMsg[j]._sender.nickname,
                    "send_status":userMsg[j].sendingStatus
                }
                grpMsg.push(message);
            }
            groupMessages.push({"channelUrl":channelObj.url,"group_name":channelObj.name,"group_created_on":dateTime.convert(channelObj.createdAt),"group_messages":grpMsg,"members":paticipantObj});
        }

        sendBirdUser.disconnect();

        return {"status":"success","msg":{"userMessages":userMessages,"groupMessages":groupMessages},"error":""};
    }
    catch (error)
    {
        console.log(error);
        return {"status":"unsuccess","msg":"","error":"Problem in sending message."};
    }
}
chatObj.createNewGroup=async(data,tokenData)=>{
    try
    {
        let userDetails=await userdb.getUserByToken(tokenData);
        if(userDetails.status=="unsuccess")
            return userDetails;
        userDetails=userDetails.msg;

        let sendBirdUser=new SendBirdAction();
        
        await sendBirdUser.connect(userDetails[0].user.email,userDetails.user.name);

        let openChannel=await sendBirdUser.createOpenChannel(data.group_name);

        await sendBirdUser.enter(openChannel.url);

        sendBirdUser.disconnect();

        return {"status":"success","msg":"Person added successfully.","error":""};
    }
    catch (error)
    {
        console.log(error);
        return {"status":"unsuccess","msg":"","error":"Problem in sending message."};
    }
}
chatObj.getChannelByName=async(data,tokenData)=>
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
        console.log("User given name"+data.user);
        for(let i=0;i<openChannelDetails.length;i++)
        {
            channelObj=openChannelDetails[i];
            
            // groupMessages.push({"channelUrl":channelObj.url,"group_name":c,"group_created_on":dateTime.convert(channelObj.createdAt),"group_messages":grpMsg,"members":paticipantObj});

            console.log("Channel Name:"+channelObj.name);
            if(channelObj.name==data.user)
            {
                channelFlag=true;
                break;
            }

        }
        sendBirdUser.disconnect();

        if(channelFlag)
            return {"status":"success","msg":channelObj,"error":""};
        else
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
        
        let data=request.body.data;
        data=eval('('+data+")");

        if(data.action=="getUsers")
        {
            const token=request.headers.authorization.replace("Bearer ","");
            const result=encrypt.verifyToken(token);
            result.then((result)=>{
                if(result.status=="unsuccess")
                {
                    response.json(result);
                    return;
                }
                let validateWord=new profanity.Profanity();
                if(validateWord.exists(data.data.msg))
                {
                    let wordsFilter=new badwords();
                    let msg=wordsFilter.clean(data.data.msg);
                    response.json({"status":"unsuccess","msg":"","error":"Your message contains abusive words ("+msg+") remove it and send it again."});
                }
                let resp=chatObj.getUserList(data.data,result.msg);
                
                resp.then((result)=>{
                    response.json(result);
                });
                resp.catch((error)=>{
                    response.json({"status":"unsuccess","msg":"","error":error});
                });
            });
        }
        if(data.action=="getUserMessage")
        {
            const token=request.headers.authorization.replace("Bearer ","");
            const result=encrypt.verifyToken(token);
            result.then((result)=>{
                if(result.status=="unsuccess")
                {
                    response.json(result);
                    return;
                }
                let resp=chatObj.getUserMessage(result.msg);
                
                resp.then((result)=>{
                    response.json(result);
                });
                resp.catch((error)=>{
                    response.json({"status":"unsuccess","msg":"","error":error});
                });
            });
        }
        // response.json({"status":"success","msg":"User details accessed","error":''});
    } catch (error) {
        console.log(error);
        response.json({"status":"unsuccess","msg":"","error":error});
    }
}