# Recipes Routes
See [complex.objects.md](../complex.objects.md) for structure of any non primitive variable type referenced.

## POST /recipes/create
Creates a new recipe.

**URL:** /recipes/create 
**Method:** POST  
**Auth required:** Yes  
**Content-Type:** application/json  

### Body
| Field    | Type       | Required | Constraints |
|----------|------------|----------|-------------|
| `recipe` | RecipeType | Yes      |             |

### Responses

**201 - Created**  
Recipe created successfully.
```json
{ 
   "message": "recipe created",
   "data": RecipeType 
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
- The `authId` from the access token is used as the recipe's `ownerId`.

<br>

## GET /recipes/get/:_id
Retrieves a single recipe by its MongoDB ID.

**URL:** /recipes/get/:_id  
**Method:** GET  
**Auth required:** No (optional — see Notes)  
**Content-Type:** N/A  

### URL Parameters
| Parameter | Type   | Required | Constraints        |
|-----------|--------|----------|--------------------|
| `_id`     | string | Yes      | Valid MongoDB ObjectId |

### Responses

**200 - OK**  
Recipe found and returned.
```json
{ 
   "message": "recipe found",
   "data": RecipeType 
}
```

**401 - Unauthorized**  
Recipe is private and no valid access token was provided.
```json
{ "error": string }
```

**404 - Not Found**  
No recipe with the given ID exists.
```json
{ "error": string }
```

**422 - Unprocessable Entity**  
URL parameter failed validation.
```json
{ "error": string }
```

### Notes
- Public recipes are returned without authentication.
- Private recipes are only returned if the requesting user is the owner (requires a valid `accessToken` cookie).

<br>

## GET /recipes/search
Searches recipes by various filters.

**URL:** /recipes/search  
**Method:** GET  
**Auth required:** No (optional — see Notes)  
**Content-Type:** N/A  

### Query Parameters
| Parameter          | Type       | Required | Constraints                          |
|--------------------|------------|----------|--------------------------------------|
| `title`            | string     | No       |                                      |
| `ownerIdList`      | string[]   | No       | List of MongoDB ObjectIds            |
| `ingredientIdList` | string[]   | No       | List of Postgres ingredient IDs      |
| `visibilityList`   | string[]   | No       | e.g. `["public", "private"]`         |
| `skip`             | number     | No       |                                      |
| `limit`            | number     | No       |                                      |

### Responses

**200 - OK**  
Returns a list of matching recipes.
```json
{ 
   "message": "recipe list found",
   "data": RecipeType[] 
}
```

**422 - Unprocessable Entity**  
Query parameters failed validation.
```json
{ "error": string }
```

### Notes
- Private recipes are only included in results if the requesting user is the owner (requires a valid `accessToken` cookie).
- Without an access token, only public recipes are returned regardless of `visibilityList`.

<br>

## PUT /recipes/update
Updates an existing recipe owned by the authenticated user.

**URL:** /recipes/update  
**Method:** PUT  
**Auth required:** Yes  
**Content-Type:** application/json  

### Body
| Field    | Type       | Required | Constraints |
|----------|------------|----------|-------------|
| `recipe` | RecipeType | Yes      | Must include `_id` |

### Responses

**200 - OK**  
Recipe updated successfully.
```json
{ 
   "message": "recipe updated",
   "data": RecipeType 
}
```

**401 - Unauthorized**  
Access token is missing or invalid.
```json
{ "error": string }
```

**403 - Forbidden**  
The authenticated user does not own the recipe.
```json
{ "error": string }
```

**404 - Not Found**  
No recipe with the given ID exists.
```json
{ "error": string }
```

**422 - Unprocessable Entity**  
Request body failed validation.
```json
{ "error": string }
```

### Notes
- Ownership is enforced server-side using the `authId` from the access token. A user cannot update another user's recipe.
- Only fields provided in the body are updated (partial update).
