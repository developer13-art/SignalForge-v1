/**
 * Profile Repository
 *
 * @module signalforge/server/modules/users/profile/repository
 */
const { getDatabase } = require('../../../bootstrap/initDatabase.js');
class ProfileRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async findByUserId(userId) {
    const result = await this.db.query(
      `SELECT user_id AS id, user_id, date_of_birth, nationality, country, city,
              address_line1, address_line2, postal_code, timezone, language,
              trading_experience, referred_by_user_id, metadata, created_at,
              updated_at
         FROM user_profiles
        WHERE user_id = $1
        LIMIT 1`,
      [userId],
    );
    return result.rows[0] || null;
  }

  async upsert(userId, data) {
    const addressLine1 = data.addressLine1 ?? data.address ?? null;
    const addressLine2 = data.addressLine2 ?? null;
    const metadata = data.metadata ?? null;

    const result = await this.db.query(
      `INSERT INTO user_profiles (
         user_id, date_of_birth, nationality, country, city,
         address_line1, address_line2, postal_code, timezone, language,
         trading_experience, referred_by_user_id, metadata, created_at,
         updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         date_of_birth = COALESCE(EXCLUDED.date_of_birth, user_profiles.date_of_birth),
         nationality = COALESCE(EXCLUDED.nationality, user_profiles.nationality),
         country = COALESCE(EXCLUDED.country, user_profiles.country),
         city = COALESCE(EXCLUDED.city, user_profiles.city),
         address_line1 = COALESCE(EXCLUDED.address_line1, user_profiles.address_line1),
         address_line2 = COALESCE(EXCLUDED.address_line2, user_profiles.address_line2),
         postal_code = COALESCE(EXCLUDED.postal_code, user_profiles.postal_code),
         timezone = COALESCE(EXCLUDED.timezone, user_profiles.timezone),
         language = COALESCE(EXCLUDED.language, user_profiles.language),
         trading_experience = COALESCE(EXCLUDED.trading_experience, user_profiles.trading_experience),
         referred_by_user_id = COALESCE(EXCLUDED.referred_by_user_id, user_profiles.referred_by_user_id),
         metadata = COALESCE(EXCLUDED.metadata, user_profiles.metadata),
         updated_at = NOW()
      RETURNING user_id AS id, user_id, date_of_birth, nationality, country, city,
                 address_line1, address_line2, postal_code, timezone,
                 language, trading_experience, referred_by_user_id,
                 metadata, created_at, updated_at`,
      [
        userId,
        data.dateOfBirth || null,
        data.nationality || null,
        data.country || null,
        data.city || null,
        addressLine1,
        addressLine2,
        data.postalCode || null,
        data.timezone || null,
        data.language || null,
        data.tradingExperience || null,
        data.referredByUserId || null,
        metadata ? JSON.stringify(metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async delete(userId) {
    await this.db.query('DELETE FROM user_profiles WHERE user_id = $1', [userId]);
  }
}
module.exports = ProfileRepository;
module.exports.ProfileRepository = ProfileRepository;
