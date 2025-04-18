import api from "./client";

export const getURL = () => {
    console.log("BASE_URL:", api.defaults.baseURL);
    return api.defaults.baseURL;
}

export const login = async (email, password) => {
    try {
        const data = {
            email: email,
            password: password
        };
        const response = await api.post('/api/auth/login', data);
        return response;
    } catch (error) {
        throw error;
    }
}

export const signUp = async (user) => {
    try {
        const response = await api.post('/api/auth/register', {
            email: user.email,
            password: user.password,
            name: user.name,
            phoneNumber: user.phoneNumber
        });
        return response;
    } catch (error) {
        console.log(error.response.data)
        throw error;
    }
}

