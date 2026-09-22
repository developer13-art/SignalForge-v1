/**
 * Profile Repository
 *
 * @module signalforge/server/modules/users/profile/repository
 */

import { getDatabase } from '../../../bootstrap/initDatabase.js';

export class ProfileRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async findByUserId(userId) {
    const result = await this.db.query(
      `SELECT id, user_id, date_of_birth, nationality, country, city, state,
              address, postal_code, timezone, language, trading_experience,
              bio, preferences, created_at, updated_at
         FROM user_profiles
        WHERE user_id = $1
        LIMIT 1`,
      [userId],
    );
    return result.rows[0] || null;
  }

  async upsert(userId, data) {
    const result = await this.db.query(
      `INSERT INTO user_profiles (
         user_id, date_of_birth, nationality, country, city, state,
         address, postal_code, timezone, language, trading_experience,
         bio, preferences, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         date_of_birth = COALESCE(EXCLUDED.date_of_birth, user_profiles.date_of_birth),
         nationality = COALESCE(EXCLUDED.nationality, user_profiles.nationality),
         country = COALESCE(EXCLUDED.country, user_profiles.country),
         city = COALESCE(EXCLUDED.city, user_profiles.city),
         state = COALESCE(EXCLUDED.state, user_profiles.state),
         address = COALESCE(EXCLUDED.address, user_profiles.address),
         postal_code = COALESCE(EXCLUDED.postal_code, user_profiles.postal_code),
         timezone = COALESCE(EXCLUDED.timezone, user_profiles.timezone),
         language = COALESCE(EXCLUDED.language, user_profiles.language),
         trading_experience = COALESCE(EXCLUDED.trading_experience, user_profiles.trading_experience),
         bio = COALESCE(EXCLUDED.bio, user_profiles.bio),
         preferences = COALESCE(EXCLUDED.preferences, user_profiles.preferences),
         updated_at = NOW()
       RETURNING id, user_id, date_of_birth, nationality, country, city, state,
                 address, postal_code, timezone, language, trading_experience,
                 bio, preferences, created_at, updated_at`,
      [
        userId,
        data.dateOfBirth || null,
        data.nationality || null,
        data.country || null,
        data.city || null,
        data.state || null,
        data.address || null,
        data.postalCode || null,
        data.timezone || null,
        data.language || null,
        data.tradingExperience || null,
        data.bio || null,
        data.preferences ? JSON.stringify(data.preferences) : null,
      ],
    );
    return result.rows[0];
  }

  async delete(userId) {
    await this.db.query('DELETE FROM user_profiles WHERE user_id = $1', [userId]);
  }
}

export default ProfileRepository;