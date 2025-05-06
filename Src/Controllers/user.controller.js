import userModal from "../Modals/users.js";

export const CreateUser = async (req, res) => {
  try {
    const findUser = await userModal.findOne({
      phoneNumber: req.body.phoneNumber,
    });
    if (findUser) {
      return res
        .status(400)
        .json({ message: "User Already exist..!", success: false });
    }
    const newUser = new userModal({ ...req.body });
    await newUser.save();
    return res
      .status(201)
      .json({ message: "User created successfully :)", success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const FetchUsers = async (req, res) => {
  try {
    const filters = {
      isDeleted: false,
      role: { $ne: "SUPER ADMIN" },
    };
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    if (req.query.status) filters.status = req.query.status;
    const totalUsers = await userModal.countDocuments(filters);
    const totalPages = Math.ceil(totalUsers / limit);

    const userList = await userModal.find(filters).skip(skip).limit(limit);
    return res.status(200).json({
      message: "User Fetched Successfully :)",
      success: true,
      userList: userList,
      page: page,
      limit: limit,
      totalPages: totalPages,
      totalUsers: totalUsers,
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

export const UpdateUser = async (req, res) => {
  try {
    const findUser = await userModal.findOne({
      phoneNumber: req.body.phoneNumber,
    });
    if (!findUser) {
      return res
        .status(400)
        .json({ message: "User does not exist..!", success: false });
    }
    const updatedUser = await userModal.updateOne(
      { _id: req.params._id }, // filter to find user
      { $set: req.body }
    );
    return res.status(202).json({
      message: "User Updated Successfully :)",
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

export const DeleteUser = async (req, res) => {
  try {
    const findUser = await userModal.findOne({
      _id: req.params._id,
      isDeleted: false,
      deletedAt: null,
    });
    if (!findUser) {
      return res
        .status(400)
        .json({ message: "User does not exist..!", success: false });
    }
    const deletedUser = await userModal.updateOne(
      { _id: req.params._id }, // filter to find user
      {
        $set: {
          isDeleted: true,
          deletedAt: Date.now(),
        },
      }
    );
    return res.status(202).json({
      message: "User Deleted Successfully :)",
      success: true,
      user: deletedUser,
    });
  } catch (error) {
    console.log(error.message);

    return res.status(500).json({ error: error });
  }
};
