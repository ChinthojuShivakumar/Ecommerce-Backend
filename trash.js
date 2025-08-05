import cron from "node-cron";
import productModal from "./Src/Modals/products.js";
import categoryModal from "./Src/Modals/category.js";
import bookingModal from "./Src/Modals/bookings.js";
import deletedMedia from "./Src/Modals/DeletedMedia.js";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_KEY_SECRET,
  secure: process.env.SECURE === 'true',
});

// Run daily at 00:00
cron.schedule("0 0 * * *", async () => {
  console.info("🧹 Running daily cleanup tasks...");

  const threshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days

  // 🧹 1. Clean up old deleted products
  const deletedProducts = await productModal.find({
    deleted: true,
    deletedAt: { $lte: threshold },
  });

  const deletedProductImages = deletedProducts.flatMap(prod =>
    (prod.images || []).map(img => img.publicId)
  ).filter(Boolean);

  if (deletedProductImages.length) {
    await cloudinary.v2.api.delete_resources(deletedProductImages, {
      type: "upload",
      resource_type: "image",
    });

    await deletedMedia.insertMany(
      deletedProductImages.map(id => ({
        publicId: id,
        deletedAt: new Date(),
      }))
    );
  }

  // Optionally remove the product documents
  await productModal.deleteMany({
    _id: { $in: deletedProducts.map(p => p._id) },
  });

  // 🧹 2. Clean up old deleted categories
  const deletedCategories = await categoryModal.find({
    deleted: true,
    deletedAt: { $lte: threshold },
  });

  const deletedCategoryImages = deletedCategories
    .map(cat => cat.image?.publicId)
    .filter(Boolean);

  if (deletedCategoryImages.length) {
    await cloudinary.v2.api.delete_resources(deletedCategoryImages, {
      type: "upload",
      resource_type: "image",
    });

    await deletedMedia.insertMany(
      deletedCategoryImages.map(id => ({
        publicId: id,
        deletedAt: new Date(),
      }))
    );
  }

  await categoryModal.deleteMany({
    _id: { $in: deletedCategories.map(c => c._id) },
  });

  // 🔁 3. Update FAILED bookings → CANCELLED
  const failedBookings = await bookingModal.find({
    "products.status": "EXPIRED",
  });

  for (const booking of failedBookings) {
    let updated = false;

    booking.products = booking.products.map((item) => {
      if (item.status === "EXPIRED") {
        updated = true;
        return {
          ...item.toObject(),
          status: "CANCELLED",
          cancelledAt: new Date(),
        };
      }
      return item;
    });

    if (updated) {
      await booking.save();
      console.log(`✅ Booking ${booking._id} updated to CANCELLED`);
    }
  }

  console.log(`✅ Daily cleanup done. Products: ${deletedProducts.length}, Categories: ${deletedCategories.length}`);
});
