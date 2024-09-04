/**
 * 數字欄位的類型。
 */
export enum NumberFieldType {
  /**
   * 整數，整數最多 15 位。
   */
  INTEGER,
  /**
   * 常用於描述總值，而不涉及每個單位的價值。
   * 小數位數依幣別 precision 顯示，整數最多 10 位。
   */
  AMOUNT,
  /**
   * 單位物品或服務的價值。
   * 小數位數最多 6 位，整數最多 10 位。
   */
  PRICE,
  /**
   * 小數最多 10 位，整數最多 6 位。
   */
  PROFIT_PRICE,
  /**
   * 小數最多 13 位，整數最多 3 位。
   */
  EXCHANGE_RATE,
  /**
   * 自定義。
   * 小數和整數位數自行定義。
   */
  CUSTOMER
}
