import "server-only";

import callApiServer from "@/shared/lib/api/callApi.server";
import { createImageService } from "./image.services";
import { createImageApi } from "./image.api";

export const imageService = createImageService(createImageApi(callApiServer))