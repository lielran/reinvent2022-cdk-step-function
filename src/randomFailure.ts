


function RetryAfterError(message, retryAfter){
    this.name = 'RetryAfterError';
    this.message = message;
    this.retryAfter = retryAfter;
}

function TooManyRequests429(message) {
    this.name = "TooManyRequests429";
    this.message = message;
}

TooManyRequests429.prototype = new Error();
RetryAfterError.prototype = new Error();
export const handler = async (event: any): Promise<any> => {

    console.log(Math.random() < 0.1); //10% probability of getting true
    console.log(Math.random() < 0.4); //40% probability of getting true
    console.log(Math.random() < 0.5); //50% probability of getting true
    console.log(Math.random() < 0.8); //80% probability of getting true
    console.log(Math.random() < 0.9); //90% probability of getting true


    const apiWorks = Math.random() < 0.4;
    if(apiWorks){
        return true
    }else{
        const randomRetryAfter  =Math.floor(Math.random() * 4000) + 1000; // from 1000-5000

        const error ={
            status: '429 Too Many Requests',
            error:'Too Many Requests',
            retryAfter: randomRetryAfter,
            retryAfterDate: new Date(Date.now() + randomRetryAfter).toISOString()
        }



        throw new TooManyRequests429(JSON.stringify(error));
    }

    // try {
    //     const { companyId } = getRecordsRunType.check(event);
    //     const repo = container.get<IRepository>(TYPES.IRepository);
    //     const result = await repo.getAllEntities(companyId);
    //     if (!result) {
    //         throw new Error('DeleteAdamInstallation return undefined');
    //     }
    //     logger.info(`deleting company:${companyId}, ${result.data.length} items to delete`);
    //     return result;
    // } catch (e) {
    //     logger.error(e);
    //     throw e;
    // }
};
