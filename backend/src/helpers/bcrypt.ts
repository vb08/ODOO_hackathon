import bcrypt from "bcryptjs";

/**
 * Utility class for secure password cryptography.
 */
export class BcryptHelper {
  private static readonly SALT_ROUNDS = 10;

  /**
   * Hashes a plain-text password using salt.
   */
  public static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compares a plain-text password with a hash.
   */
  public static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
