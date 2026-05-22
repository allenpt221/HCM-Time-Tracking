import type { Request, Response } from "express";
export declare function SignUp(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function SignIn(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function GetProfile(req: Request, res: Response): Promise<void>;
export declare function SignOut(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.controller.d.ts.map