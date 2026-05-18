import type { NextFunction, Request, Response } from "express";
import type { UserDocument } from "../types/firestore.types";
declare global {
    namespace Express {
        interface Request {
            user?: UserDocument;
        }
    }
}
export declare const verifyToken: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.middleware.d.ts.map