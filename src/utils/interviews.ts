import axios from "axios";
import { Interview } from "../interfaces/Interview";

export async function getInterviews(accessToken: string): Promise<Interview[]> {
    try {
        const response = await axios.get<Interview[]>(`http://localhost:3000/get_interviews`, {
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching interviews:", error);
        throw error; // Re-throw the error for the caller to handle
    }
}