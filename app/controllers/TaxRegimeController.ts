import { HttpContext } from '@adonisjs/core/http';
import TaxRegimeService from '../services/TaxRegimeService.js';
import { inject } from '@adonisjs/core';

@inject()

export default class TaxRegimeController {
  constructor(private taxRegimeService: TaxRegimeService) {}
  /**
   * Get all active tax regimes
   */
  async index({ response }: HttpContext) {
    try {
      const regimes = await this.taxRegimeService.getAllActive();
      return response.status(200).json({
        success: true,
        data: regimes,
      });
    } catch (error) {
      console.error('Error fetching tax regimes:', error);
      return response.status(500).json({
        success: false,
        message: 'Failed to fetch tax regimes',
      });
    }
  }

  /**
   * Get a single tax regime by ID
   */
  async show({ params, response }: HttpContext) {
    try {
      const regime = await this.taxRegimeService.getById(Number(params.id));
      
      if (!regime) {
        return response.status(404).json({
          success: false,
          message: 'Tax regime not found',
        });
      }

      return response.status(200).json({
        success: true,
        data: regime,
      });
    } catch (error) {
      console.error('Error fetching tax regime:', error);
      return response.status(500).json({
        success: false,
        message: 'Failed to fetch tax regime',
      });
    }
  }
}
