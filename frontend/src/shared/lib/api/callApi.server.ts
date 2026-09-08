import 'server-only';
import createApiCaller from './createApiCaller';
import serverAdapter from './adapters/serverAdapter';

export default createApiCaller(serverAdapter);