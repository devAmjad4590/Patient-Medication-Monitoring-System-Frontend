import api from "./client";

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL; // Your FastAPI server URL

// Process audio file with FastAPI
export const processVoiceCommand = async (audioUri) => {
    try {
        console.log('Processing voice command with audio:', audioUri);
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('audio_file', {
            uri: audioUri,
            type: 'audio/wav',
            name: 'voice_command.wav',
        });

        // Send to FastAPI for processing
        const response = await fetch(`${FASTAPI_BASE_URL}/process-audio`, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (!response.ok) {
            throw new Error(`FastAPI error: ${response.status}`);
        }

        const result = await response.json();
        console.log('FastAPI response:', result);
        return result;
    } catch (error) {
        console.log("Error: ",error)
    }
};

// Execute voice command via Express backend - REMOVED timeRange
export const executeVoiceCommand = async (voiceResult) => {
    try {
        console.log('Executing voice command:', voiceResult);
        
        const response = await api.post('/api/voice/voice-command', {
            intent: voiceResult.intent,
            medicationName: voiceResult.medicationName,
            originalTime: voiceResult.originalTime,
            scheduledTime: voiceResult.scheduledTime,
            status: voiceResult.status,
            searchCriteria: voiceResult.searchCriteria,
            apiPayload: voiceResult.apiPayload
            // REMOVED: timeRange field
        });
        
        console.log('Voice command execution response:', response.data);
        return response.data;
    } catch (error) {
        console.log('Error executing voice command:', error);
        
        // Check if the error response contains voice messages
        if (error.response && error.response.data) {
            console.log('Error response data:', error.response.data);
            // Return the error response data which should contain voiceResponse
            return {
                success: false,
                ...error.response.data
            };
        }
        
        throw error;
    }
};

// Combined function to process and execute voice command
export const handleVoiceCommand = async (audioUri) => {
    try {
        // Step 1: Process audio with FastAPI
        const voiceResult = await processVoiceCommand(audioUri);
        
        // Step 2: Execute command via Express backend
        const executionResult = await executeVoiceCommand(voiceResult);
        
        // Return structured response with voice messages
        return {
            success: executionResult.success,
            voiceResult,
            executionResult,
            // Extract voice message for speaking
            voiceMessage: executionResult.voiceResponse || 
                         executionResult.spokenFeedback || 
                         executionResult.message ||
                         voiceResult.confirmationText ||
                         (executionResult.success ? 'Command completed' : 'Command failed')
        };
    } catch (error) {
        console.log('Error in voice command pipeline:', error);
        
        // Return error with voice message
        return {
            success: false,
            error: error.message,
            voiceMessage: 'Failed to process voice command. Please try again.'
        };
    }
};