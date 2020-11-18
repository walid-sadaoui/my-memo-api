import express from "express";

const router = express.Router();

/* GET users listing. */
router.get("/", (req, res) => {
  try {
    const { user } = req.session;
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User is not logged in",
      });
    }

    const { _id, username, email, createdAt, updatedAt } = user;
    return res.status(200).send({
      code: 200,
      message: "Authenticated user found !",
      user: {
        id: _id,
        username,
        email,
        createdAt,
        updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: "There was a problem retrieving the authenticated user",
      error,
    });
  }
});

export default router;
