import 'server-only';

import { createUserApi } from './user.api';
import { createUserService } from './user.service';
import callApiServer from '@/shared/lib/api/callApi.server';

export const userService = createUserService(createUserApi(callApiServer));