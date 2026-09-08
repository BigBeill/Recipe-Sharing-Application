# Images Routes
See [complex.objects.md](../complex.objects.md) for structure of any non primitive variable type referenced.

## GET /image/:context/:fileName
Retrieves an image file by context and filename.

**URL:** /image/:context/:fileName  
**Method:** GET  
**Auth required:** No  
**Content-Type:** N/A 

### URL Parameters
| Parameter   | Type   | Required | Constraints                    |
|-------------|--------|----------|--------------------------------|
| `context`   | string | Yes      | Must be `recipes` or `avatars` |
| `fileName`  | string | Yes      |                                |

### Responses

**200 - OK**  
Image returned successfully.  
Returns the raw image binary with the following headers:

| Header                    | Value        |
|---------------------------|--------------|
| `Content-Type`            | `image/webp` |
| `X-Content-Type-Options`  | `nosniff`    |

**400 - Bad Request**  
URL parameters failed validation.
```json
{ "error": string }
```

**404 - Not Found**  
No image exists at the given context and filename.
```json
{ "error": string }
```

<br>

## POST /image/upload
Uploads an image and returns a URL that can be stored on another resource (e.g. a recipe or user account).

**URL:** /image/upload  
**Method:** POST  
**Auth required:** Yes  
**Content-Type:** multipart/form-data  

### Body
| Field   | Type | Required | Constraints      |
|---------|------|----------|------------------|
| `image` | File | Yes      | Must be an image |

### Responses

**200 - OK**  
Upload successful. Returns the URL to be stored on the target resource.
```json
{
   "message": "image uploaded",
   "data": string 
}
```

**401 - Unauthorized**  
Access token is missing or invalid.
```json
{ "error": string }
```

**422 - Unprocessable Entity**  
Request body failed validation.
```json
{ "error": string }
```

### Notes
- Images are stored as `.webp` internally regardless of the upload format.
- The returned URL should be saved to the intended resource (recipe, user profile, etc.) in a subsequent request. It is not automatically associated with any resource.
- Uploaded images that are never attached to a resource are cleaned up by a TTL background job.
