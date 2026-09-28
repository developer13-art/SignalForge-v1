/**
 * Theme Repository
 *
 * Persistence layer for white-label themes.
 *
 * @module server/modules/white-label/themes/theme.repository
 */
const { db } = require('../../../database');
const { nowIso } = require('@signalforge/shared/utils/date.util');
async function findByProjectId({ projectId }) {
  const { rows } = await db.query(
    `SELECT * FROM white_label_themes WHERE project_id = $1 LIMIT 1`,
    [projectId],
  );
  return rows[0] || null;
}
async function insertTheme({
  projectId,
  mode,
  fontFamily,
  primaryColor,
  accentColor,
  customCss,
}) {
  const { rows } = await db.query(
    `INSERT INTO white_label_themes
       (project_id, mode, font_family, primary_color, accent_color, custom_css, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
     RETURNING *`,
    [projectId, mode, fontFamily, primaryColor, accentColor, customCss || null, nowIso()],
  );
  return rows[0];
}
async function updateTheme({ projectId, mode, fontFamily, primaryColor, accentColor, customCss }) {
  const { rowCount } = await db.query(
    `UPDATE white_label_themes
        SET mode = COALESCE($1, mode),
            font_family = COALESCE($2, font_family),
            primary_color = COALESCE($3, primary_color),
            accent_color = COALESCE($4, accent_color),
            custom_css = COALESCE($5, custom_css),
            updated_at = $6
      WHERE project_id = $7`,
    [mode || null, fontFamily || null, primaryColor || null, accentColor || null, customCss || null, nowIso(), projectId],
  );
  return rowCount > 0;
}
async function deleteTheme({ projectId }) {
  const { rowCount } = await db.query(
    `DELETE FROM white_label_themes WHERE project_id = $1`,
    [projectId],
  );
  return rowCount > 0;
}
const themeRepository = {
  findByProjectId,
  insertTheme,
  updateTheme,
  deleteTheme,
};
module.exports.themeRepository = themeRepository;

module.exports.findByProjectId = findByProjectId;

module.exports.insertTheme = insertTheme;

module.exports.updateTheme = updateTheme;

module.exports.deleteTheme = deleteTheme;
