import {SendBirdAction} from "./sendbirdAction.mjs";
let sendBird=new SendBirdAction();


async function connect(){
    let result=await sendBird.connect("dtanaji75@gmail.com","Tanaji Deshmukh");

    console.log(sendBird.getUserList());
    // console.log(result1);
}

connect();
