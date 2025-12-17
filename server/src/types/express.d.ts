import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: "student" | "teacher" | "admin";
    };

    /**
     * Injected by permission middlewares
     * (canEditCourse / canEditSection / canEditLesson)
     */
    courseId?: string;
  }
}
