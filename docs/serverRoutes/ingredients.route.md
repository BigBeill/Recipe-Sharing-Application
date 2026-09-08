# Ingredients Routes
See [complex.objects.md](../complex.objects.md) for structure of any non primitive variable type referenced.

## GET /ingredients/get/:_id
Retrieves a single ingredient by its Postgres ID.

**URL:** /ingredients/get/:_id  
**Method:** GET  
**Auth required:** No  
**Content-Type:** N/A  

### URL Parameters
| Parameter | Type   | Required | Constraints       |
|-----------|--------|----------|-------------------|
| `_id`     | number | Yes      | Valid Postgres ID  |

### Responses

**200 - OK**  
Ingredient found and returned.
```json
{ 
   "message": "Ingredient found" 
   "data": IngredientType
}
```

**404 - Not Found**  
No ingredient with the given ID exists.
```json
{ "error": string }
```

**422 - Unprocessable Entity**  
URL parameter failed validation.
```json
{ "error": string }
```

<br>

## GET /ingredients/search
Searches ingredients by description and/or food group.

**URL:** /ingredients/search  
**Method:** GET  
**Auth required:** No  
**Content-Type:** N/A

### Query Parameters
| Parameter       | Type   | Required | Constraints         |
|-----------------|--------|----------|---------------------|
| `description`   | string | No       |                     |
| `food_group_id` | number | No       | Valid Postgres ID   |
| `skip`          | number | No       | Defaults to `0`     |
| `limit`         | number | No       | Defaults to `32`    |

### Responses

**200 - OK**  
Returns a list of matching ingredients.
```json
{ 
   "message": "ingredient list found",
   "data": IngredientType[] }
```

**422 - Unprocessable Entity**  
Query parameters failed validation.
```json
{ "error": string }
```

### Notes
- `description` search is case-insensitive (`ILIKE`).
- If no parameters are provided all ingredients are returned (subject to pagination).

<br>

## GET /ingredients/searchConversion
Returns unit conversion records for a given ingredient (i.e. the available measures and their gram equivalents).

**URL:** /ingredients/searchConversion  
**Method:** GET  
**Auth required:** No  
**Content-Type:** N/A  

### Query Parameters
| Parameter | Type   | Required | Constraints       |
|-----------|--------|----------|-------------------|
| `food_id` | number | Yes      | Valid Postgres ID  |
| `skip`    | number | No       | Defaults to `0`   |
| `limit`   | number | No       | Defaults to `32`  |

### Responses

**200 - OK**  
Returns a list of conversion records for the ingredient.
```json
{ 
   "message": "conversion list found",
   "data": ConversionType[] }
```

**422 - Unprocessable Entity**  
Query parameters failed validation.
```json
{ "error": string }
```

<br>

## GET /ingredients/searchGroup
Returns all food groups.

**URL:** /ingredients/searchGroup  
**Method:** GET  
**Auth required:** No  
**Content-Type:** N/A  

### Query Parameters
None

### Responses

**200 - OK**  
Returns a list of all food groups.
```json
{ 
   "message": "food group list found",
   "data": FoodGroupType[]
}
```
