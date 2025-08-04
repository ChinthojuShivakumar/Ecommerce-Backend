import cron from "node-cron";
import fs from "fs";
import path from "path";
import productModal from "./Src/Modals/products.js";
import categoryModal from "./Src/Modals/category.js";
import bookingModal from "./Src/Modals/bookings.js";

// Run daily at 00:00
cron.schedule("0 0 * * *", async () => {
  console.info("🧹 Running daily cleanup tasks...");

  const threshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days

  // 🗑️ Clean up deleted product images
  const deletedProducts = await productModal.find({
    deleted: true,
    deletedAt: { $lte: threshold },
  });

  for (const product of deletedProducts) {
    if (product.images && product.images.length > 0) {
      product.images.forEach((image) => {
        const fileName = image.split("/products/")[1];
        const filePath = path.join("public/products", fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Deleted product image: ${filePath}`);
        }
      });
    }
  }

  // 🗑️ Clean up deleted category images
  const deletedCategories = await categoryModal.find({
    deleted: true,
    deletedAt: { $lte: threshold },
  });

  for (const category of deletedCategories) {
    if (category.image) {
      const fileName = category.image.split("/categories/")[1];
      const filePath = path.join("public/categories", fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted category image: ${filePath}`);
      }
    }

    // Optionally delete the category document
    await categoryModal.deleteOne({ _id: category._id });
  }

  // 🔁 Update FAILED bookings to EXPIRED
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
      console.log(`✅ Booking ${booking._id} updated from FAILED to EXPIRED`);
    }
  }

  console.log(
    `✅ Daily cleanup complete. Removed files for ${deletedProducts.length} products & ${deletedCategories.length} categories.`
  );
});
