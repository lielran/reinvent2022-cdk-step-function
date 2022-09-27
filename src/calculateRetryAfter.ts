export const handler = async (event: any): Promise<any> => {
    console.log(JSON.stringify(event));
    const randomRetryAfter  =Math.floor(Math.random() * 4000) + 1000; // from 1000-5000
    return {
         "retryAfterDate" :new Date(Date.now() + randomRetryAfter).toISOString()
    }

};
