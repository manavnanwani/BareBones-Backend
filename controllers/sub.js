import subReddit from "../models/sub.js";

export const getAll = async (req, res) => {
  try {
    const subs = await subReddit.find().sort({ posts: -1 });
    res.status(200).json({ data: subs });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createSub = async (req, res) => {
  const sub = req.body;
  const newSub = new subReddit({
    ...sub,
    creator: req.userId,
    createdAt: new Date().toISOString(),
  });
  try {
    await newSub.save();
    res.status(201).json(newSub);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
