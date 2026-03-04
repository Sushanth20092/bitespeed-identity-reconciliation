import { Request, Response } from "express";
import { identifyService } from "../services/identify.service";

export const identify = async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber } = req.body;

    // As per task: at least one must exist
    if (!email && !phoneNumber) {
      return res.status(400).json({
        message: "At least one of email or phoneNumber is required",
      });
    }

    const result = await identifyService(email ?? null, phoneNumber ?? null);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Identify Error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};