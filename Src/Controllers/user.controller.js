import userModal from "../Modals/users.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const hashPassword = async (plainPassword) => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(plainPassword, saltRounds);
  return hash;
};

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
    const hashedPassword = await hashPassword(req.body.password);
    const newUser = new userModal({
      ...req.body,
      password: hashedPassword,
      plainPassword: req.body.password,
    });
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
    const limit = parseInt(req.query.limit) || 10;
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
    console.log(req.body);
    const findUser = await userModal.findOne({
      _id: req.params._id,
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

export const changeUserStatus = async (req, res) => {
  try {
    const findUser = await userModal.findOne({
      _id: req.params._id,
      isDeleted: false,
      status: "Active",
    });
    if (!findUser) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }
    const updatedStatus = await userModal.updateOne(
      { _id: req.params._id },
      { $set: { status: req.body.status } }
    );
    return res.status(202).json({
      success: true,
      message: "User Account Deactivated",
      updatedStatus,
    });
  } catch (error) {
    console.log(error.message);

    return res.status(500).json({ error: error });
  }
};

export const loginUser = async (req, res) => {
  try {
    const findUser = await userModal.findOne({ email: req.body.email });
    if (!findUser) {
      return res
        .status(404)
        .json({ message: "Invalid credentials", success: false });
    }
    const payload = {
      _id: findUser._id,
      role: findUser.role,
      name: findUser.name,
      status: findUser.status,
    };
    const isPasswordMatched = await bcrypt.compare(
      req.body.password,
      findUser.password
    );
    if (!isPasswordMatched) {
      return res
        .status(404)
        .json({ message: "Invalid credentials", success: false });
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const { password, plainPassword, ...userWithOutPassword } = findUser._doc;
    return res.status(200).json({
      success: true,
      message: "user login successful",
      user: userWithOutPassword,
      token,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error });
  }
};
