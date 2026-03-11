import { verify, TokenExpiredError } from "jsonwebtoken";

export default (req: any, res: any, next: any) => {
    const token = req.headers.access_token as string;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Token missing. Please login."
        });
    }

    try {
        const decodedUser = verify(token, process.env.JWT_USER_AUTH!);
        req.user = decodedUser;
        return next();
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: "Token expired. Please login again."
            });
        }

        return res.status(401).json({
            success: false,
            message: "Invalid token. Please login again."
        });
    }
};