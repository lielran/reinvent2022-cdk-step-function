



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
        throw new Error('429 Too Many Requests')
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
