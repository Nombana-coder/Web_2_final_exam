import { Request, Response, NextFunction } from "express";
import { QuestionService } from "../services/QuestionService";

export class QuestionController {
  static async getByExam(req: Request, res: Response, next: NextFunction) {
    try {
      const examId = Number(req.params.id);
      const questions = await QuestionService.getQuestionsByExam(examId);
      res.json(questions);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const examId = Number(req.params.id);
      const question = await QuestionService.createQuestion(examId, req.body);
      res.status(201).json(question);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const questionId = Number(req.params.id);
      const question = await QuestionService.updateQuestion(questionId, req.body);
      res.json(question);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const questionId = Number(req.params.id);
      await QuestionService.deleteQuestion(questionId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}