import {SendBirdAction} from "./sendBirdAction.mjs";
const sendBird=new SendBirdAction();
async function msgDemo(){
    await sendBird.connect("nitin@gmail.com","Nitin");

    let channelObj=await sendBird.getChannel("sendbird_open_channel_8292_adcd04dca09cb8059694b4a758b194ec93a15a1e");
    // console.log(channelObj);
    await channelObj.enter((response,error)=>error);
    // channelObj.sendUserMessage("This is demo",(message,error)=>{
    //     if(error)
    //     {
    //         console.log(error);
    //         return;
    //     }
    //     // console.log(message);
    // })

    // let groupChannels=await sendBird.getGroupChannelList();
    let openChannels=await sendBird.getOpenChannelList();
    console.log("Channel list result");
    console.log("Group")
    // console.log(groupChannels);
    for(let i=0;i<openChannels.length;i++)
    {
        let channelObj=await sendBird.getChannel(openChannels[i].url);
        console.log(channelObj);
        let userMessage=await sendBird.getMessageList(channelObj);
        console.log(userMessage);
    }
    // console.log("Open")
    // console.log(openChannels);
}

msgDemo();