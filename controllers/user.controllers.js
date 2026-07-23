import * as userService from '../services/user.service.js';

export const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await userService.loginUser(email, password);

    if (!result) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

   res.cookie("token", result.token, {
  httpOnly: true,
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

res.status(200).json({
  message: "Login successful",
  token: result.token,
  user: result.user,
});
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const verifyUser = async (req, res) => {

    try {

        const user = await userService.getUserById(req.user.id);

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        const { password, ...userWithoutPassword } = user;

        res.status(200).json(userWithoutPassword);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

export const logoutUser = async (req, res) => {
  res.clearCookie("token");

  res.status(200).json({
    message: "Logout successful",
  });
};

export const getUserById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id); 
    const user = await userService.getUserById(userId);
    if (!user) {
    return res.status(404).json({
        message: "User not found"
    });
}
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to get user" });
  }
};  

export const updateUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const userData = req.body;
    const user = await userService.updateUser(userId, userData);
    if (!user) {
    return res.status(404).json({
        message: "User not found"
    });
}
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const deleteUserById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id); 
    const user = await userService.getUserById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
    await userService.deleteUserById(userId);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();  
    if (users.length === 0) {
      return res.status(404).json({
        message: "No users found",
      });
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to get all users" }); 
  }
};

export const deleteAllUsers = async (req, res) => {
  try {
    await userService.deleteAllUsers();
    res.status(200).json({ message: 'All users deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete all users" });
  }
};
