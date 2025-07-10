import { UserContext } from '../App';
import { useContext, useEffect, useState } from 'react';
import { Interview } from '../interfaces/Interview';
import axios from 'axios';

export const ResultsDashboard = () => {
    const userContext = useContext(UserContext);
    const [interviews, setInterviews] = useState<Interview[]>([]);

    const user = userContext?.user;

    useEffect(() => {
        if (!user) return;
        axios.get('http://localhost:3000/get_interviews', {
            headers: {
                Authorization: `Bearer ${user.accessToken}`
            },
            withCredentials: true
        })
        .then(response => {
            setInterviews(response.data);
            console.log(response.data);
        })
        .catch(error => {
            console.error('Error fetching interviews:', error);
        });
    }, [user]);

        if (!userContext || !userContext.user) {
        return <div>Please log in to view the results dashboard.</div>;
    }
    return (
        <div className='flex flex-col items-center justify-center min-h-screen p-4 overflow-y-auto'>
            {
                interviews.length > 0 ? (
                    <div className='w-full max-w-3xl border-white border-2 shadow-md rounded-lg p-6'>
                        <h1 className='text-2xl font-bold mb-4'>Your Interviews</h1>
                        <ul className='space-y-4'>
                            {interviews.map((interview, index) => (
                                <li key={interview._id}>{interview._id}</li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className='w-full max-w-3xl bg-white shadow-md rounded-lg p-6'>
                        <h1 className='text-2xl font-bold mb-4'>No Interview Results Found</h1>
                        <p className='text-gray-700'>You have not completed any interviews yet.</p>
                    </div>
                )
            }
        </div>
    );
}
