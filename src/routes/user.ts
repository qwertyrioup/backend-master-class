import express from "express";
import { createUser, deleteUser, getAllUsers, getUser, loginUser, updateUser } from "../controllers/user";
import { verifyTokenAndAuthorization, verifyTokenAndCreateAccount, veryfyToken } from "../lib/jwt";


const router = express.Router();



router.post('/login', loginUser);

router.post('/create', verifyTokenAndCreateAccount, createUser);

router.get('/:userIdOrEmail', getUser);

router.get('/', getAllUsers);



router.put('/:userIdOrEmail', verifyTokenAndAuthorization, updateUser);




router.delete('/:userIdOrEmail', veryfyToken, deleteUser);






export default router;