import api from "./client";
const notification = '/api/notification'

export const registerPushToken = async (token) => {
    try{
        const response = await api.post(`${notification}/register-push-token`, {
            token: token,
        });
        return response.data;
    }
    catch(err){
        console.error("Error registering push token:", err);
        throw err;
    }
}