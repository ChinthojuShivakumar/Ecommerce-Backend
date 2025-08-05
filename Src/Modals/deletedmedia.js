import mongoose from "mongoose";


const deletedMediaSchema = new mongoose.Schema({
    publicIds: { type: String, required: true },
    deletedAt: {
        type: Date
    }
}, { timestamps: true })

const deletedMedia = mongoose.model("media", deletedMediaSchema)

export default deletedMedia