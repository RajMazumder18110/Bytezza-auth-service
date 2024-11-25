/** @notice library imports */
import { Hono } from "hono";
/// Local imports
import { Logger } from "@/config";
import { AuthRoutes } from "@/constants/routes";
import { authenticate } from "@/middlewares/authenticate";
import { loginUserSchema, newUserSchema } from "@/validators/userValidator";
import { UserController } from "@/controllers/UserController";
import { validateSchema } from "@/middlewares/schemaValidateMiddleware";
import {
  UsersServices,
  CookieServices,
  CredentialService,
  AuthTokenServices,
} from "@/services";
import { validateRefreshToken } from "@/middlewares/validateRefreshToken";

/// Instances
const credService = new CredentialService();
const authTokenService = new AuthTokenServices();
const userService = new UsersServices(credService);
const cookieService = new CookieServices(credService);
const userController = new UserController(
  Logger,
  userService,
  cookieService,
  authTokenService,
  credService,
);

/// Users router
export const usersRouter = new Hono({ strict: false })

  /// Register a new user
  .post(AuthRoutes.REGISTER, validateSchema(newUserSchema), (c) =>
    userController.register(c),
  )

  /// Login a registered user
  .post(AuthRoutes.LOGIN, validateSchema(loginUserSchema), (c) =>
    userController.login(c),
  )

  /// Logout a authorized user.
  .post(AuthRoutes.LOGOUT, authenticate(cookieService), (c) =>
    userController.logout(c),
  )

  /// Refresh tokens
  .post(
    AuthRoutes.REFRESH,
    validateRefreshToken(Logger, cookieService, authTokenService, userService),
    (c) => userController.refresh(c),
  )

  /// Authorized user check
  .get(AuthRoutes.WHO_AM_I, authenticate(cookieService), (c) =>
    userController.whoami(c),
  );
