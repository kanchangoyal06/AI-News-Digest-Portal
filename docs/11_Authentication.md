# Authentication & Authorization

The application uses JSON Web Tokens (JWT) for stateless authentication.

## Login Flow
1. User enters credentials on `Login.jsx`.
2. Frontend sends a `POST` request to `/api/auth/login`.
3. Backend controller (`authController.js`) searches for the user by email in MongoDB.
4. Backend uses the `matchPassword` method (which uses `bcryptjs`) to verify the hashed password.
5. If successful, the backend generates a signed JWT using `JWT_SECRET` (valid for 30 days) and returns it alongside the user profile.
6. The frontend receives the response. Zustand (`useAuthStore`) saves the profile and token into the browser's `localStorage`.
7. React Router automatically detects the token in Zustand state and redirects the user from the `/login` route to the protected `/dashboard` route.

## Logout Flow
1. User clicks Logout in the sidebar.
2. Zustand `logout()` action is fired.
3. The token is deleted from `localStorage` and memory.
4. React Router detects the missing token and instantly redirects to `/login`.
5. No backend call is required because JWTs are stateless.

## Route Protection (Authorization Middleware)
**`authMiddleware.js`** contains two crucial functions to protect API endpoints from unauthorized access:

- **`protect`**: Intercepts requests, extracts the `Authorization: Bearer <token>` header, and uses `jwt.verify` to decode it. It then queries the database for the embedded user ID, strips the password from the object, and attaches the user to the `req` object (`req.user = await User.findById(decoded.id).select('-password')`).
- **`admin`**: Checks if `req.user.isAdmin === true`.

If a protected route (like generating a digest) is accessed without a valid token, the server strictly returns `401 Unauthorized` and aborts the request.
