import express from 'express';
import * as userController from '../controllers/user.controllers.js'; 
import userMiddleware from '../middleware/user.middleware.js';
const router = express.Router();

router.post('/signup', userController.createUser);

router.post('/login', userController.loginUser);

router.post('/logout', userController.logoutUser);

router.get(
    "/verify",
    userMiddleware,
    userController.verifyUser
);

router.get('/:id', userMiddleware, userController.getUserById);

router.put('/:id', userMiddleware, userController.updateUser);

router.delete('/:id', userMiddleware, userController.deleteUserById);

router.get('/', userMiddleware, userController.getAllUsers);

router.delete('/', userMiddleware, userController.deleteAllUsers);

export default router;