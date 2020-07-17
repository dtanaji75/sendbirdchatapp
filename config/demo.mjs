import {encrypt} from "../helper/encryptdecrypt.mjs";

async function validateToken()
{
    try 
    {
        let result=await encrypt.verifyToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjdkMGJlYjVjOWQ3MmYxZjZhNDhlMTg2NzM5MTc0YTQwOGE4ZDQxZjgxZWRjZTEwMTMwNDlhNzkzN2FjZTg5YzYiLCJ1c2VyX3R5cGUiOiJ1c2VyIiwiaWF0IjoxNTk0OTA1OTc1fQ.QuZt9Qn3B0HuIAIwSbmJ0u5JoVy9GmhjShKjPH7r9zM");
        console.log(result);
    } catch (error) {
        console.log(error);
    }
}
validateToken();