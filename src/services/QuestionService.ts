import { QuestionRepository, QuestionData } from '../repositories/QuestionRepository';
import { BadRequest, Conflict, NotFound } from '../security/AppError';

export class QuestionService {
  private static validateQuestionRules(data: QuestionData) {
    if (!data.statement || typeof data.points !== 'number' || data.points <= 0) {
      throw BadRequest('Énoncé et points valides requis');
    }

    // RG-04: Entre 2 et 6 choix
    if (!Array.isArray(data.choices) || data.choices.length < 2 || data.choices.length > 6) {
      throw BadRequest('Une question doit comporter entre 2 et 6 choix (RG-04)');
    }

    // Chaque choix doit avoir un texte non vide
    if (data.choices.some(c => !c.text || !c.text.trim())) {
      throw BadRequest('Chaque choix doit avoir un texte non vide');
    }

    // RG-04: Exactly one correct choice
    const correctCount = data.choices.filter(c => c.isCorrect === true).length;
    if (correctCount !== 1) {
      throw BadRequest('Exactement un choix doit être marqué comme correct (RG-04)');
    }
  }

  static async getQuestionsByExam(examId: number) {
    return await QuestionRepository.getQuestionsByExamId(examId);
  }

  static async createQuestion(examId: number, data: QuestionData) {
    // RG-08: Blocage si des tentatives existent
    const hasAttempts = await QuestionRepository.hasAttempts(examId);
    if (hasAttempts) {
      throw Conflict('Impossible d\'ajouter des questions : l\'examen possède déjà des tentatives (RG-08)');
    }

    this.validateQuestionRules(data);
    return await QuestionRepository.createQuestion(examId, data);
  }

  static async updateQuestion(questionId: number, data: QuestionData) {
    const examId = await QuestionRepository.getExamIdByQuestionId(questionId);
    if (!examId) {
      throw NotFound('Question non trouvée');
    }

    const hasAttempts = await QuestionRepository.hasAttempts(examId);
    if (hasAttempts) {
      throw Conflict('Impossible de modifier cette question : l\'examen possède déjà des tentatives (RG-08)');
    }

    this.validateQuestionRules(data);
    return await QuestionRepository.updateQuestion(questionId, data);
  }

  static async deleteQuestion(questionId: number) {
    const examId = await QuestionRepository.getExamIdByQuestionId(questionId);
    if (!examId) {
      throw NotFound('Question non trouvée');
    }

    const hasAttempts = await QuestionRepository.hasAttempts(examId);
    if (hasAttempts) {
      throw Conflict('Impossible de supprimer cette question : l\'examen possède déjà des tentatives (RG-08)');
    }

    await QuestionRepository.deleteQuestion(questionId);
  }
}