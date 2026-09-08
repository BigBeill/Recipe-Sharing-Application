# Users Routes
See [complex.objects.md](../complex.objects.md) for structure of any non primitive variable type referenced.

## GET /users/defineRelationship/:_id
Returns the relationship record between the authenticated user and the target user.

**URL:** /users/defineRelationship/:_id  
**Method:** GET  
**Auth required:** Yes  
**Content-Type:** N/A  

### URL Parameters
| Parameter | Type   | Required | Constraints            |
|-----------|--------|----------|------------------------|
| `_id`     | string | Yes      | Valid MongoDB ObjectId |

### Responses

**200 - OK**  
Relationship resolved and returned.
```json
{
  "message": "relationship defined",
  "data": RelationshipType
}
```

Where `RelationshipType` is:
```ts
{
  _id: string;
  ownerId: string;
  targetId: string;
  type: "none" | "friend" | "requestReceived" | "requestSent" | "self";
}
```

**401 - Unauthorized**  
Access token is missing or invalid.
```json
{ "error": string }
```

**422 - Unprocessable Entity**  
URL parameter failed validation.
```json
{ "error": string }
```

### Notes
- A `type` of `"self"` is returned when `_id` matches the authenticated user's own ID.
- A `type` of `"none"` indicates no friendship or pending request exists.

<br>

## POST /users/deleteFriendship/:_id
Removes a friendship between the authenticated user and the target user.

**URL:** /users/deleteFriendship/:_id  
**Method:** POST  
**Auth required:** Yes  
**Content-Type:** N/A  

### URL Parameters
| Parameter | Type   | Required | Constraints            |
|-----------|--------|----------|------------------------|
| `_id`     | string | Yes      | Valid MongoDB ObjectId |

### Responses

**200 - OK**  
Friendship removed successfully.
```json
{ 
  "message": "Friendship removed"
}
```

**401 - Unauthorized**  
Access token is missing or invalid.
```json
{ "error": string }
```

**404 - Not Found**  
No friendship exists between the two users.
```json
{ "error": string }
```

**422 - Unprocessable Entity**  
URL parameter failed validation.
```json
{ "error": string }
```

<br>

## GET /users/get/:_id
Retrieves a single user by their MongoDB ID.

**URL:** /users/get/:_id  
**Method:** GET  
**Auth required:** No (optional — see Notes)  
**Content-Type:** N/A  

### URL Parameters
| Parameter | Type   | Required | Constraints            |
|-----------|--------|----------|------------------------|
| `_id`     | string | Yes      | Valid MongoDB ObjectId |

### Query Parameters
| Parameter             | Type    | Required | Constraints        |
|-----------------------|---------|----------|--------------------|
| `includeRelationship` | boolean | No       | Defaults to `false` |

### Responses

**200 - OK**  
User found and returned.
```json
{ 
  "message": "user found",
  "data": UserType 
}
```

**404 - Not Found**  
No user with the given ID exists.
```json
{ "error": string }
```

**422 - Unprocessable Entity**  
URL parameter or query failed validation.
```json
{ "error": string }
```

### Notes
- `includeRelationship` requires a valid `accessToken` cookie to resolve. If provided without one, the field is ignored.

<br>

## POST /users/processFriendRequest/:_id/:response
Accepts or declines a pending friend request from the target user.

**URL:** /users/processFriendRequest/:_id/:response  
**Method:** POST  
**Auth required:** Yes  
**Content-Type:** N/A  

### URL Parameters
| Parameter  | Type   | Required | Constraints                   |
|------------|--------|----------|-------------------------------|
| `_id`      | string | Yes      | Valid MongoDB ObjectId        |
| `response` | string | Yes      | Must be `accept` or `decline` |

### Responses

**200 - OK**  
Friend request processed successfully.
```json
{ 
  "message": string,
}
```

**401 - Unauthorized**  
Access token is missing or invalid.
```json
{ "error": string }
```

**404 - Not Found**  
No pending friend request from the target user exists.
```json
{ "error": string }
```

**422 - Unprocessable Entity**  
URL parameters failed validation.
```json
{ "error": string }
```

<br>

## GET /users/search
Searches users by ID or name.

**URL:** /users/search  
**Method:** GET  
**Auth required:** No (optional — see Notes)  
**Content-Type:** N/A  

### Query Parameters
| Parameter             | Type     | Required | Constraints            |
|-----------------------|----------|----------|------------------------|
| `_id`                 | string   | No       | Valid MongoDB ObjectId |
| `name`                | string   | No       |                        |
| `skip`                | number   | No       | Defaults to `0`        |
| `limit`               | number   | No       | Defaults to `32`       |
| `includeRelationship` | boolean  | No       |                        |

### Responses

**200 - OK**  
Returns a list of matching users.
```json
{ 
  "message": "user list found",
  "data": UserType[] }
```

If `includeRelationship` is `true`, each entry also includes a resolved `RelationshipType`.

**422 - Unprocessable Entity**  
Query parameters failed validation.
```json
{ "error": string }
```

### Notes
- `includeRelationship` requires a valid `accessToken` cookie to resolve. If provided without one, the field is ignored.

<br>

## GET /users/searchFolders
Returns the authenticated user's recipe folders.

**URL:** /users/searchFolders  
**Method:** GET  
**Auth required:** Yes  
**Content-Type:** N/A  

### Query Parameters
| Parameter  | Type   | Required | Constraints            |
|------------|--------|----------|------------------------|
| `parentId` | string | No       | Valid MongoDB ObjectId |
| `skip`     | number | No       | Defaults to `0`        |
| `limit`    | number | No       | Defaults to `32`       |

### Responses

**200 - OK**  
Returns a list of folders.
```json
{ 
  "message": "Folder list found",
  "data": FolderType[] 
}
```

**401 - Unauthorized**  
Access token is missing or invalid.
```json
{ "error": string }
```

**422 - Unprocessable Entity**  
Query parameters failed validation.
```json
{ "error": string }
```

### Notes
- If `parentId` is omitted, top-level folders are returned.
- If `parentId` is provided, child folders of that folder are returned.

<br>

## POST /users/sendFriendRequest/:_id
Sends a friend request to the target user.

**URL:** /users/sendFriendRequest/:_id  
**Method:** POST  
**Auth required:** Yes  
**Content-Type:** N/A  

### URL Parameters
| Parameter | Type   | Required | Constraints            |
|-----------|--------|----------|------------------------|
| `_id`     | string | Yes      | Valid MongoDB ObjectId |

### Responses

**200 - OK**  
Friend request sent successfully.
```json
{ 
  "message": "Friend request sent",
  "data": RelationshipType 
}
```

**401 - Unauthorized**  
Access token is missing or invalid.
```json
{ "error": string }
```

**409 - Conflict**  
A friendship or pending request already exists between the two users.
```json
{ "error": string }
```

**422 - Unprocessable Entity**  
URL parameter failed validation.
```json
{ "error": string }
```

### Notes
- Returns the newly created `RelationshipType` record on success.

<br>

## PUT /users/update
Updates the authenticated user's account details.

**URL:** /users/update  
**Method:** PUT  
**Auth required:** Yes  
**Content-Type:** application/json  

### Body
| Field   | Type      | Required | Constraints                            |
|---------|-----------|----------|----------------------------------------|
| `name`  | string    | No       |                                        |
| `email` | string    | No       |                                        |
| `bio`   | string    | No       |                                        |
| `image` | imageType | No       | Provided by the /image/upload endpoint |

### Responses

**200 - OK**  
Account updated successfully.
```json
{ 
  "message": "Account updated",
  "data": UserType 
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
- All fields are optional. Only provided fields are updated.
- The `image` field should be a URL returned from `POST /image/upload`.
