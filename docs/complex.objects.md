# Complex JSON Objects

Any non primitive variable type being managed by the frontend or backend should be structured as one of the objects that follows.

**Note:** Some recently created JSON objects may not contain an _id field as the object has not yet been saved inside the database and been assigned one.

## Common Objects
Common objects you will see throughout the project
### FriendFolder
```js
interface FriendFolderType {
   _id: string;
   title: string;
   content: UserType[];
}
```
### Image
```js
interface ImageType {
   filename: string;
   url: string;
   size: number;
   mimetype: string;
}
```
### Ingredient
```js
interface IngredientType {      // equivalent to "food" inside the canadian_nutrient_file database
   _id: number;
   description: string;
   label?: string;
   commonName?: string;
   portion?: {      // equivalent to "measure" inside the canadian_nutrient_file database
      _id: number;
      description: string;
      amount: number;
   }
}
```
### Ingredient Conversion
```js
interface IngredientConversionType {      // equivalent to "conversion_factor" inside the canadian_nutrient_file database
   food_id: number
   measure_id: number,
   measure_description: string,
   value: number
}
```
### Ingredient Group
```js
interface IngredientGroupType {      // equivalent to "food_group" inside the canadian_nutrient_file database
   _id: string;
   name: string;
}
```
### Nutrition
```js
interface NutritionType {
   calories: number;
   fat: number;
   cholesterol: number;
   sodium: number;
   potassium: number;
   carbohydrates: number;
   fibre: number;
   sugar: number;
   protein: number;
}
```
### Paginated List
```js
type PaginatedListType<T> = {
   list: T[];
   count: number;
   firstItemIndex?: number;
};
```
### Recipe
```js
interface RecipeType {
   _id: string;
   ownerId: string;
   title: string;
   description: string;
   image?: ImageType;
   ingredientList: IngredientType[];
   instructionList: string[];
   nutrition: NutritionType
   visibility: 'public' | 'private' | 'personal';
}
```
### Relationship
```js
interface RelationshipType {
   _id: string;
   ownerId: string;
   targetId: string;
   type: "none" | "friend" | "requestReceived" | "requestSent" | "self";
}
```
### User
```js
interface UserType {
   _id: string;
   name: string;
   email?: string;
   bio?: string;
   image?: ImageType;
   relationship?: RelationshipType;
}
```

## Server Only Objects
Objects that you should only see in the server and should never be sent directly to the client
### Auth Results
```js
interface AuthResultType {
   user: UserRecord
   tokens: AuthTokens;
}
```
### Auth Tokens
```js
interface AuthTokensType {
   accessToken: string;
   refreshToken: string;
}
```
### JWT Payload
```js
interface JwtPayloadType {
   authId: string;
   issued?: number;
   expires?: number;
}
```
### Tracked Image
```js
interface TrackedImageType extends ImageType {
   id: string;
   ownerId: string;
   status: 'pending' | 'active';
   uploadedAt: Date;
}
```