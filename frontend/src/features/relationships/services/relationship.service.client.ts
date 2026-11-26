import 'client-only';

import { createRelationshipApi } from './relationship.api';
import { createRelationshipService } from './relationship.service';
import callApiClient from '@/shared/lib/api/callApi.client';

export const relationshipService = createRelationshipService(createRelationshipApi(callApiClient));