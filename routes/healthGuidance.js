const express = require('express');
const { Authentication } = require('../middlewares/auth');
const { healthGuidance } = require('../controller/healthGuidance');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Health Guidance
 *   description: Pregnancy savings and wallet tracking
 */

/**
 * @swagger
 * /api/v1/guide/weekly:
 *   get:
 *     tags:
 *       - Health Guidance
 *     summary: Get weekly health guidance
 *     description: Retrieves the authenticated mother's weekly wellness status, focus tip, trimester symptoms guide, and wellness/self-care guidance based on her current pregnancy week
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly health guidance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 wellnessStatus:
 *                   type: string
 *                   example: You and your baby are doing well. Continue following your personalized care plan.
 *                 focus:
 *                   type: string
 *                   example: Iron-Rich Nutrition & Hydration
 *                 healthStatus:
 *                   type: string
 *                   example: Healthy Progress
 *                 nutrition:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     ironRichFoods:
 *                       type: string
 *                       example: Spinach, beans, lean meat, groundnuts
 *                     proteinSources:
 *                       type: string
 *                       example: Eggs, fish, chicken, beans, milk
 *                     calciumRichFoods:
 *                       type: string
 *                       example: Milk, yogurt, cheese, leafy greens
 *                     wholeGrains:
 *                       type: string
 *                       example: Brown rice, oats, millet, whole wheat
 *                     hydrationReminder:
 *                       type: string
 *                       example: Drink 8-10 glasses of water daily to stay hydrated
 *                     foodsToAvoid:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Raw or undercooked meat and eggs", "Unpasteurized dairy products", "Excessive caffeine (limit to 200mg daily)", "Alcohol and tobacco products"]
 *                 trimesterGuide:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     trimester:
 *                       type: string
 *                       example: Second Trimester
 *                     symptoms:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Backaches", "Round ligament pain", "Increased appetite"]
 *                 wellness:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     week:
 *                       type: integer
 *                       example: 24
 *                     sleepRest:
 *                       type: string
 *                       example: Try sleeping on your side with a pillow between your knees
 *                     stressManagement:
 *                       type: string
 *                       example: Practice deep breathing exercises for 10 minutes daily
 *                 status:
 *                   type: string
 *                   example: You and your baby are doing well. Continue following your personalized care plan.
 *       400:
 *         description: Bad request - Mother does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: mother does not exist
 *       404:
 *         description: Mother not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mother not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

router.get('/weekly', Authentication, healthGuidance);


module.exports = router