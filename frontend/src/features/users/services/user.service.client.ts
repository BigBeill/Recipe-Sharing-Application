import 'client-only';

import { createUserApi } from './user.api';
import { createUserService } from './user.service';
import callApiClient from '@/shared/lib/api/callApi.client';

export const userService = createUserService(createUserApi(callApiClient));