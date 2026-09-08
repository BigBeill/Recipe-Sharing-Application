# Auth Routes
See [complex.objects.md](../complex.objects.md) for structure of any non primitive variable type referenced.

## POST /auth/changePassword
Changes the authenticated user's password.

**URL:** /auth/changePassword  
**Method:** POST  
**Auth required:** Yes  
**Content-Type:** application/json  

### Body
| Field         | Type   | Required | Constraints      |
|---------------|--------|----------|------------------|
| `oldPassword` | string | Yes      |                  |
| `newPassword` | string | Yes      | Min 8 characters |

### Responses

**200 - OK**  
Password changed successfully.
```json
{ "message": "password reset" }
```

**401 - Unauthorized**  
Access token is missing or invalid, or `oldPassword` is incorrect.
```json
{ "error": string }
```

**422 - Unprocessable Entity**  
Request body failed validation.
```json
{ "error": string }
```

### Notes
- The new password is hashed with bcrypt before storage. The plain-text password is never saved.

<br>

## POST /auth/login
Logs in an existing user.

**URL:** /auth/login  
**Method:** POST  
**Auth required:** No  
**Content-Type:** application/json  

### Body
| Field        | Type    | Required | Constraints      |
|--------------|---------|----------|------------------|
| `name`       | string  | Yes      |                  |
| `password`   | string  | Yes      |                  |
| `rememberMe` | boolean | No       | Defaults to false |

### Responses

**200 - OK**  
Login successful.
```json
{ 
   "message": "User logged in",
   "data": UserType
}
```
| Cookie         | Set Value    | HttpOnly | Expires    |
|----------------|--------------|----------|------------|
| `accessToken`  | JWT (string) | Yes      | 15 minutes |
| `refreshToken` | JWT (string) | Yes      | 7 days     |

**401 - Unauthorized**  
Invalid name or password.
```json
{ "error": string }
```

**422 - Unprocessable Entity**  
Request body failed validation.
```json
{ "error": string }
```

<br>

## POST /auth/logout
Logs out the current user by invalidating their tokens.

**URL:** /auth/logout  
**Method:** POST  
**Auth required:** Yes  
**Content-Type:** application/json  

### Body
None

### Cookies Required
| Cookie         | Description                       |
|----------------|-----------------------------------|
| `accessToken`  | A valid, unexpired access token   |
| `refreshToken` | A valid, unexpired refresh token  |

### Responses

**201 - Created**  
Logout successful.
```json
{ 
   "message": "logout successful"
}
```
| Cookie         | Action  |
|----------------|---------|
| `accessToken`  | Removed |
| `refreshToken` | Removed |

**401 - Unauthorized**  
Access token is missing or invalid.
```json
{ "error": string }
```

### Notes
- The refresh token is invalidated in the database on logout.
- Both cookies are cleared from the client.

<br>

## POST /auth/refresh
Issues a new access token using a valid refresh token.

**URL:** /auth/refresh  
**Method:** POST  
**Auth required:** No (requires valid `refreshToken` cookie)  
**Content-Type:** application/json  

### Body
None

### Cookies Required
| Cookie         | Description                        |
|----------------|------------------------------------|
| `refreshToken` | A valid, unexpired refresh token   |

### Responses

**200 - OK**  
Access token refreshed successfully.
```json
{ 
   "message": "refresh successful"
}
```
| Cookie        | Set Value    | HttpOnly | Expires    |
|---------------|--------------|----------|------------|
| `accessToken` | JWT (string) | Yes      | 15 minutes |

**401 - Unauthorized**  
Refresh token is missing, invalid, or expired.
```json
{ "error": string }
```

### Notes
- Only the `accessToken` is rotated. The `refreshToken` is not replaced.
- If the refresh token is expired the user must log in again.

<br>

## POST /auth/register
Registers a new user account.

**URL:** /auth/register  
**Method:** POST  
**Auth required:** No  
**Content-Type:** application/json  

### Body
| Field      | Type   | Required | Constraints          |
|------------|--------|----------|----------------------|
| `name`     | string | Yes      | 3–20 characters      |
| `email`    | string | Yes      | Must be valid email  |
| `password` | string | Yes      | Min 8 characters     |

### Responses

**201 - Created**  
User was registered successfully.
```json
{
  "message": string,
  "data": UserType
}
```
| Cookie         | Set Value    | HttpOnly | Expires    |
|----------------|--------------|----------|------------|
| `accessToken`  | JWT (string) | Yes      | 15 minutes |
| `refreshToken` | JWT (string) | Yes      | 7 days     |

**409 - Conflict**  
Email or name is already in use.
```json
{ "error": string }
```

**422 - Unprocessable Entity**  
Request body failed validation.
```json
{ "error": string }
```

### Notes
- Passwords are hashed with bcrypt before storage. The plain-text password is never saved.
- After registering the user is automatically logged in via the cookies set above.

<br>

## POST /auth/requestPasswordReset
Asks the server to send a password reset link to the provided email.

**URL:** /auth/requestPasswordReset  
**Method:** POST  
**Auth required:** No  
**Content-Type:** application/json  

### Body
| Field   | Type   | Required | Constraints         |
|---------|--------|----------|---------------------|
| `email` | string | Yes      | Must be valid email |

### Responses

**201 - Created**  
Server checked the database for a user with the provided email and sent a password reset link if the account exists.
```json
{ 
   "message": "Password reset link sent if account exists" 
}
```

**422 - Unprocessable Entity**  
Request body failed validation.
```json
{ "error": string }
```

### Notes
- Not found errors (404) are swallowed and returned as 201 to prevent enumeration attacks.
- A hashed reset token is saved to the database against the account if the email exists.

<br>

## POST /auth/resetPassword
Resets a user's password using a valid password reset token.

**URL:** /auth/resetPassword  
**Method:** POST  
**Auth required:** No  
**Content-Type:** application/json  

### Body
| Field      | Type   | Required | Constraints      |
|------------|--------|----------|------------------|
| `password` | string | Yes      | Min 8 characters |
| `token`    | string | Yes      |                  |

### Responses

**200 - OK**  
Password reset successfully.
```json
{ "message": "password reset" }
```

**401 - Unauthorized**  
Token is invalid or expired.
```json
{ "error": string }
```

**422 - Unprocessable Entity**  
Request body failed validation.
```json
{ "error": string }
```

### Notes
- The token is sourced from the link sent by `POST /auth/requestPasswordReset`.
- The new password is hashed with bcrypt before storage. The plain-text password is never saved.
- The reset token is invalidated after use.