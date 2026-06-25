import axiosInstantce from "./axiosInstance";


export const rideApi = {

    createRoom: async (rideData)=>{
        try{
            const response = await axiosInstantce.post('/ride/create', rideData)
            return response.data;
        } catch(error){
            throw new Error(
                error.response?.data?.message ||
                "Ride creation failed. Please try again."
            );
        }

    },

    getActiveRides: async ()=>{
        try{
            const response = await axiosInstantce.get('/ride/active');
            return response.data;
        } catch(error){
            throw new Error(
                error.response?.data?.message ||
                "Failed to fetch active rides."
            );
        }
    }
}