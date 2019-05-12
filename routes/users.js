const express = require("express");
const router = express.Router();
const data = require("../data");
const userData = data.users;

router.get("/", async (req, res) => {
  try{
    const userCollection = await userData.getAllUsers();
    res.status(200).json(userCollection);
  }
  catch(e){
    res.status(400);
  }
});

router.get("/:id", async (req, res) => {
  try{
    const userCollection = await userData.getAllUsers();
    const user = userCollection.getById(req.params.id);
    res.status(200).json(user);
  }
  catch(e){
    res.status(400);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await userData.getById(req.params.id);
  } catch (e) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  try{
    await userData.removeUser(req.params.id);
  }
  catch(e){
    res.status(400);
  }
});
