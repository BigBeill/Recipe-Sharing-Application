import 'server-only';

import { createRelationshipApi } from './relationship.api';
import { createRelationshipService } from './relationship.service';
import callApiServer from '@/shared/lib/api/callApi.server';

export const relationshipService = createRelationshipService(createRelationshipApi(callApiServer));