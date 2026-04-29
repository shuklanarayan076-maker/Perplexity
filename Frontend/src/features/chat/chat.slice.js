import {createSlice} from "@reduxjs/toolkit"

const chatSlice = createSlice({
    name:'chat',
    initialState:{
        chats:{},
        currentChatId:null,
        isLoading:false,
        error:null,
    },
    reducers:{
        createNewChat(state,action){
            const {chatId,title} = action.payload
            state.chats[chatId] = {
                id: chatId,
                title,
                messages:[],
                lastUpdated: new Date().toISOString()
            }
            
        },
        addNewMessage(state,action){
            const {chatId,content,role,focus,isNew} = action.payload
            state.chats[chatId].messages.push({content,role,focus,isNew})
        },
        addMessages:(state,action)=>{
            const {chatId,messages} = action.payload
            state.chats[chatId].messages.push(...messages.map(msg => ({
                ...msg,
                focus: msg.focus || null
            })))
        },
        setChats(state,action){
            state.chats = action.payload
        },
        setCurrentChatId(state,action){
            state.currentChatId = action.payload
        },
        setLoading(state,action){
            state.isLoading = action.payload
        },
        setError(state,action){
            state.error = action.payload
        },
        removeChat(state, action) {
            const chatId = action.payload;
            delete state.chats[chatId];
            if (state.currentChatId === chatId) {
                state.currentChatId = null;
            }
        },
        replaceChatId(state, action) {
            const { oldId, newId } = action.payload;
            if (state.chats[oldId]) {
                state.chats[newId] = state.chats[oldId];
                state.chats[newId].id = newId;
                delete state.chats[oldId];
            }
            if (state.currentChatId === oldId) {
                state.currentChatId = newId;
            }
        }

    }
    
})

export const {setChats,setCurrentChatId,setLoading,setError,createNewChat,addNewMessage,addMessages,removeChat,replaceChatId} = chatSlice.actions

export default chatSlice.reducer

// chats = {
//     "docker and AWS":{
//         messages:[
//             {
//                 role:"user",
//                 content:"what is docker?"
//             },
//             {
//                 role:"ai",
//                 content:"docker is a containerization platform"
//             }
//         ],
//         id:"docker and AWS",
//         lastUpdated: "2024-06-20T12:00:00Z"
//     }
        
// }