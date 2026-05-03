
import { GenerateContentResponse, Part } from "@google/genai";
import { Task } from '../types';

const callApi = async (data: any): Promise<GenerateContentResponse> => {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to call AI API');
    }

    const result = await response.json();
    // Wrap the text response in a partial GenerateContentResponse-like object
    return {
        text: result.text,
        // Mocking other properties if needed, but the app mostly uses .text
    } as any;
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const baseGenerateTasks = async (prompt: string, systemInstruction: string, imageFile?: File): Promise<Omit<Task, 'id' | 'status'>[]> => {
    let jsonText: string | undefined;
    try {
        const model = imageFile ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
        
        const parts: any[] = [{ text: prompt }];
    
        if (imageFile) {
            const imagePart = await fileToGenerativePart(imageFile);
            parts.unshift(imagePart);
        }

        const response = await callApi({
            prompt: prompt, // For simple prompt
            systemInstruction: systemInstruction,
            model: model,
            config: {
                responseMimeType: "application/json",
            }
        });
    
        jsonText = response.text;
        if (!jsonText) {
          throw new Error("No response text from Gemini.");
        }
    
        const sanitizedJsonText = jsonText.trim().replace(/^```json/, '').replace(/```$/, '').trim();
        const parsedTasks = JSON.parse(sanitizedJsonText);
        
        if (!Array.isArray(parsedTasks)) {
            throw new Error("Invalid task structure received from AI.");
        }
    
        return parsedTasks.map(task => ({
            title: task.title,
            description: task.description || undefined,
            dueDate: task.dueDate,
            dueTime: task.dueTime || undefined,
            endTime: task.endTime || undefined,
        }));

    } catch (error) {
        console.error("Error generating tasks:", error);
        throw new Error("Failed to generate a plan with AI. Please check your connection.");
    }
};

const FUNCTION_CALLING_SYSTEM_INSTRUCTION = `You are a friendly and encouraging productivity assistant named ClearDay. Your purpose is to help the user manage their schedule by adding tasks.
- Look for any user input that could be a task.
- Today's date is ${new Date().toISOString().split('T')[0]}. Use YYYY-MM-DD format.
- If a due date is ambiguous, calculate it based on today.
- Respond with a natural, friendly confirmation.`;

export const chatWithAI = async (history: Part[]): Promise<GenerateContentResponse> => {
    try {
        const lastMessage = history[history.length - 1];
        const prompt = lastMessage.parts[0].text;
        
        return await callApi({
            history: history.slice(0, -1),
            prompt: prompt,
            systemInstruction: FUNCTION_CALLING_SYSTEM_INSTRUCTION,
            model: 'gemini-1.5-flash'
        });
    } catch (error) {
        console.error("Error in AI chat:", error);
        throw new Error("Failed to get a response from the AI.");
    }
}

const QUICK_PLAN_SYSTEM_INSTRUCTION = `You are a friendly productivity assistant named ClearDay. Break down the user's goal into small, manageable tasks.
Respond with ONLY a valid JSON array of task objects: [{"title": "...", "description": "...", "dueDate": "YYYY-MM-DD"}].`;

const GOAL_PLANNING_SYSTEM_INSTRUCTION = `You are a supportive planning assistant for ClearDay. Turn the user's goal into a structured plan.
Respond with ONLY a valid JSON array of task objects.`;

const BRAINSTORM_SYSTEM_INSTRUCTION = `You are a helpful and conversational planning assistant for ClearDay.
Help the user flesh out their goal. Summarize key info and suggest next steps.`;

export const brainstormWithAI = async (conversation: string, imageFile?: File): Promise<string> => {
    try {
        const model = imageFile ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
        const response = await callApi({
            prompt: conversation,
            systemInstruction: BRAINSTORM_SYSTEM_INSTRUCTION,
            model: model
        });

        const text = response.text;
        if (!text) {
            throw new Error("No response text from Gemini.");
        }
        return text;
    } catch (error) {
        console.error("Error in AI brainstorm:", error);
        throw new Error("Failed to get a response from the AI.");
    }
};

export const generateSchedule = (prompt: string, imageFile?: File): Promise<Omit<Task, 'id' | 'status'>[]> => {
    return baseGenerateTasks(prompt, QUICK_PLAN_SYSTEM_INSTRUCTION, imageFile);
}

export const generateGoalPlan = (conversation: string, imageFile?: File): Promise<Omit<Task, 'id' | 'status'>[]> => {
    return baseGenerateTasks(conversation, GOAL_PLANNING_SYSTEM_INSTRUCTION, imageFile);
}

export const reflectOnTasks = async (tasks: Task[]): Promise<string> => {
    try {
        const completedTaskTitles = tasks.filter(t => t.status === 'completed').map(t => t.title).join(', ');
        if (!completedTaskTitles) return "No completed tasks to reflect on yet.";

        const systemInstruction = `You are a reflective assistant for ClearDay. Identify 2-3 recurring themes in these completed tasks. Use a neutral, observational tone.`;

        const response = await callApi({
            prompt: `Here are the completed tasks: ${completedTaskTitles}`,
            systemInstruction: systemInstruction,
            model: 'gemini-1.5-flash'
        });

        return response.text || "No reflection available.";
    } catch (error) {
        console.error("Error generating reflection:", error);
        throw new Error("Could not generate a reflection.");
    }
};
