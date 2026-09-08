import 'client-only';
import createApiCaller from './createApiCaller';
import clientAdapter from './adapters/clientAdapter';

export default createApiCaller(clientAdapter);