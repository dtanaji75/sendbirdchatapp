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
        let groupChannelDetails=await sendBirdUser.getGroupChannelList();

        let userMessages=[];
        for(let i=0;i<groupChannelDetails.length;i++)
        {
            let channelObj=groupChannelDetails[i];
            let firstUserId=channelObj.members[0].userId;
            let firstUserName=channelObj.members[0].nickname;
            let secondUserId="";
            let secondUserName="";
            for(let i=0;i<channelObj.members.length;i++)
            {
                let member=channelObj.members[i];
                if(firstUserId!=member.userId)
                {
                    secondUserId=member.userId;
                    secondUserName=member.nickname;
                }
            }
            
            let userMsg=await sendBirdUser.getMessageList(channelObj,true);
            // console.log(userMsg);
            for(let j=0;j<userMsg.length;j++)
            {
                if(userMsg[j].customType!="")
                    continue;
                let message={
                    "messageId":userMsg[j].messageId,
                    "channelUrl":userMsg[j].channelUrl,
                    "message":userMsg[j].message,
                    "message_date_time":dateTime.convert(userMsg[j].createdAt),
                    "send_status":userMsg[j].sendingStatus
                }
                
                if(userMsg[j].messageType=="admin")
                {
                    message.sender_id="Admin";
                    message.sender_name="Administrator";
                }
                else
                {
                    message.sender_id=userMsg[j]._sender.userId;
                    message.sender_name=userMsg[j]._sender.nickname;
                }
                if(message.sender_id==firstUserId)
                {
                    message.receiver_id=secondUserId;
                    message.receiver_name=secondUserName;
                }
                else
                {
                    message.receiver_id=firstUserId;
                    message.receiver_name=firstUserName;
                }
                userMessages.push(message);
            }
        }
        let groupMessages=[];
        let openChannelDetails=await sendBirdUser.getOpenChannelList();

        for(let i=0;i<openChannelDetails.length;i++)
        {
            let channelObj=openChannelDetails[i];

            // console.log(channelObj);

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
export let chat=(request,response)=>{
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