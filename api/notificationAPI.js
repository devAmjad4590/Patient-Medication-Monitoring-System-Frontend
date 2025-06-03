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

export const snoozeMedicationReminder = async (medicationIds) => {
  try{
    const response = await api.post(`${notification}/snooze-medication-reminder`, {
      medicationIds: medicationIds,
    });
    return response.data;
  }
  catch(err){
    console.error("Error snoozing medication reminder:", err);
    throw err;
  }
}