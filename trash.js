import cron from "node-cron";
import productModal from "./Src/Modals/products.js";
import fs from "fs";
import path from "path";
import { trusted } from "mongoose";
import categoryModal from "./Src/Modals/category.js";

cron.schedule("0 0 * * *", async () => {
  console.info("🧹 Running daily product image cleanup...");

  const threshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

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
        }
      });
    }
  }
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
  console.log(
    `✅ Cleanup complete. Removed files for ${deletedProducts.length} products & ${deletedCategories.length} categories..`
  );
});
