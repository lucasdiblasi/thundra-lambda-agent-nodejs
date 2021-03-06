import Utils from '../plugins/utils/Utils';
import {EnvVariableKeys} from '../Constants';
import {ApplicationInfoProvider} from './ApplicationInfoProvider';
import {ApplicationInfo} from './ApplicationInfo';
import {LambdaContextProvider} from './LambdaContextProvider';
import {LambdaUtils} from '../plugins/utils/LambdaUtils';

export class LambdaApplicationInfoProvider implements ApplicationInfoProvider {

    private applicationInfo: ApplicationInfo;

    constructor() {
        const logStreamName = Utils.getEnvVar(EnvVariableKeys.AWS_LAMBDA_LOG_STREAM_NAME);
        const region = Utils.getEnvVar(EnvVariableKeys.AWS_REGION);
        const functionVersion = Utils.getEnvVar(EnvVariableKeys.AWS_LAMBDA_FUNCTION_VERSION);
        this.applicationInfo = {
            applicationId: undefined,
            applicationInstanceId: logStreamName ? logStreamName.split(']').pop() : Utils.generateId(),
            applicationRegion: region ? region : '',
            applicationVersion: functionVersion ? functionVersion : '',
            applicationTags: Utils.getApplicationTags(),
        };
    }

    getApplicationInfo(): ApplicationInfo {
        const lambdaContext = LambdaContextProvider.getContext();
        if (!this.applicationInfo.applicationId && lambdaContext) {
            this.applicationInfo.applicationId = LambdaUtils.getApplicationId(lambdaContext);
        }
        return this.applicationInfo;
    }
}
