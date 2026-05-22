import type { NextFunction, Request, Response } from "express";
import type { UserDocument } from "../types/firestore.types";
declare global {
    namespace Express {
        interface Request {
            user?: UserDocument;
        }
    }
}
export declare function verifyToken(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function Admin(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.middleware.d.ts.map