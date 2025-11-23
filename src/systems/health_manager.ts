export default class HealthManager {
  private maxHealth: number;
  private currentHealth: number;

  constructor(maxHealth: number = 100) {
    this.maxHealth = maxHealth;
    this.currentHealth = this.maxHealth;
  }

  /**
   * 데미지를 받아 체력을 감소시킵니다.
   * @param amount 데미지 양
   */
  public takeDamage(amount: number): void {
    this.currentHealth -= amount;
    if (this.currentHealth < 0) {
      this.currentHealth = 0;
    }
    console.log(`Took ${amount} damage, current health: ${this.currentHealth}`);
  }

  /**
   * 체력을 회복합니다.
   * @param amount 회복 양
   */
  public heal(amount: number): void {
    this.currentHealth += amount;
    if (this.currentHealth > this.maxHealth) {
      this.currentHealth = this.maxHealth;
    }
    console.log(`Healed ${amount}, current health: ${this.currentHealth}`);
  }

  public getCurrentHealth(): number {
    return this.currentHealth;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public isDead(): boolean {
    return this.currentHealth <= 0;
  }

  public resetHealth(): void {
    this.currentHealth = this.maxHealth;
    console.log(`Health reset to ${this.currentHealth}`);
  }
}
