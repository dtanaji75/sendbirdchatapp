import {user} from "../controllers/user/users.mjs"
import {chat} from "../controllers/chat/chat.mjs";
import {groups} from "../controllers/groups/groups.mjs";
export let router=[
    {
        "model_name":"user",
        "model":user
    },
    {
        "model_name":"chat",
        "model":chat
    },
    {
        "model_name":"group",
        "model":groups
    }
]