import profanity  from '@2toad/profanity';
import badwords from 'bad-words';
import {SendBirdAction} from "../../config/sendbirdAction.mjs";
import {userdb} from "../../models/user_model.mjs";
import {channeldb} from "../../models/channels_model.mjs";
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
        // console.log(tokenData);
        let userDetails=await userdb.getUserByToken(tokenData);
        if(userDetails.status=="unsuccess")
            return userDetails;
        
        userDetails=userDetails.msg;

        if(userDetails[0].login.username==data.user)
            return {"status":"unsuccess","msg":"","error":"Sender and receiver user cannot be same"};

        let channelinfo="";
        
        let userData={
            isOpen:false,
            username:userDetails[0].login.username,
            name:data.user,
            user:data.user
        }
        channelinfo=await channeldb.getUserChannel(userData);

        // console.log(channelinfo);
        
        let sendBirdUser=new SendBirdAction();
        
        await sendBirdUser.connect(userDetails[0].login.username,userDetails[0].user.name);

        if(channelinfo.status=="unsuccess")
        {
            let newchannelinfo=await sendBirdUser.createGroupChannel([userDetails[0].login.username,data.user]);

            channelinfo={
                "status":"success",
                "msg":{
                name:userDetails[0].login.username+"_"+data.user,
                isOpen:false,
                channelUrl:newchannelinfo.url,
                user:data.user,
                username:userDetails[0].login.username
                },
                "error":""
            }
            let addChannel=await channeldb.addChannel({
                name:userDetails[0].login.username+"_"+data.user,
                isOpen:false,
                channelUrl:newchannelinfo.url,
                user:data.user,
                username:userDetails[0].login.username
                });

            if(addChannel.status=="unsuccess")
                return addChannel;

            addChannel=await channeldb.addChannel({
                name:userDetails[0].login.username+"_"+data.user,
                isOpen:false,
                channelUrl:newchannelinfo.url,
                username:data.user,
                user:userDetails[0].login.username
            });

            if(addChannel.status=="unsuccess")
                return addChannel;
        }
        console.log(channelinfo.msg.channelUrl);
        let channelDetails = await sendBirdUser.getChannel(channelinfo.msg.channelUrl,false);

        // console.log(channelDetails);

        let messageResult=await channelDetails.sendUserMessage(data.message,(message,error)=>{
            if(error)
                console.log(error)
            else
                console.log(message);
        });

        console.log(messageResult);
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
        
        await sendBirdUser.connect(userDetails[0].login.username,userDetails[0].user.name);
        let groupChannelDetails=await channeldb.getUserChannels({username:userDetails[0].login.username});

        // console.log(groupChannelDetails);

        groupChannelDetails=groupChannelDetails.msg;
        
        // console.log(groupChannelDetails);
        let userMessages=[];
        for(let i=0;i<groupChannelDetails.length;i++)
        {
            if(groupChannelDetails[i].isOpen)
                continue;
            
            // console.log(groupChannelDetails[i].channelUrl);

            let channelObj=await sendBirdUser.getChannel(groupChannelDetails[i].channelUrl,false);
            
            
            let userMsg=await sendBirdUser.getMessageList(channelObj,true);
            
            let msg=[];
            for(let j=0;j<userMsg.length;j++)
            {
                if(userMsg[j].customType!="" || userMsg[j].messageType=="admin")
                    continue;
                let message={
                    "messageId":userMsg[j].messageId,
                    "channelUrl":userMsg[j].channelUrl,
                    "message":userMsg[j].message,
                    "message_date_time":dateTime.convert(userMsg[j].createdAt),
                    "send_status":userMsg[j].sendingStatus,
                    "sender_id":userMsg[j]._sender.userId,
                    "sender_name":userMsg[j]._sender.nickname
                }               
                msg.push(message);
            }
            
            userMessages.push({
                "userId":groupChannelDetails[i].user
                ,"messages":msg})
        }

        sendBirdUser.disconnect();

        return {"status":"success","msg":userMessages,"error":""};
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
export {
    chatObj
};
export let chat=(request,response)=>{
    try 
    {
        let data=request.body.data;
        data=eval('('+data+")");

        if(!request.headers.hasOwnProperty("authorization"))
        {
            response.json({"status":"unsuccess","msg":"","error":"Api-key is missing"});
        }
        else if(request.headers.authorization=="")
        {
            response.json({"status":"unsuccess","msg":"","error":"Api-key cannot be empty."});
        }
        else if(data.action=="getUsers")
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
        else if(data.action=="getUserMessage")
        {
            const token=request.headers.authorization.replace("Bearer ","");
            const result=encrypt.verifyToken(token);
            
            result.then((result)=>{
                // console.log(result);
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
                let resp=chatObj.getChannelByName(data.data,result.msg);
                
                resp.then((result)=>{
                    response.json(result);
                });
                resp.catch((error)=>{
                    response.json({"status":"unsuccess","msg":"","error":error});
                });
            });
        }
        else if(data.action=="sendMessage")
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
                    return;
                }
                
                let resp=chatObj.sendUserMessage(data.data,result.msg);
                
                resp.then((result)=>{
                    response.json(result);
                });
                resp.catch((error)=>{
                    response.json({"status":"unsuccess","msg":"","error":error});
                });
            });
        }
        else
            response.json({"status":"unsuccess","msg":"Wrong action provided.("+data.action+") action not present.","error":''});
    } catch (error) {
        console.log(error);
        response.json({"status":"unsuccess","msg":"","error":error});
    }
}