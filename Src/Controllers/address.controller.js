import addressModal from "../Modals/address.js";

export const createAddress = async (req, res) => {
  try {
    const create = new addressModal({ ...req.body });
    const address = await create.save();
    return res.status(201).json({
      message: "address created successfully",
      success: true,
      address,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const fetchAddress = async (req, res) => {
  try {
    const userId = req.query.userId;
    const filters = {
      deleted: false,
    };
    if (userId) filters.userId = userId;
    const addressList = await addressModal
      .find(filters)
      .sort({ isDefault: -1 });
    return res.status(200).json({
      message: "address fetched successfully",
      success: true,
      addressList,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { _id } = req.params;
    const findAddress = await addressModal.findOne({
      deleted: false,
      _id: _id,
    });
    if (!findAddress) {
      return res
        .status(404)
        .json({ message: "address not found", success: false });
    }

    const updatedData = await addressModal.updateOne(
      { _id: _id },
      { $set: { ...req.body } }
    );
    return res.status(202).json({
      success: true,
      message: "address updated successfully",
      updatedData,
    });
  } catch (error) {
    return res.status(500).json({ message: error, success: false });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const { _id } = req.params;
    const findAddress = await addressModal.findOne({
      deleted: false,
      _id: _id,
    });
    if (!findAddress) {
      return res
        .status(404)
        .json({ message: "address not found", success: false });
    }

    await addressModal.updateMany(
      {
        userId: req.body.userId,
        _id: { $ne: _id },
      },
      { $set: { isDefault: false } }
    );

    const updatedData = await addressModal.updateOne(
      { _id: _id, userId: req.body.userId },
      { $set: { isDefault: req.body.isDefault } }
    );
    return res.status(202).json({
      success: true,
      message: "address updated successfully",
      updatedData,
    });
  } catch (error) {
    return res.status(500).json({ message: error, success: false });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { _id } = req.params;
    const findAddress = await addressModal.findOne({
      deleted: false,
      _id: _id,
    });
    if (!findAddress) {
      return res
        .status(404)
        .json({ message: "address not found", success: false });
    }
    const deletedAddress = await addressModal.updateOne(
      { _id: _id },
      { $set: { deleted: true, deletedAt: Date.now() } }
    );
    return res.status(202).json({
      success: true,
      message: "address updated successfully",
      deletedAddress,
    });
  } catch (error) {
    return res.status(500).json({ message: error, success: false });
  }
};

export const fetchDefaultAddress = async (req, res) => {
  try {
    const filters = {
      userId: req.params.userId,
      isDefault: true,
      deleted: false,
    };
    const defaultAddress = await addressModal
      .findOne(filters)
      .select("-deleted -deletedAt");

    return res.status(200).json({
      message: "default address fetched",
      success: true,
      defaultAddress,
    });
  } catch (error) {
    return res.status(500).json({ message: error, success: false });
  }
};
