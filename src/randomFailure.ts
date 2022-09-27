function TooManyRequests429(message) {
    this.name = "TooManyRequests429";
    this.message = message;
}

function GeneralAPIError(message) {
    this.name = "GeneralAPIError";
    this.message = message;
}

TooManyRequests429.prototype = new Error();
GeneralAPIError.prototype = new Error();
export const handler = async (event: any): Promise<any> => {

    const apiWorks = Math.random() >= 0.3; //70% probability of getting and error
    if (apiWorks) {
        return true
    } else {
        const randomRetryAfter = Math.floor(Math.random() * 4000) + 1000; // from 1000-5000

        const error = {
            status: '429 Too Many Requests',
            error: 'Too Many Requests',
            retryAfter: randomRetryAfter,
            retryAfterDate: new Date(Date.now() + randomRetryAfter).toISOString()
        }
        const shouldRateLimit = Math.random() >= 0.3; //70% probability of rate limit

        if (shouldRateLimit) {
            throw new TooManyRequests429(JSON.stringify(error));
        } else {
            throw new GeneralAPIError("Random API Error(e.g. 500 Internal Server Error)");
        }


    }
};

