/**
 * @swagger
 * /api/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login เข้าสู่ระบบ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login สำเร็จ
 */

/**
 * @swagger
 * /api/stepqa:
 *   get:
 *     tags:
 *       - QA
     ...
 */
/**
 * @swagger
 * /api/inspection/{id}:
 *   get:
 *     tags:
 *       - Inspection
     ...
 */
/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Get all teams and their members
 *     parameters:
 *       - in: query
 *         name: branch
 *         schema:
 *           type: string
 *         required: false
 *         description: Branch to filter teams
 *     responses:
 *       200:
 *         description: List of teams and members
 */
