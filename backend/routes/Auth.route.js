import express from "express";
import { login, manualLogin, getUser, getRepos, logout } from "../controllers/Auth.controller.js";

const AuthRoute = express.Router();

AuthRoute.post("/google-login", login);
AuthRoute.post("/github-login", login);
AuthRoute.post("/logout", logout);
AuthRoute.get("/get-user", getUser); 
AuthRoute.get("/repos", getRepos); 

export default AuthRoute;
